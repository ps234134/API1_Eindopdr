const express = require('express');
const app = express();
app.use(express.json())    // nodig om inputdata in json te verwerken
const cors = require("cors")
app.use(cors("*"))        // Access-Control-Allow-Origin: * en preflight
const { MongoClient } = require("mongodb");
const ObjectId = require('mongodb').ObjectId;
const connectionString = 'mongodb://127.0.0.1:27017/'

MongoClient.connect(connectionString, { useUnifiedTopology: true })
.then(client => {

    const database = client.db('teacherDex')
    app.get('/', (req, res) => {
        res.send('zie document endpoints');
    })

    /* GET docenten */
    app.get('/api/docenten', async (req, res) => {  
        
    })

})