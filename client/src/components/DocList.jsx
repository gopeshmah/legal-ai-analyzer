import { useEffect, useState } from 'react';
import axios from 'axios';

const DocList = ({ refreshTrigger }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Re-fetch documents whenever refreshTrigger changes (e.g., after an upload)
  useEffect(() => {
    fetchDocs();
  }, [refreshTrigger]);

  const fetchDocs = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/documents');
      setDocuments(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load documents');
    } finally {
      setLoading(false);
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
        <div key={doc._id} className="glass-panel" style={{ 
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
          <div>
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
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocList;
