const jwt = require('jsonwebtoken');
const secretKey = 'Kinga_Tutai'; // Replace with your secret key

class UserData {
  constructor() {
    this.UserEmail = null;
  }
}

// Generates an access token and returns the userData object
function generateAccessToken(email) {
  const userData = new UserData();
  userData.UserEmail = email;

  console.log('Email:', email); // Log the email
  console.log('EmailClass:', userData.UserEmail); // Log the email
  const payload = {
    userId: email,
    // Set the token expiration time (60 seconds from the current time)
    expiresAt: Math.floor(Date.now() / 1000) + 600,
  };

  const options = {
    // Set the token expiration time (30 seconds)
    expiresIn: '600s',
  };

  const token = jwt.sign(payload, secretKey, options);
  console.log('Access Token login:', token); // Log the access token
  return { token, userData };
}

// Verifies the access token
function verifyAccessToken(token) {
  try {
    const decoded = jwt.verify(token, secretKey);
    return decoded;
  } catch (error) {
    return null;
  }
}

function generateAccessTokenRequest(database, bearer) {
  // Verify the existing access token
  const decodedToken = verifyAccessToken(bearer);
  if (!decodedToken) {
    throw new Error('Invalid or expired access token');
  }

  // Generate a new access token using the email from the decoded token
  const { token, userData } = generateAccessToken(decodedToken.userId);

  console.log('New Access Token:', token); // Log the new access token
  return token;
}

// Verifies and refreshes the token if properly verified
async function refreshAccessToken(database, oldToken) {
  try {
    console.log('Enters verify token');
    const decodedToken = verifyAccessToken(oldToken);
    if (!decodedToken) {
      throw new Error('Invalid or expired access token');
    }

    const newToken = generateAccessTokenRequest(database, oldToken);
    console.log('Enters generate token due request');
    const result = await database.collection('gebruikers').updateOne(
      { accessToken: oldToken },
      { $set: { accessToken: newToken } }
    );

    if (result.modifiedCount === 1) {
      console.log('Access token updated successfully');
      return newToken;
    } else {
      throw new Error('Failed to update access token');
    }
  } catch (error) {
    console.error('Error in refreshAccessToken:', error);
    throw error;
  }
}

// Deletes the access token from the database
async function deleteAccessToken(database, accessToken) {
  try {
    const collection = database.collection('gebruikers');

    const result = await collection.updateOne(
      { accessToken: accessToken.trim() },
      { $unset: { accessToken: "" } }
    );

    if (result.modifiedCount === 1) {
      console.log('Access token deleted successfully');
    } else {
      console.log('Access token not found');
    }
  } catch (error) {
    console.error('Error deleting access token:', error);
  }
}

module.exports = {
  generateAccessToken,
  generateAccessTokenRequest,
  verifyAccessToken,
  deleteAccessToken,
  refreshAccessToken,
};
