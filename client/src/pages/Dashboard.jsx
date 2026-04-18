import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Navbar area */}
      <div className="glass-panel" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '20px 30px',
        marginBottom: '40px' 
      }}>
        <div>
          <h1 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '700',
            background: 'linear-gradient(90deg, #e2e8f0 0%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Legal AI Analyzer
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span style={{ color: '#cbd5e1' }}>Welcome, <strong style={{ color: 'white' }}>{user?.name}</strong></span>
          <button onClick={handleLogout} className="btn-primary" style={{ width: 'auto', padding: '8px 16px' }}>
            Logout
          </button>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="glass-panel" style={{ padding: '60px 40px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '15px' }}>Dashboard Area</h2>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
          We will build the PDF Upload Zone and Document List here in Phase 3.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
