import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import API_BASE from '../config/api';

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

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !documentId) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/api/query`, {
        documentId,
        question: userMessage
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

      <form onSubmit={handleSend} className="p-5 border-t border-white/10 flex gap-2.5">
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
