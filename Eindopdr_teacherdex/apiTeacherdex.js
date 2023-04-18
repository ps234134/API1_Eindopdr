const express = require('express');
const app = express();
app.use(express.json())    // nodig om inputdata in json te verwerken
const cors = require("cors")
app.use(cors("*"))        // Access-Control-Allow-Origin: * en preflight
const { MongoClient } = require("mongodb");
const ObjectId = require('mongodb').ObjectId;
const connectionString = 'mongodb://127.0.0.1:27017/'
// export file as app for testing purposes
module.exports = app;

MongoClient.connect(connectionString, { useUnifiedTopology: true })
.then(client => {

    const database = client.db('teacherDex')
    app.get('/', (req, res) => {
        res.send('zie document endpoints');
    })

    //---- DOCENTEN-----

        // GET docenten 
    app.get('/api/docenten', async (req, res) => {  
        console.log(req.query.naam);
        console.log(req.query.sort);
        const query = 'naam' in req.query  ? {naam : new RegExp(req.query.naam,'i')} : {}
        const sort = 'sort' in req.query  ? {naam : 1} : {}
        const results = await database.collection('docenten').find(query).sort(sort).toArray()
        res.send(results)
        
    })

    
        // GET docent
    app.get('/api/docenten/:id', async (req, res) => {
        const query = { "_id" : new ObjectId(req.params.id) };
        console.log(query)
        const results = await database.collection('docenten').findOne(query)
        res.send(results)
      })

       // GET docenten met veld
       // api/docenten?naam=ron&sort=email 
    app.get('/api/docenten', async (req, res) => {


        const query = { "functie_id" : req.params.id };       
        const sort = 'sort' in req.query  ? {naam : 1} : {}
        const results = await database.collection('docenten').find(query).sort(sort).toArray()
        res.send(results)
      })

        // POST docent
        app.post('/api/docenten', async (req, res) => {
            const results = await database.collection('docenten').insertOne(req.body)
            if (results.acknowledged) return res.status(201).send("row inserted")
            res.status(400).end()
          })   
         
        //   app.post("/expense", (req, res) => {
        //     expenses.insertOne(
        //     {
        //     trip: req.body.trip,
        //     date: req.body.date,
        //     amount: req.body.amount,
        //     category: req.body.category,
        //     description: req.body.description,
        //     },
        //     (err, result) => {
        //     if (err) {
        //     console.error(err)
        //     res.status(500).json({ err: err })
        //     return
        //     }
        //     res.status(200).json({ ok: true })
        //     }
        //     )
        //     })

      // PATCH docent
      app.patch('/api/docenten/:id', async (req, res) => {
        console.log(req.params.id);
        const query = { "_id" : new ObjectId(req.params.id) };
        const results = await database.collection('docenten').replaceOne(query, req.body)
        console.log(results)
        if (results.acknowledged) return res.status(200).send("row updated")
        res.status(400).end()
      });

      // DELETE docent
    app.delete('/api/docenten/:id', async (req, res) => {
        const query = { "_id" : new ObjectId(req.params.id) }
        const result = await database.collection('docenten').deleteOne(query)

        if (result.acknowledged) {
            return res.status(200).send("Docent verwijderd");
          } else {
            return res.status(400).send("Error 400: Docent niet verwijderd");
          }
      })  
      
      
     //---- VAKKEN-----

             // GET vakken 
    app.get('/api/vakken', async (req, res) => {  

        const query = 'naam' in req.query  ? {naam : new RegExp(req.query.naam,'i')} : {}
        const sort = 'sort' in req.query  ? {naam : 1} : {}
        const projection = { _id: 1, naam: 1 } // include only _id and naam fields
        const results = await database.collection('vakken').find(query).sort(sort).projection(projection).toArray()
        res.send(results)
        
    })

    
        // GET vak
    app.get('/api/vakken/:id', async (req, res) => {
        const query = { "_id" : new ObjectId(req.params.id) };
        console.log(query)
        const results = await database.collection('vakken').findOne(query)
        res.send(results)
      })

    //---- KLASSEN-----

             // GET klassen 
    app.get('/api/klassen', async (req, res) => {  

        const query = 'naam' in req.query  ? {naam : new RegExp(req.query.naam,'i')} : {}
        const sort = 'sort' in req.query  ? {naam : 1} : {}
        const projection = { _id: 1, naam: 1 } // include only _id and naam fields
        const results = await database.collection('klassen').find(query).sort(sort).project(projection).toArray()
        res.send(results)
        
    })

    
        // GET klas
    app.get('/api/klassen/:id', async (req, res) => {
        const query = { "_id" : new ObjectId(req.params.id) };
        console.log(query)
        const results = await database.collection('klassen').findOne(query)
        res.send(results)
      })



      const server = app.listen(8081, () => {
        const host = server.address().address;
        const port = server.address().port;
        console.log("Luister op http://%s%s", host, port);
      })    
    })
   
.catch(console.error)