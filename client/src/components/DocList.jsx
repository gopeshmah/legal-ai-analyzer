import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE from '../config/api';

const DocList = ({ refreshTrigger }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  // Re-fetch documents whenever refreshTrigger changes (e.g., after an upload)
  useEffect(() => {
    fetchDocs();
  }, [refreshTrigger]);

  const fetchDocs = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/documents`);
      setDocuments(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, docId, fileName) => {
    e.stopPropagation();
    
    if (!window.confirm(`Delete "${fileName}"? This will permanently remove the document and all its AI data.`)) {
      return;
    }

    setDeletingId(docId);
    try {
      await axios.delete(`${API_BASE}/api/documents/${docId}`);
      setDocuments(prev => prev.filter(doc => doc._id !== docId));
    } catch (err) {
      console.error('Delete failed:', err);
      alert(err.response?.data?.error || 'Failed to delete document');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className="text-slate-400 p-5 text-center">Loading your secure documents...</div>;
  if (error) return <div className="error-message">{error}</div>;

  if (documents.length === 0) {
    return (
      <div className="glass-panel p-10 text-center">
        <p className="text-slate-400 text-lg">No documents uploaded yet. Upload a PDF above to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      <h3 className="mb-4 text-xl font-bold dark:text-slate-100 text-slate-800">Your Documents</h3>
      
      {documents.map((doc, idx) => (
        <div
          key={doc._id}
          className="group relative glass-panel p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(139,92,246,0.15)] hover:border-violet-primary/30 animate-slide-up overflow-hidden"
          style={{ animationDelay: `${idx * 0.05}s` }}
          onClick={() => navigate(`/document/${doc._id}`)}
        >
          {/* Subtle gradient hover effect on the left edge */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-violet-secondary to-violet-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="flex-1">
            <h4 className="text-xl font-bold mb-3 dark:text-slate-100 text-slate-800 group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors flex items-center gap-2">
              <svg className="w-5 h-5 text-violet-primary/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              {doc.fileName}
            </h4>
            
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 dark:text-slate-400 text-slate-500 text-[0.85rem] font-medium">
              <span className="flex items-center gap-1.5 dark:bg-white/[0.03] bg-black/[0.03] px-2 py-1 rounded">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
                {(doc.fileSize / (1024 * 1024)).toFixed(2)} MB
              </span>
              <span className="flex items-center gap-1.5 dark:bg-white/[0.03] bg-black/[0.03] px-2 py-1 rounded">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                {doc.pageCount} Pages
              </span>
              <span className="flex items-center gap-1.5 dark:bg-white/[0.03] bg-black/[0.03] px-2 py-1 rounded">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                {doc.chunkCount} AI Chunks
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                Uploaded: {new Date(doc.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            {doc.summary && (
              <p className="mt-4 dark:text-slate-400 text-slate-600 text-[0.9rem] leading-relaxed line-clamp-2 pl-3 border-l-2 border-violet-primary/30 dark:bg-violet-primary/[0.02] bg-violet-primary/[0.05] py-1">
                <span className="font-semibold text-violet-600 dark:text-violet-300 mr-1">Insight:</span>
                {doc.summary}
              </p>
            )}
          </div>
          
          <div className="flex sm:flex-col gap-3 items-end justify-between h-full">
            <span className={`px-4 py-1.5 rounded-full text-[0.8rem] font-bold tracking-wider flex items-center gap-2 border
              ${doc.status === 'ready' 
                ? 'bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_15px_rgba(74,222,128,0.1)]' 
                : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
              }`}>
              {doc.status === 'ready' && <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80]"></span>}
              {doc.status.toUpperCase()}
            </span>
            
            <button
              onClick={(e) => handleDelete(e, doc._id, doc.fileName)}
              disabled={deletingId === doc._id}
              title="Delete Document"
              className={`p-2.5 rounded-lg border transition-all duration-300 flex items-center justify-center
                bg-white/[0.02] border-white/[0.05] text-slate-400
                hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400
                ${deletingId === doc._id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {deletingId === doc._id ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocList;
