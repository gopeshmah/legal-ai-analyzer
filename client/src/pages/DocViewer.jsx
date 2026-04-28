import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import ChatWindow from '../components/ChatWindow';
import ThemeToggle from '../components/ThemeToggle';
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
      <div className="flex flex-col gap-6 animate-slide-up">
        <div className="flex justify-between items-center w-full">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="bg-transparent border-none dark:text-slate-400 text-slate-500 cursor-pointer text-[0.95rem] font-medium flex items-center gap-2 hover:text-violet-primary transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to Dashboard
          </button>
          <ThemeToggle />
        </div>
        
        <div className="glass-panel p-7">
          <div className="flex items-start gap-3 mb-6">
            <div className="p-3 dark:bg-violet-primary/20 bg-violet-primary/10 rounded-xl">
              <svg className="w-6 h-6 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            <div>
              <h2 className="text-xl font-bold dark:text-slate-100 text-slate-800 mb-1 leading-tight">{document.fileName}</h2>
              <span className="dark:text-slate-400 text-slate-500 text-xs font-medium uppercase tracking-wider">Uploaded {new Date(document.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="dark:bg-white/[0.03] bg-black/[0.03] border dark:border-white/[0.05] border-black/[0.05] p-3 rounded-xl flex flex-col gap-1">
              <span className="dark:text-slate-500 text-slate-400 text-[0.75rem] uppercase font-bold tracking-wider">Status</span>
              <span className={`text-sm font-semibold flex items-center gap-1.5 ${document.status === 'ready' ? 'text-green-500 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                {document.status === 'ready' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400 dark:shadow-[0_0_8px_#4ade80]"></span>}
                {document.status.toUpperCase()}
              </span>
            </div>
            <div className="dark:bg-white/[0.03] bg-black/[0.03] border dark:border-white/[0.05] border-black/[0.05] p-3 rounded-xl flex flex-col gap-1">
              <span className="dark:text-slate-500 text-slate-400 text-[0.75rem] uppercase font-bold tracking-wider">File Size</span>
              <span className="dark:text-slate-200 text-slate-700 text-sm font-semibold">{(document.fileSize / 1024 / 1024).toFixed(2)} MB</span>
            </div>
            <div className="dark:bg-white/[0.03] bg-black/[0.03] border dark:border-white/[0.05] border-black/[0.05] p-3 rounded-xl flex flex-col gap-1">
              <span className="dark:text-slate-500 text-slate-400 text-[0.75rem] uppercase font-bold tracking-wider">Pages</span>
              <span className="dark:text-slate-200 text-slate-700 text-sm font-semibold">{document.pageCount} Pages</span>
            </div>
            <div className="dark:bg-white/[0.03] bg-black/[0.03] border dark:border-white/[0.05] border-black/[0.05] p-3 rounded-xl flex flex-col gap-1">
              <span className="dark:text-slate-500 text-slate-400 text-[0.75rem] uppercase font-bold tracking-wider">AI Chunks</span>
              <span className="dark:text-slate-200 text-slate-700 text-sm font-semibold">{document.chunkCount} Indexed</span>
            </div>
          </div>
          
          {/* Document Summary Section */}
          {document.summary ? (
            <div className="p-5 rounded-2xl bg-gradient-to-br dark:from-violet-primary/10 from-violet-primary/5 dark:to-violet-secondary/5 to-white border dark:border-violet-primary/20 border-violet-primary/10 shadow-inner">
              <h3 className="text-[0.85rem] font-bold text-violet-600 dark:text-violet-300 mb-3 flex items-center gap-2 uppercase tracking-wide">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                Executive AI Summary
              </h3>
              <p className="dark:text-slate-300 text-slate-700 text-[0.95rem] leading-relaxed whitespace-pre-line m-0">
                {document.summary}
              </p>
            </div>
          ) : document.status === 'ready' && (
            <button
              onClick={handleGenerateSummary}
              disabled={summarizing}
              className="w-full py-4 px-4 rounded-xl cursor-pointer font-bold text-sm transition-all duration-300 dark:bg-white/[0.03] bg-white text-violet-600 dark:text-violet-400 border dark:border-violet-primary/30 border-violet-primary/20 hover:bg-violet-primary/5 dark:hover:bg-violet-primary/10 hover:border-violet-primary/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {summarizing ? (
                <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Analyzing...</>
              ) : (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg> Generate AI Insight Report</>
              )}
            </button>
          )}
          
          <div className="mt-6 p-4 rounded-xl dark:bg-sky-400/[0.08] bg-sky-500/[0.05] border dark:border-sky-400/20 border-sky-500/20 flex items-start gap-3">
            <svg className="w-5 h-5 dark:text-sky-400 text-sky-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <p className="dark:text-sky-300/90 text-sky-800 text-sm m-0 leading-relaxed">
              <strong>Vector Embedded.</strong> Document context is securely indexed in Pinecone. You can now interrogate the AI.
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
