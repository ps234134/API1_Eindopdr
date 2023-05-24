const jwt = require('jsonwebtoken');
const secretKey = 'Kinga_Tutai'; // Replace with your secret key

//  generates an access token
function generateAccessToken(email) {
  const payload = {
    userId: email._id, 
     // Set the token expiration time (30 seconds from the current time)
     expiresAt: Math.floor(Date.now() / 1000) + 30, 

  };

  const options = {
    // Set the token expiration time (30 seconds)
    expiresIn: '30s', 
  };

  return jwt.sign(payload, secretKey, options);
}

//verifies the acess token
function verifyAccessToken(token) {
  try {
    const decoded = jwt.verify(token, secretKey);
    return decoded;
  } catch (error) {
    return null;
  }
}

// verifies and refreshes the token if properly verified
async function refreshAccessToken(email, oldToken) {
  // Verify the old token, if not correct it throws an error and ceases the rest of the function of refresh AccesToken
  const decodedToken = verifyAccessToken(oldToken);
  if (!decodedToken) {
    throw new Error('Invalid or expired access token');
  }
 // generates the new token
  const newToken = generateAccessToken(email);

  try {
    // Checks if the email and the old token in the db match, then updates the old token
    const collection = database.collection('gebruikers');
    const result = await collection.updateOne(
      { email: email, accesstoken: oldToken },
      { $set: { accesstoken: newToken } }
    );

    if (result.modifiedCount === 1) {
      return newToken;
    } else {
      throw new Error('Failed to update access token');
    }
  } catch (error) {
    throw error;
  }
}


//deletes the access token from the database
async function deleteAccessToken(accessToken) {
  try {
    const client = await MongoClient.connect('mongodb://localhost:27017');
    const db = client.db('teacherDex');
    const collection = db.collection('gebruikers');

    // Delete the matching  access token
    const query = { accessToken: accessToken };
    const result = await collection.deleteOne(query);

    if (result.deletedCount === 1) {
      console.log('Access token deleted successfully');
    } else {
      console.log('Access token not found');
    }

    client.close();
  } catch (error) {
    console.error('Error deleting access token:', error);
  }
}

module.exports = {
  generateAccessToken,
  verifyAccessToken,
  deleteAccessToken,
  refreshAccessToken,
};


//TO-DO
//- stuur oud token en emaik mee als identifier als je de token wilt gebruiken ipv user
//- roep refresh token bij iedere request aan om de token te vernieuwen