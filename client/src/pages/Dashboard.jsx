import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UploadZone from '../components/UploadZone';
import DocList from '../components/DocList';
import ThemeToggle from '../components/ThemeToggle';

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
    <div className="p-6 md:p-10 max-w-[1200px] mx-auto min-h-screen flex flex-col">
      {/* Navbar area */}
      <div className="glass-panel flex flex-col sm:flex-row justify-between items-center gap-4 p-5 px-8 mb-8 animate-fade-in">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚖️</span>
          <h1 className="text-2xl font-bold gradient-text m-0">
            Legal AI Analyzer
          </h1>
        </div>
        <div className="flex gap-4 sm:gap-6 items-center">
          <ThemeToggle />
          <div className="hidden sm:flex items-center gap-2 dark:text-slate-300 text-slate-600 dark:bg-white/[0.03] bg-black/[0.03] px-4 py-2 rounded-full border dark:border-white/[0.05] border-slate-200 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-[0.9rem]">Welcome, <strong className="dark:text-white text-slate-900 font-semibold">{user?.name}</strong></span>
          </div>
          <button onClick={handleLogout} className="text-sm font-medium dark:text-slate-400 text-slate-500 dark:hover:text-white hover:text-slate-800 transition-colors duration-200">
            Logout
          </button>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <UploadZone onUploadSuccess={handleUploadSuccess} />
        <DocList refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
};

export default Dashboard;
