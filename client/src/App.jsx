import { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

// A wrapper component for routes that require the user to be logged in
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2 style={{ color: '#8b5cf6' }}>Loading AI Analyzer...</h2>
      </div>
    );
  }
  
  // If not logged in, redirect them to the login page
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // Otherwise, render the requested page (Dashboard, etc.)
  return children;
};

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* All routes inside ProtectedRoute can only be accessed if logged in */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch-all fallback route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  )
}

export default App;
