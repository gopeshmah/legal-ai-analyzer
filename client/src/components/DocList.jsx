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
    // Stop the click from navigating to DocViewer
    e.stopPropagation();
    
    if (!window.confirm(`Delete "${fileName}"? This will permanently remove the document and all its AI data.`)) {
      return;
    }

    setDeletingId(docId);
    try {
      await axios.delete(`${API_BASE}/api/documents/${docId}`);
      // Remove from local state immediately for snappy UX
      setDocuments(prev => prev.filter(doc => doc._id !== docId));
    } catch (err) {
      console.error('Delete failed:', err);
      alert(err.response?.data?.error || 'Failed to delete document');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div style={{ color: '#94a3b8', padding: '20px', textAlign: 'center' }}>Loading your secure documents...</div>;
  if (error) return <div className="error-message">{error}</div>;

  if (documents.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>No documents uploaded yet. Upload a PDF above to get started!</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
      <h3 style={{ marginBottom: '15px', fontSize: '1.4rem', color: '#f8fafc' }}>Your Documents</h3>
      
      {documents.map((doc) => (
        <div key={doc._id} className="glass-panel" onClick={() => navigate(`/document/${doc._id}`)} style={{ 
          padding: '24px', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 10px 25px rgba(139, 92, 246, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(0, 0, 0, 0.3)';
        }}
        >
          <div>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#f8fafc' }}>{doc.fileName}</h4>
            <div style={{ display: 'flex', gap: '20px', color: '#94a3b8', fontSize: '0.9rem' }}>
              <span>{(doc.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
              <span>{doc.pageCount} Pages</span>
              <span>{doc.chunkCount} AI Chunks</span>
              <span>Uploaded: {new Date(doc.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ 
              padding: '6px 16px', 
              borderRadius: '20px', 
              fontSize: '0.85rem',
              fontWeight: '600',
              backgroundColor: doc.status === 'ready' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
              color: doc.status === 'ready' ? '#4ade80' : '#facc15',
              border: `1px solid ${doc.status === 'ready' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(234, 179, 8, 0.3)'}`
            }}>
              {doc.status.toUpperCase()}
            </span>
            <button
              onClick={(e) => handleDelete(e, doc._id, doc.fileName)}
              disabled={deletingId === doc._id}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: deletingId === doc._id ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: deletingId === doc._id ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (deletingId !== doc._id) {
                  e.target.style.background = 'rgba(239, 68, 68, 0.25)';
                  e.target.style.borderColor = 'rgba(239, 68, 68, 0.6)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                e.target.style.borderColor = 'rgba(239, 68, 68, 0.3)';
              }}
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
