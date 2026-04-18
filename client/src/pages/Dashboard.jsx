import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UploadZone from '../components/UploadZone';
import DocList from '../components/DocList';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  // Using a numeric trigger to force DocList to re-fetch when an upload completes
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleUploadSuccess = (data) => {
    console.log('Upload success:', data);
    setRefreshTrigger(prev => prev + 1); // Triggers re-fetch
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
      <div style={{ marginTop: '20px' }}>
        <UploadZone onUploadSuccess={handleUploadSuccess} />
        <DocList refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
};

export default Dashboard;
