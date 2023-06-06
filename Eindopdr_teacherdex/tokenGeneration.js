const jwt = require('jsonwebtoken');
const secretKey = 'Kinga_Tutai'; // Replace with your secret key

// Generates an access token and returns the token string
function generateAccessToken(email) {
  const payload = {
    userId: email,
    // Set the token expiration time (60 seconds from the current time)
    expiresAt: Math.floor(Date.now() / 1000) + 600,
  };

  const options = {
    // Set the token expiration time (30 seconds)
    expiresIn: '600s',
  };

  const accessToken = jwt.sign(payload, secretKey, options);
  console.log('Access Token login:', accessToken); // Log the access token
  return accessToken;
}

// Verifies the access token
function verifyAccessToken(accessToken) {
  try {
    const decoded = jwt.verify(accessToken, secretKey);
    return decoded;
  } catch (error) {
    return null;
  }
}

// function generateAccessTokenRequest(database, bearer) {
//   // Verify the existing access token
//   const decodedToken = verifyAccessToken(bearer);
//   if (!decodedToken) {
//     throw new Error('Invalid or expired access token');
//   }

//   // Generate a new access token using the email from the decoded token
//   const newToken = generateAccessToken(decodedToken.userId);

//   console.log('New Access Token:', newToken); // Log the new access token
//   return newToken;
// }

function generateAccessTokenRequest(database, userId) {
  const newToken = generateAccessToken(userId);
  console.log('New Access Token:', newToken);
  return newToken;
}


async function refreshAccessToken(database, oldToken) {
  try {
    const decodedToken = verifyAccessToken(oldToken);
    if (!decodedToken) {
      throw new Error('Invalid or expired access token');
    }

    const newToken = generateAccessTokenRequest(database, decodedToken.userId);
    console.log('New token:', newToken);

    console.log('Enters generate token due request');
    console.log('New token:', newToken);

    console.log('Old Token:', oldToken); // Add this line to log the oldToken value

    const result = await database.collection('gebruikers').updateOne(
      { accesstoken: oldToken },
      { $set: { accesstoken: newToken } }
    );

    console.log('Update result:', result);

    if (result.matchedCount === 1 && result.modifiedCount === 1) {
      console.log('Access token updated successfully');
      return newToken;
    } else {
      console.error('Failed to update access token');
      throw new Error('Failed to update access token');
    }
  } catch (error) {
    console.error('Error in refreshAccessToken:', error);
    throw error;
  }
}

// Verifies and refreshes the token if properly verified
// async function refreshAccessToken(database, oldToken) {
//   try {
//     console.log('Enters verify token');
//     const decodedToken = verifyAccessToken(oldToken);
//     if (!decodedToken) {
//       throw new Error('Invalid or expired access token');
//     }

//     const newToken = generateAccessTokenRequest(database, oldToken);
//     console.log('Enters generate token due request');
//     console.log('New token:', newToken);

//     console.log('Old Token:', oldToken); // Add this line to log the oldToken value

//     const result = await database.collection('gebruikers').updateOne(
//       { accesstoken: oldToken },
//       { $set: { accesstoken: newToken } }
//     );

//     console.log('Update result:', result);

//     if (result.matchedCount === 1 && result.modifiedCount === 1) {
//       console.log('Access token updated successfully');
//       return newToken;
//     } else {
//       console.error('Failed to update access token');
//       throw new Error('Failed to update access token');
//     }
//   } catch (error) {
//     console.error('Error in refreshAccessToken:', error);
//     throw error;
//   }
// }


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
