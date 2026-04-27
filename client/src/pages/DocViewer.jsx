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
  const [summarizing, setSummarizing] = useState(false);

  // Wait until auth is fully loaded before fetching (fixes race condition)
  useEffect(() => {
    if (authLoading) return;

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

  const handleGenerateSummary = async () => {
    setSummarizing(true);
    try {
      const { data } = await axios.post(`${API_BASE}/api/documents/${id}/summary`);
      setDocument(prev => ({ ...prev, summary: data.summary }));
    } catch (err) {
      console.error('Summary generation failed:', err);
      alert(err.response?.data?.error || 'Failed to generate summary');
    } finally {
      setSummarizing(false);
    }
  };

  if (loading || authLoading) {
    return <div className="p-10 text-slate-100">Loading document context...</div>;
  }

  if (!document) {
    return (
      <div className="p-10 text-red-400">
        Document not found.{' '}
        <button onClick={() => navigate('/dashboard')} className="bg-transparent text-violet-primary border-none cursor-pointer hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-7">
      
      {/* Left Column: Doc Metadata */}
      <div>
        <button 
          onClick={() => navigate('/dashboard')} 
          className="bg-transparent border-none text-slate-400 cursor-pointer mb-5 text-base flex items-center gap-2 hover:text-violet-primary transition-colors duration-200">
          ← Back to Dashboard
        </button>
        
        <div className="glass-panel p-6">
          <h2 className="text-xl font-bold text-slate-100 mb-2.5">{document.fileName}</h2>
          
          <div className="flex flex-col gap-2.5 text-slate-400">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={document.status === 'ready' ? 'text-green-400' : 'text-yellow-300'}>{document.status.toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span>Pages:</span>
              <span>{document.pageCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Size:</span>
              <span>{(document.fileSize / 1024 / 1024).toFixed(2)} MB</span>
            </div>
            <div className="flex justify-between">
              <span>AI Chunks:</span>
              <span>{document.chunkCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Uploaded:</span>
              <span>{new Date(document.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          
          {/* Document Summary Section */}
          {document.summary ? (
            <div className="mt-5 p-4 rounded-lg bg-violet-primary/5 border border-violet-primary/20">
              <h3 className="text-sm font-semibold text-violet-light mb-2 flex items-center gap-2">
                📝 AI Summary
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line m-0">
                {document.summary}
              </p>
            </div>
          ) : document.status === 'ready' && (
            <button
              onClick={handleGenerateSummary}
              disabled={summarizing}
              className="mt-5 w-full py-3 px-4 rounded-lg cursor-pointer font-semibold text-sm border transition-all duration-300 bg-violet-primary/10 text-violet-light border-violet-primary/30 hover:bg-violet-primary/20 hover:border-violet-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {summarizing ? '⏳ Generating Summary...' : '📝 Generate AI Summary'}
            </button>
          )}
          
          <div className="mt-5 p-4 rounded-lg bg-sky-400/10 border border-sky-400/20">
            <p className="text-sky-400 text-sm m-0">
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
          <div className="glass-panel p-10 text-center text-yellow-300">
            This document is still processing. Please wait or refresh...
          </div>
        )}
      </div>
      
    </div>
  );
};

export default DocViewer;
