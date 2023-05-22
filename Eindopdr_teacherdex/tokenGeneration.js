const jwt = require('jsonwebtoken');
const secretKey = 'Kinga_Tutai'; // Replace with your secret key

// Function to generate a JWT access token
function generateAccessToken(email) {
  const payload = {
    userId: email._id, 

  };

  const options = {
    expiresIn: '30s', // Set the token expiration time (30 seconds)
  };

  return jwt.sign(payload, secretKey, options);
}

function verifyAccessToken(token) {
  try {
    const decoded = jwt.verify(token, secretKey);
    return decoded;
  } catch (error) {
    return null;
  }
}

// Function to delete the access token from the database
async function deleteAccessToken(accessToken) {
  try {
    const client = await MongoClient.connect('mongodb://localhost:27017');
    const db = client.db('teacherDex');
    const collection = db.collection('gebruikers');

    // Delete the matching the access token
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
};
