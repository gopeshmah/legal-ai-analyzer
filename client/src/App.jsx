import { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DocViewer from './pages/DocViewer';

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
  
  // If not logged in, redirect them to the landing page
  if (!user) {
    return <Navigate to="/" />;
  }
  
  // Otherwise, render the requested page (Dashboard, etc.)
  return children;
};

// Redirect logged-in users away from public pages (landing, login, register)
const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2 style={{ color: '#8b5cf6' }}>Loading AI Analyzer...</h2>
      </div>
    );
  }
  
  // If already logged in, send them to the dashboard
  if (user) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

function App() {
  return (
    <div className="app-container">
      <Routes>
        {/* Public routes — redirect to dashboard if already logged in */}
        <Route path="/" element={
          <PublicRoute>
            <Landing />
          </PublicRoute>
        } />
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        
        {/* Protected routes — require authentication */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/document/:id" 
          element={
            <ProtectedRoute>
              <DocViewer />
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
