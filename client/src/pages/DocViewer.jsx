import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import ChatWindow from '../components/ChatWindow';
import API_BASE from '../config/api';

const DocViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading: authLoading } = useContext(AuthContext);
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);

  // Wait until auth is fully loaded before fetching (fixes race condition)
  useEffect(() => {
    if (authLoading) return; // Don't fetch until token is restored from localStorage

    const fetchDoc = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/api/documents`);
        const doc = data.find(d => d._id === id);
        if (doc) setDocument(doc);
      } catch (err) {
        console.error("Failed to load doc", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [id, authLoading]);

  if (loading || authLoading) return <div style={{ padding: '40px', color: '#f8fafc' }}>Loading document context...</div>;

  if (!document) {
    return (
      <div style={{ padding: '40px', color: '#ef4444' }}>
        Document not found. <button onClick={() => navigate('/')} style={{ background:'none', color:'#8b5cf6', border:'none', cursor:'pointer' }}>Go Back</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
      
      {/* Left Column: Doc Metadata */}
      <div>
        <button 
          onClick={() => navigate('/')} 
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#94a3b8', 
            cursor: 'pointer',
            marginBottom: '20px',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
          ← Back to Dashboard
        </button>
        
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.4rem', color: '#f8fafc', marginBottom: '10px' }}>{document.fileName}</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: '#94a3b8' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Status:</span>
              <span style={{ color: document.status === 'ready' ? '#4ade80' : '#facc15' }}>{document.status.toUpperCase()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Pages:</span>
              <span>{document.pageCount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Size:</span>
              <span>{(document.fileSize / 1024 / 1024).toFixed(2)} MB</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>AI Chunks:</span>
              <span>{document.chunkCount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Uploaded:</span>
              <span>{new Date(document.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: 'rgba(56, 189, 248, 0.1)', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <p style={{ color: '#38bdf8', fontSize: '0.9rem', margin: 0 }}>
              <strong>AI Ready:</strong> This document has been embedded and is stored securely in Pinecone. You can now chat with it below.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Chat Window */}
      <div>
        {document.status === 'ready' ? (
          <ChatWindow documentId={document._id} />
        ) : (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: '#facc15' }}>
            This document is still processing. Please wait or refresh...
          </div>
        )}
      </div>
      
    </div>
  );
};

export default DocViewer;
