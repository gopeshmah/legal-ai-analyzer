// ===================================
// server/index.js — Express Server Entry Point
// ===================================
// This is the main file that starts our backend server.
// It does 4 things:
//   1. Loads environment variables from .env
//   2. Connects to MongoDB Atlas (our database)
//   3. Sets up middleware (CORS, JSON parsing)
//   4. Defines routes and starts listening for requests

// --- Load environment variables FIRST (before anything else uses them) ---
// dotenv reads your .env file and makes those values available as process.env.VARIABLE_NAME
const dotenv = require('dotenv');
dotenv.config();

// --- Import dependencies ---
const express = require('express');  // Web framework for handling HTTP requests
const cors = require('cors');        // Allows our React frontend to talk to this backend
const mongoose = require('mongoose'); // ODM library to interact with MongoDB

// --- Create the Express app ---
const app = express();
const PORT = process.env.PORT || 5000;

// ===================================
// MIDDLEWARE SETUP
// ===================================
// Middleware = functions that run on every request before reaching your route handlers.
// Think of them as checkpoints every request passes through.

// CORS (Cross-Origin Resource Sharing)
// Without this, your browser would block the React app (localhost:5173)
// from making requests to the Express server (localhost:5000)
// because they're on different "origins" (different ports = different origin).
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173', // Vite's default port
  credentials: true // Allow cookies/auth headers to be sent
}));

// JSON body parser — lets us read JSON data from incoming POST/PUT requests
// Example: when the frontend sends { "email": "test@test.com", "password": "123" }
// this middleware parses it so we can access it via req.body.email
app.use(express.json({ limit: '10mb' })); // 10MB limit for large PDF text

// URL-encoded parser — for form submissions (less common with React, but good to have)
app.use(express.urlencoded({ extended: true }));

// ===================================
// ROUTES
// ===================================
app.use('/api/auth', require('./routes/auth'));

// ===================================
// HEALTH CHECK ROUTE
// ===================================
// A simple route to verify the server is running.
// Used by deployment platforms (Render) to monitor server health.
// Test it: open http://localhost:5000/api/health in your browser
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Legal AI Analyzer API is running',
    timestamp: new Date().toISOString()
  });
});

// ===================================
// MONGODB CONNECTION
// ===================================
// mongoose.connect() returns a Promise — it either connects successfully or throws an error.
// We use async/await pattern here wrapped in a function so we can handle errors cleanly.

const connectDB = async () => {
  try {
    // mongoose.connect() takes your MongoDB Atlas connection string
    // The string looks like: mongodb+srv://username:password@cluster.mongodb.net/database-name
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Exit the process with failure code — the server can't work without a database
    process.exit(1);
  }
};

// ===================================
// START SERVER
// ===================================
// First connect to MongoDB, THEN start listening for HTTP requests.
// If MongoDB fails, process.exit(1) stops everything before we start listening.

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  });
});
