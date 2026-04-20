import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import API_BASE from '../config/api';

const ChatWindow = ({ documentId }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello! I am ready to answer questions about this legal document. What would you like to know?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

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
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '600px' }}>
      <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 style={{ margin: 0, color: '#f8fafc' }}>AI Legal Analyst</h3>
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ 
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '80%',
            backgroundColor: msg.role === 'user' ? '#8b5cf6' : 'rgba(255,255,255,0.05)',
            padding: '12px 18px',
            borderRadius: '12px',
            color: '#f8fafc',
            border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.1)' : 'none'
          }}>
            {msg.role === 'user' ? (
              <div>{msg.text}</div>
            ) : (
              <div className="markdown-body" style={{ lineHeight: '1.6' }}>
                <ReactMarkdown>{processText(msg.text)}</ReactMarkdown>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: 'flex-start', color: '#94a3b8', padding: '10px' }}>
            <span>AI is analyzing the document...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question (e.g. Can the landlord terminate early?)..."
          disabled={loading}
          style={{ 
            flex: 1, 
            padding: '12px 16px', 
            borderRadius: '8px', 
            border: '1px solid rgba(255,255,255,0.2)', 
            backgroundColor: 'rgba(0,0,0,0.2)',
            color: 'white',
            outline: 'none'
          }}
        />
        <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100px' }}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
