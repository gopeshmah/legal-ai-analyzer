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
    navigate('/');
  };

  const handleUploadSuccess = (data) => {
    console.log('Upload success:', data);
    setRefreshTrigger(prev => prev + 1); // Triggers re-fetch
  };

  return (
    <div className="p-6 md:p-10 max-w-[1200px] mx-auto">
      {/* Navbar area */}
      <div className="glass-panel flex flex-col sm:flex-row justify-between items-center gap-4 p-5 px-7 mb-10">
        <div>
          <h1 className="text-2xl font-bold gradient-text">
            Legal AI Analyzer
          </h1>
        </div>
        <div className="flex gap-5 items-center">
          <span className="text-slate-300">Welcome, <strong className="text-white">{user?.name}</strong></span>
          <button onClick={handleLogout} className="btn-primary !w-auto !py-2 !px-4">
            Logout
          </button>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="mt-5">
        <UploadZone onUploadSuccess={handleUploadSuccess} />
        <DocList refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
};

export default Dashboard;
