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
      <h3 className="mb-4 text-xl font-bold text-slate-100">Your Documents</h3>
      
      {documents.map((doc) => (
        <div
          key={doc._id}
          className="glass-panel p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(139,92,246,0.15)]"
          onClick={() => navigate(`/document/${doc._id}`)}
        >
          <div>
            <h4 className="text-lg font-semibold mb-2 text-slate-100">{doc.fileName}</h4>
            <div className="flex flex-wrap gap-4 text-slate-400 text-sm">
              <span>{(doc.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
              <span>{doc.pageCount} Pages</span>
              <span>{doc.chunkCount} AI Chunks</span>
              <span>Uploaded: {new Date(doc.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <span className={`px-4 py-1.5 rounded-full text-[0.85rem] font-semibold border
              ${doc.status === 'ready' 
                ? 'bg-green-500/15 text-green-400 border-green-500/30' 
                : 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30'
              }`}>
              {doc.status.toUpperCase()}
            </span>
            <button
              onClick={(e) => handleDelete(e, doc._id, doc.fileName)}
              disabled={deletingId === doc._id}
              className={`px-3.5 py-1.5 rounded-full text-[0.85rem] font-semibold border transition-all duration-200
                bg-red-500/10 text-red-400 border-red-500/30
                hover:bg-red-500/25 hover:border-red-500/60
                ${deletingId === doc._id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {deletingId === doc._id ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocList;
