const express = require('express');
const app = express();
app.use(express.json());
const cors = require("cors");
app.use(cors("*"));
const { MongoClient } = require("mongodb");
const ObjectId = require('mongodb').ObjectId;
const connectionString = 'mongodb://127.0.0.1:27017/';
const { generateAccessToken } = require('./tokenGeneration');

//--- LIBRARIES ----
// Import Bcrypt for encryption
const bcrypt = require('bcrypt');
// Import Bunyan and create a logger 
const bunyan = require('bunyan');

// makes a logging file called RegisterLogin in the root of the directory
const log = bunyan.createLogger({ name: 'RegisterLogin', streams: [{ path: './RegisterLogin.log' }] });
// export file as app for testing, see feature.test.js
module.exports = app;

MongoClient.connect(connectionString, { useUnifiedTopology: true })
  .then(client => {
    const database = client.db('teacherDex')
    app.get('/', (req, res) => {  
      res.send('zie document endpoints');
    });

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
        log.info(`User ${newUser.email} registered`);

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
      log.info(`User ${user} is trying to log in`);

      if (!user) {
        return res.status(401).send('Invalid email');
      }
      log.info(`User ${user} is trying to log in with an invalid email`);

      // Compare the given password with the encrypted password in the db
      const isPasswordValid = await bcrypt.compare(wachtwoord, user.wachtwoord);

      if (!isPasswordValid) {
        return res.status(401).send('Invalid password');
      }
      log.info(`User ${user} is trying to log in with an invalid password`);
      // Generate a new access token
      const accessToken = generateAccessToken(user);
      log.info(`User ${user.email} logged in`);

      // Update the user document with the new access token according to the found email
      await database.collection('gebruikers').updateOne(
        { email },
        { $set: { accesstoken: accessToken } }
      );

      // Return the access token to the client
      res.send({ accesstoken });
    
    });

})