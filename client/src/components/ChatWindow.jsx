import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import API_BASE from '../config/api';

const SourceViewer = ({ sources }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-5 pt-4 border-t border-white/[0.08]">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="group flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-violet-300 transition-colors w-full"
      >
        <span className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-violet-primary/30 transition-all"></span>
        <svg className={`w-3.5 h-3.5 transform transition-transform duration-300 ${expanded ? 'rotate-180 text-violet-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
        <span className="uppercase tracking-wider">{expanded ? 'Hide Evidence' : `View Evidence (${sources.length})`}</span>
        <span className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-violet-primary/30 transition-all"></span>
      </button>
      
      {expanded && (
        <div className="mt-4 flex flex-col gap-3 max-h-[250px] overflow-y-auto custom-scrollbar pr-2 animate-fade-in">
          {sources.map((src, i) => {
            const sourceText = typeof src === 'string' ? src : src.text;
            const pageNum = typeof src === 'object' && src.page ? `Page ${src.page}` : '';
            return (
              <div key={i} className="group relative text-[13px] text-slate-300 bg-white/[0.02] hover:bg-white/[0.04] p-4 rounded-xl border border-white/[0.05] hover:border-violet-primary/20 transition-all shadow-inner">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/[0.05]">
                  <span className="text-violet-400 font-semibold flex items-center gap-1.5">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    Source {i + 1}
                  </span>
                  {pageNum && (
                    <span className="px-2 py-0.5 bg-violet-primary/10 text-violet-300 rounded text-[10px] font-bold uppercase tracking-wide">
                      {pageNum}
                    </span>
                  )}
                </div>
                <p className="leading-relaxed opacity-90 whitespace-pre-wrap">{sourceText}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const ChatWindow = ({ documentId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);

  // Fetch chat history on mount
  useEffect(() => {
    if (!documentId) return;
    
    const fetchHistory = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/api/query/history/${documentId}`);
        if (data && data.length > 0) {
          setMessages(data);
        } else {
          // Default initial message
          setMessages([
            { role: 'assistant', text: 'Hello! I am ready to answer questions about this legal document. What would you like to know?' }
          ]);
        }
      } catch (err) {
        console.error("Failed to load chat history", err);
      }
    };
    
    fetchHistory();
  }, [documentId]);

  // Auto-scroll to bottom of chat without scrolling the entire page
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const quickPrompts = [
    { icon: '🚨', text: 'Identify Risks', query: 'What are the key risks, liabilities, and hidden fees in this document?' },
    { icon: '📝', text: 'Key Obligations', query: 'Extract and summarize the key obligations and responsibilities of each party.' },
    { icon: '❌', text: 'Termination Terms', query: 'Under what conditions can this agreement be terminated, and what are the penalties?' },
    { icon: '📅', text: 'Key Dates', query: 'Extract all important dates, deadlines, and renewal periods mentioned in the text.' }
  ];

  const handleSend = async (e, predefinedQuery = null) => {
    if (e) e.preventDefault();
    
    const queryToSend = predefinedQuery || input.trim();
    if (!queryToSend || !documentId) return;

    setMessages(prev => [...prev, { role: 'user', text: queryToSend }]);
    if (!predefinedQuery) setInput('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/api/query`, {
        documentId,
        question: queryToSend
      }, {
        timeout: 120000 // 2 minute timeout for RAG pipeline
      });

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: response.data.answer,
        sources: response.data.sources 
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I encountered an error while processing your question.' }]);
    } finally {
      setLoading(false);
    }
  };

  // Pre-process text to highlight [RISK] tags
  const processText = (text) => {
    return text.replaceAll('[RISK]', '> 🚨 **RISK DETECTED:**');
  };

  const handleExportPDF = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/documents/${documentId}/export`, {
        responseType: 'blob' // Important for receiving binary data
      });

      // Create a URL for the blob and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Legal_Brief_${documentId.substring(0, 5)}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export Error:", error);
      let errorMsg = error.message;
      if (error.response && error.response.data) {
        if (error.response.data instanceof Blob) {
          errorMsg = "Server returned an error blob";
        } else {
          errorMsg = JSON.stringify(error.response.data);
        }
      }
      alert(`Export Failed: ${errorMsg}`);
    }
  };

  return (
    <div className="glass-panel flex flex-col h-[600px]">
      <div className="p-5 border-b dark:border-white/10 border-slate-200 flex justify-between items-center">
        <h3 className="m-0 dark:text-slate-100 text-slate-800 font-semibold">AI Legal Analyst</h3>
        <button 
          onClick={handleExportPDF}
          className="text-xs bg-violet-primary/20 hover:bg-violet-primary/40 text-violet-300 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 border border-violet-primary/30"
          title="Export AI Summary and Chat History as PDF"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          Export Brief
        </button>
      </div>
      
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-5 flex flex-col gap-4"
      >
        {messages.map((msg, idx) => (
          <div key={idx} className={`max-w-[85%] px-5 py-4 rounded-2xl dark:text-slate-100 text-slate-800 shadow-sm animate-slide-up
            ${msg.role === 'user' 
              ? 'self-end bg-gradient-to-br from-violet-secondary to-violet-primary rounded-br-sm shadow-violet-primary/20 text-white' 
              : 'self-start dark:bg-white/[0.04] bg-white border dark:border-white/10 border-slate-200 rounded-bl-sm backdrop-blur-md'
            }`}
            style={{ animationDelay: `${idx * 0.05}s` }}
          >
            {msg.role === 'user' ? (
              <div className="text-[15px] font-medium leading-relaxed">{msg.text}</div>
            ) : (
              <div className="markdown-body text-[15px] leading-relaxed">
                <ReactMarkdown>{processText(msg.text)}</ReactMarkdown>
                {msg.sources && msg.sources.length > 0 && (
                  <SourceViewer sources={msg.sources} />
                )}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="self-start dark:text-slate-400 text-slate-500 p-2.5">
            <span>AI is analyzing the document...</span>
          </div>
        )}
      </div>

      <div className="px-5 pb-3 flex gap-2 overflow-x-auto custom-scrollbar flex-wrap pt-2">
        {quickPrompts.map((prompt, idx) => (
          <button 
            key={idx}
            type="button"
            disabled={loading}
            onClick={() => handleSend(null, prompt.query)}
            className="flex items-center gap-1.5 px-3 py-1.5 dark:bg-white/5 bg-slate-100 hover:bg-violet-primary/20 border dark:border-white/10 border-slate-200 hover:border-violet-primary/50 rounded-full text-xs dark:text-slate-200 text-slate-600 transition-all whitespace-nowrap disabled:opacity-50 cursor-pointer"
          >
            <span>{prompt.icon}</span>
            <span>{prompt.text}</span>
          </button>
        ))}
      </div>

      <form onSubmit={(e) => handleSend(e)} className="px-5 pb-5 mt-2 relative group">
        <div className="relative flex items-center dark:bg-black/40 bg-white border dark:border-white/10 border-slate-200 rounded-[24px] p-1.5 focus-within:border-violet-primary/50 focus-within:ring-1 focus-within:ring-violet-primary/50 transition-all shadow-inner">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about this document..."
            disabled={loading}
            className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-sm dark:text-white text-slate-800 dark:placeholder-slate-400 placeholder-slate-500"
          />
          <button 
            type="submit" 
            disabled={loading || !input.trim()} 
            className="bg-violet-primary hover:bg-violet-primary/90 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-violet-primary/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
