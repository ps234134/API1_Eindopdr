const express = require('express');
const app = express();
app.use(express.json());
const cors = require("cors");
app.use(cors("*"));
const { MongoClient } = require("mongodb");
const ObjectId = require('mongodb').ObjectId;
const connectionString = 'mongodb://127.0.0.1:27017/';
const { generateAccessToken, deleteAccessToken, verifyAccessToken, refreshAccessToken } = require('./tokenGeneration');


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
          log.info({ endpoint: '/api/register', email }, 'User registered');
          return res.status(201).json({ message: 'User registered successfully' });

        } else {
          log.error({ endpoint: '/api/register', email }, 'User registration failed');
          return res.status(500).json({ error: 'Failed to register user' });
        }
      } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'An error occurred during registration' });
      }
    });
    
   //---LOGIN---

app.post('/api/login', async (req, res) => {
  const { email, wachtwoord } = req.body;

  try {
    // Retrieve the user document from the database based on the email
    const user = await database.collection('gebruikers').findOne({ email });
    log.info({ endpoint: '/api/login', email }, 'User login attempt');

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare the given password with the encrypted password in the database
    const isPasswordValid = await bcrypt.compare(wachtwoord, user.wachtwoord);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate a new access token and update the user with the new access token
    const _bearer = generateAccessToken(email);
    await database.collection('gebruikers').updateOne(
      { email },
      { $set: { accesstoken: _bearer } }
    );

    log.info({ endpoint: '/api/login', email, _bearer }, 'User logged in');

    // Return the access token to the client
    return res.status(200).json({ _bearer });
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred during login' });
  }
});
    
    //---LOGOUT---                                                                    
   
    app.post('/api/logout', async (req, res) => {
      const accessToken = req.headers.authorization.split(" ")[1]; // Extract the access token from the Authorization header
      try {
        // Verify the access token
        const decodedToken = verifyAccessToken(accessToken);
        if (!decodedToken) {
          return res.status(401).json({ error: 'Invalid access token' });
        }
    
        // Log the logout event
        log.info({ endpoint: '/api/logout', accessToken }, 'User logged out');
    
        // Delete the access token from the database
        await deleteAccessToken(database, accessToken);
    
        return res.status(200).json({ message: 'User logged out successfully' });
      } catch (error) {
        console.error('Error during logout:', error);
        return res.status(500).json({ error: 'An error occurred during logout' });
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

      // CREATE Docent
      app.post('/api/docenten', async (req, res) => {
        log.info({ endpoint: '/api/docenten', body: req.body }, 'POST request docent received');
        const results = await database.collection('docenten').insertOne(req.body);
        if (results.acknowledged) return res.status(201).send("row inserted");
        log.error({ endpoint: '/api/docenten/:id', error: 'Bad Request' }, 'POST request docent failed');
        res.status(400).end();
      });
       
    
// PATCH docent
app.patch('/api/docenten/:id', async (req, res) => {
  const bearer = req.headers.authorization.split(" ")[1]; // Extract the access token from the Authorization header
  console.error('AccessToken path:', bearer);
  // log.info({ endpoint: '/api/docenten/:id', body: req.body }, 'PATCH request docent received');
  const query = { accessToken: bearer }; // Use the access token as the query parameter

  try {
    console.error('try patch docent');
    // log.info({ endpoint: '/api/docenten/:id', bearer: bearer }, 'Access token verification');
    const newBearer = refreshAccessToken(database, bearer);

    const results = await database.collection('gebruikers').updateOne(query, { $set: req.body });
    if (results.modifiedCount === 1) {
      return res.status(200).send("Row updated");
    } else {
      console.error({ endpoint: '/api/docenten/:id', error: 'Bad Request' }, 'PATCH request docent failed');
      return res.status(400).end();
    }
  } catch (error) {
    console.error({ endpoint: '/api/docenten/:id', error }, 'Error in PATCH request docent');
    return res.status(500).json({ error: 'An error occurred during PATCH request' });
  }
});


      // DELETE docent
      app.delete('/api/docenten/:id', async (req, res) => {
        log.info({ endpoint: '/api/docenten/:id' }, 'DELETE request docent received');
        const query = { "_id" : new ObjectId(req.params.id) };

        try {
          log.info({ endpoint: '/api/docenten/:id', bearer: _bearer }, 'Access token verification');
          _bearer = refreshAccessToken(_bearer);

          const result = await database.collection('docenten').deleteOne(query);
          if (result.acknowledged) {
            log.info({ endpoint: '/api/docenten/:id', bearer: _bearer }, 'Docent deleted');
            return res.status(200).send("Docent verwijderd");
          } else {
            log.error({ endpoint: '/api/docenten/:id', error: 'Bad Request' }, 'DELETE request docent failed');
            return res.status(400).send("Error 400: Docent niet verwijderd");
          }
        } catch (error) {
          log.error({ endpoint: '/api/docenten/:id', error }, 'Error in DELETE request docent');
          return res.status(500).json({ error: 'An error occurred during DELETE request' });
        }
      });

      
      
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