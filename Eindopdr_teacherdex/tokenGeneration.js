const jwt = require('jsonwebtoken');
const secretKey = 'Kinga_Tutai'; // Replace with your secret key

// generates an access token
function generateAccessToken(email) {
  const payload = {
    userId: email._id,
    // Set the token expiration time (60 seconds from the current time)
    expiresAt: Math.floor(Date.now() / 1000) + 600,
  };

  const options = {
    // Set the token expiration time (30 seconds)
    expiresIn: '600s',
  };

  return jwt.sign(payload, secretKey, options);
}

// verifies the access token
function verifyAccessToken(token) {
  try {
    console.log('Enters verify'); 
    console.log(token); 
    const decoded = jwt.verify(token, secretKey);
    console.log('Decoded Token:', decoded); 
    return decoded;
  } catch (error) {
    return null;
  }
}

// verifies and refreshes the token if properly verified
async function refreshAccessToken(database, oldToken) {
  try {
    console.log('Old Token:', oldToken);
    // Verify the old token, if not correct it throws an error and ceases the rest of the function
    const decodedToken = verifyAccessToken(oldToken);
    if (!decodedToken) {
      throw new Error('Invalid or expired access token');
    }
    console.log('Expected Access Token:', oldToken);
    // Generate the new token
    const newToken = generateAccessToken(decodedToken.email);

    // Update the old token in the database with the new token
    const result = await database.updateOne(
      { email: decodedToken.email, accessToken: oldToken },
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

// deletes the access token from the database
async function deleteAccessToken(database, accessToken) {
  try {
    // Get the access tokens collection from the database
    const collection = database.collection('gebruikers'); // Replace 'gebruikers' with the correct collection name

    // Delete the matching access token
    const result = await collection.updateOne(
      { accesstoken: accessToken.trim() }, // Replace 'accessToken' with the correct field name for access token
      { $unset: { accessToken: "" } } // Use $unset to remove the access token field from the document
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
  verifyAccessToken,
  deleteAccessToken,
  refreshAccessToken,
};
