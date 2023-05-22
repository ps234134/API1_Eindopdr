const express = require('express');
const app = express();
app.use(express.json());
const cors = require("cors");
app.use(cors("*"));
const { MongoClient } = require("mongodb");
const ObjectId = require('mongodb').ObjectId;
const connectionString = 'mongodb://127.0.0.1:27017/';
const { generateAccessToken, deleteAccessToken } = require('./tokenGeneration');


//--- LIBRARIES ----
// Import JsonWebToken for Token generation
const jwt = require('jsonwebtoken');
const secretKey = 'Tutai_Kinga';
//Import Bcrypt for encryption
const bcrypt = require('bcrypt');
// Import Bunyan and create a logger 
const bunyan = require('bunyan');

// makes a logging file called teacherDex in the root of the directory
const log = bunyan.createLogger({ name: 'teacherDex', streams: [{ path: './teacherDex.log' }] });
// export file as app for testing, see feature.test.js
module.exports = app;

MongoClient.connect(connectionString, { useUnifiedTopology: true })
.then(client => {

    const database = client.db('teacherDex')
    app.get('/', (req, res) => {
        res.send('zie document endpoints');
    })
    //----REGISTER---

    app.post('/api/register', async (req, res) => {
      const { naam, email, wachtwoord } = req.body;
    
      try {
        // Check if the email is already registered
        const existingUser = await database.collection('gebruikers').findOne({ email });
        if (existingUser) {
          return res.status(409).json({ error: 'Email is already registered' });
        }
        log.info({ endpoint: '/api/register', email }, 'User registered');
    
        // Hash the password before storing it to the database
        // 5 is the number of "salts" making the encryption stronger
        const hashedPassword = await bcrypt.hash(wachtwoord, 5);
    
        // Create a new user object
        const newUser = {
          naam,
          email,
          wachtwoord: hashedPassword,
          accesstoken: null
        };
    
        // Insert the new user into the gebruikers collection
        const result = await database.collection('gebruikers').insertOne(newUser);
    
        // Check if the user was successfully registered
        if (result.acknowledged) {
          return res.status(201).json({ message: 'User registered successfully' });
        } else {
          return res.status(500).json({ error: 'Failed to register user' });
        }
      } catch (error) {
        return res.status(500).json({ error: 'An error occurred during registration' });
      }
    });
    
    //---LOGIN---

    app.post('/api/login', async (req, res) => {
      const { email, wachtwoord } = req.body;
    
      // Retrieve the user document from the database based on the email
      const user = await database.collection('gebruikers').findOne({ email });
      log.info({ endpoint: '/api/login', email }, 'User logged in');
      if (!user) {
        return res.status(401).send('Invalid email');
      }
      log.info({ endpoint: '/api/login', email }, 'User logged in');
    
      //compare the given password with the encrypted password in the db
      const isPasswordValid = await bcrypt.compare(wachtwoord, user.wachtwoord);
    
      if (!isPasswordValid) {
        return res.status(401).send('Invalid  password');
      }
      log.info({ endpoint: '/api/login', email }, 'User logged in');
 
      // Generate a new access token
      const accessToken = generateAccessToken(user);
      log.info({ endpoint: '/api/login', email, accessToken }, 'User logged in');
      // Update the user  with the new access token according to the found email
      await database.collection('gebruikers').updateOne(
        { email },
        { $set: { accesstoken: accessToken } }
      );
    
      // Return the access token to the client
      res.send({ accessToken });
    });
    
    //---LOGOUT---                                                                    
  
    
    app.patch('/api/docenten/:id', async (req, res) => {
      log.info({ endpoint: '/api/docenten/:id', body: req.body }, 'PATCH request docent received');
      const query = { "_id" : new ObjectId(req.params.id) };
    
      // Verify access token
      const accessToken = req.headers.authorization;
      const decoded = verifyAccessToken(accessToken);
      if (!decoded || decoded.email !== user.email) {
        return res.status(401).send('Unauthorized');
      }
    
      const results = await database.collection('docenten').replaceOne(query, req.body);
      if (results.acknowledged) {
        return res.status(200).send("row updated");
      } else {
        log.error({ endpoint: '/api/docenten/:id', error: 'Bad Request' }, 'PATCH request docent failed');
        return res.status(400).end();
      }
    });
    
    app.delete('/api/docenten/:id', async (req, res) => {
      log.info({ endpoint: '/api/docenten/:id' }, 'DELETE request docent received');
      const query = { "_id" : new ObjectId(req.params.id) };
    
      // Verify access token
      const accessToken = req.headers.authorization;
      const decoded = verifyAccessToken(accessToken);
      if (!decoded || decoded.email !== user.email) {
        return res.status(401).send('Unauthorized');
      }
    
      const result = await database.collection('docenten').deleteOne(query);
      if (result.acknowledged) {
        deleteAccessToken(accessToken);
        return res.status(200).send("Docent verwijderd");
      } else {
        log.info({ endpoint: '/api/docenten/:id' }, 'DELETE request docent NOT received'); 
        return res.status(400).send("Error 400: Docent niet verwijderd");
      }
    });

    //---- DOCENTEN-----

        // GET docenten 
    app.get('/api/docenten', async (req, res) => {  
        log.info({ endpoint: '/api/docenten', query: req.query }, 'GET request docenten received');
        const query = 'naam' in req.query  ? {naam : new RegExp(req.query.naam,'i')} : {}
        const sort = 'sort' in req.query  ? {naam : 1} : {}
        const results = await database.collection('docenten').find(query).sort(sort).toArray();
        res.send(results);
        

    })

    
        // GET docent
    app.get('/api/docenten/:id', async (req, res) => {
        const query = { "_id" : new ObjectId(req.params.id) };
        log.info({ endpoint: '/api/docenten/:id', query: query }, 'GET request docent received');
        const results = await database.collection('docenten').findOne(query);
        res.send(results);
      })

       // GET docenten met veld
       // api/docenten?naam=ron&sort=email 
    app.get('/api/docenten', async (req, res) => {
        const query = { "functie_id" : req.params.id };       
        const sort = 'sort' in req.query  ? {naam : 1} : {}
        log.info({ endpoint: '/api/docenten', query: query }, 'GET request docent sort received');
        const results = await database.collection('docenten').find(query).sort(sort).toArray();
        res.send(results);
      })

      app.post('/api/docenten', async (req, res) => {
        log.info({ endpoint: '/api/docenten', body: req.body }, 'POST request docent received');
        const results = await database.collection('docenten').insertOne(req.body);
        if (results.acknowledged) return res.status(201).send("row inserted");
        log.error({ endpoint: '/api/docenten/:id', error: 'Bad Request' }, 'POST request docent failed');
        res.status(400).end();
      });
       
         
      // PATCH docent
      app.patch('/api/docenten/:id', async (req, res) => {
        log.info({ endpoint: '/api/docenten/:id', body: req.body }, 'PATCH request docent received');
        const query = { "_id" : new ObjectId(req.params.id) };
        const results = await database.collection('docenten').replaceOne(query, req.body);
        

        if (results.acknowledged) return res.status(200).send("row updated");
        log.error({ endpoint: '/api/docenten/:id', error: 'Bad Request' }, 'PATCH request docent failed');
        res.status(400).end();
      });

      // DELETE docent
    app.delete('/api/docenten/:id', async (req, res) => {
        log.info({ endpoint: '/api/docenten/:id' }, 'DELETE request docent received');
        const query = { "_id" : new ObjectId(req.params.id) }
        const result = await database.collection('docenten').deleteOne(query)

        if (result.acknowledged) {
            return res.status(200).send("Docent verwijderd");
          } else {
            // this might break the code delete if so
            log.info({ endpoint: '/api/docenten/:id' }, 'DELETE request docent NOT received'); 
            return res.status(400).send("Error 400: Docent niet verwijderd");
          }
      })  
      
      
     //---- VAKKEN-----

             // GET vakken 
    app.get('/api/vakken', async (req, res) => {  
      //logging
      log.info({ endpoint: '/api/vakken', query: req.query }, 'GET request vakken received');
        const query = 'naam' in req.query  ? {naam : new RegExp(req.query.naam,'i')} : {}
        const sort = 'sort' in req.query  ? {naam : 1} : {}
        const results = await database.collection('vakken').find(query).sort(sort).toArray()
        res.send(results)
        
    })

    
        // GET vak
    app.get('/api/vakken/:id', async (req, res) => {
        const query = { "_id" : new ObjectId(req.params.id) };
        //logging
        log.info({ endpoint: '/api/vakken/:id', query: query }, 'GET request vak received');
        console.log(query)
        const results = await database.collection('vakken').findOne(query)
        res.send(results)
      })

    //---- KLASSEN-----

             // GET klassen 
    app.get('/api/klassen', async (req, res) => {  
      //logging
      log.info({ endpoint: '/api/klassen', query: req.query }, 'GET request klassen received');
        const query = 'naam' in req.query  ? {naam : new RegExp(req.query.naam,'i')} : {}
        const sort = 'sort' in req.query  ? {naam : 1} : {}
        
        const results = await database.collection('klassen').find(query).sort(sort).toArray()
        res.send(results)
        
    })

    
        // GET klas
    app.get('/api/klassen/:id', async (req, res) => {
        const query = { "_id" : new ObjectId(req.params.id) };
        //logging
        log.info({ endpoint: '/api/klassen/:id', query: query }, 'GET request klas received');
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
   
    .catch((error) => {
      //logging
      log.error({ err: error }, 'Error request failed');
    });