import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import API_BASE from '../config/api';

const SourceViewer = ({ sources }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-4 border-t border-white/10 pt-3">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors font-medium"
      >
        <svg className={`w-3 h-3 transform transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        {expanded ? 'Hide Sources' : `View Sources (${sources.length})`}
      </button>
      
      {expanded && (
        <div className="mt-3 flex flex-col gap-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
          {sources.map((src, i) => {
            const sourceText = typeof src === 'string' ? src : src.text;
            const pageNum = typeof src === 'object' && src.page ? `(Page ${src.page})` : '';
            return (
              <div key={i} className="text-xs text-slate-300 bg-black/30 p-3 rounded-lg border border-white/5">
                <span className="text-violet-400 font-semibold mb-1 block">Source {i + 1} {pageNum}</span>
                <p className="leading-relaxed opacity-80 whitespace-pre-wrap">{sourceText}</p>
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
  const messagesEndRef = useRef(null);

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

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  return (
    <div className="glass-panel flex flex-col h-[600px]">
      <div className="p-5 border-b border-white/10">
        <h3 className="m-0 text-slate-100 font-semibold">AI Legal Analyst</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`max-w-[80%] px-4 py-3 rounded-xl text-slate-100
            ${msg.role === 'user' 
              ? 'self-end bg-violet-primary' 
              : 'self-start bg-white/[0.05] border border-white/10'
            }`}>
            {msg.role === 'user' ? (
              <div>{msg.text}</div>
            ) : (
              <div className="markdown-body leading-relaxed">
                <ReactMarkdown>{processText(msg.text)}</ReactMarkdown>
                {msg.sources && msg.sources.length > 0 && (
                  <SourceViewer sources={msg.sources} />
                )}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="self-start text-slate-400 p-2.5">
            <span>AI is analyzing the document...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-5 pb-3 flex gap-2 overflow-x-auto custom-scrollbar flex-wrap pt-2">
        {quickPrompts.map((prompt, idx) => (
          <button 
            key={idx}
            type="button"
            disabled={loading}
            onClick={() => handleSend(null, prompt.query)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-violet-primary/20 border border-white/10 hover:border-violet-primary/50 rounded-full text-xs text-slate-200 transition-all whitespace-nowrap disabled:opacity-50 cursor-pointer"
          >
            <span>{prompt.icon}</span>
            <span>{prompt.text}</span>
          </button>
        ))}
      </div>

      <form onSubmit={(e) => handleSend(e)} className="px-5 pb-5 flex gap-2.5">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question (e.g. Can the landlord terminate early?)..."
          disabled={loading}
          className="input-field flex-1"
        />
        <button type="submit" disabled={loading} className="btn-primary !w-[100px]">
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
