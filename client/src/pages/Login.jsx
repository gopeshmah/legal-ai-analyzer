import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    const result = await login(email, password);
    
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
        <h2>Welcome Back</h2>
        <p>Log in to access your legal documents</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
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
          {isSubmitting ? 'Logging in...' : 'Log In'}
        </button>
      </form>
      
      <p style={{ textAlign: 'center', marginTop: '20px', color: '#94a3b8' }}>
        Don't have an account? <Link to="/register" className="link-text">Sign up</Link>
      </p>
    </div>
  );
};

export default Login;
