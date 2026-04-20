// Centralized API base URL configuration
// In development: uses localhost:5000
// In production: set VITE_API_URL in your .env file to your deployed backend URL
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default API_BASE;
