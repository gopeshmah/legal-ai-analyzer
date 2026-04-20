const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to generate JWT Token
const generateToken = (id, email) => {
  return jwt.sign({ id, email }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token expires in 30 days
  });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Create user (password hashing is handled by the pre-save hook in User model)
    const user = await User.create({
      name,
      email,
      password // Handled securely
    });

    if (user) {
      // Send back basic info + token
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id, user.email),
      });
    } else {
      res.status(400).json({ error: 'Invalid user data received' });
    }
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check input
    if (!email || !password) {
       return res.status(400).json({ error: 'Please provide email and password' });
    }

    // Check if user exists
    const user = await User.findOne({ email });

    // Important: comparePassword runs the bcrypt.compare() check we wrote in User model
    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id, user.email),
      });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

module.exports = {
  registerUser,
  loginUser
};
