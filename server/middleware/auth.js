const jwt = require('jsonwebtoken');

// Middleware to protect routes that require authentication
const protect = async (req, res, next) => {
  let token;

  // Check if there is an authorization header and it begins with 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header format: "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];

      // Verify and decode token using our secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user info (id, email) to the req object so routes can use it
      req.user = decoded; 
      
      // Move to the next middleware or route handler
      next();
    } catch (error) {
      console.error('Auth Middleware Error:', error.message);
      res.status(401).json({ error: 'Not authorized, invalid token' });
    }
  } else {
    // No token found in headers
    res.status(401).json({ error: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
