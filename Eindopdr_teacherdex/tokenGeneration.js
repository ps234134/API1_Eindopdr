const jwt = require('jsonwebtoken');
const secretKey = 'Kinga_Tutai'; // Replace with your secret key

// Function to generate a JWT access token
function generateAccessToken(email) {
  const payload = {
    userId: email._id, // Include any user data you want to store in the token
    // Add any additional claims or data to the payload if needed

  };

  const options = {
    expiresIn: '30s', // Set the token expiration time (e.g., 30 seconds)
  };

  return jwt.sign(payload, secretKey, options);
}

module.exports = {
  generateAccessToken,
};