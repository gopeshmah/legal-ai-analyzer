import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create a context to share auth data across the app
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if we already have a logged-in user in localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      // Automatically attach the JWT token to all future API requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      const userData = response.data;
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData)); // Persist session
      axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
      
      return { success: true };
    } catch (error) {
      // Return the error so our UI can show it
      return { success: false, message: error.response?.data?.error || 'Login failed' };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', { name, email, password });
      const userData = response.data;
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData)); // Persist session
      axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
      
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || 'Registration failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    // Remove the authorization header since we are logging out
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
