import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    // Simple validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsSubmitting(false);
      return;
    }
    
    const result = await register(name, email, password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container glass-panel">
      <div className="auth-header">
        <h2>Create Account</h2>
        <p>Start analyzing legal documents with AI</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name</label>
          <input 
            type="text" 
            className="input-field"
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="John Doe"
            required 
          />
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <input 
            type="email" 
            className="input-field"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="you@email.com"
            required 
          />
        </div>
        
        <div className="form-group">
          <label>Password</label>
          <input 
            type="password" 
            className="input-field"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="••••••••"
            required 
          />
        </div>
        
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>
      
      <p style={{ textAlign: 'center', marginTop: '20px', color: '#94a3b8' }}>
        Already have an account? <Link to="/login" className="link-text">Log in</Link>
      </p>
    </div>
  );
};

export default Register;
