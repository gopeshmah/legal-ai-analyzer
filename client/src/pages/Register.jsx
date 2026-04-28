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
      navigate('/dashboard');
    } else {
      setError(result.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel max-w-[450px] mx-auto mt-[10vh] p-10">
      <div className="text-center mb-7">
        <h2 className="text-3xl font-bold mb-2 gradient-text">Create Account</h2>
        <p className="dark:text-slate-400 text-slate-500 text-[0.95rem]">Start analyzing legal documents with AI</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-5">
          <label className="block mb-2 text-sm dark:text-slate-300 text-slate-700 font-medium">Full Name</label>
          <input 
            type="text" 
            className="input-field"
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="John Doe"
            required 
          />
        </div>

        <div className="mb-5">
          <label className="block mb-2 text-sm dark:text-slate-300 text-slate-700 font-medium">Email Address</label>
          <input 
            type="email" 
            className="input-field"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="you@email.com"
            required 
          />
        </div>
        
        <div className="mb-5">
          <label className="block mb-2 text-sm dark:text-slate-300 text-slate-700 font-medium">Password</label>
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
      
      <p className="text-center mt-5 dark:text-slate-400 text-slate-600">
        Already have an account? <Link to="/login" className="text-violet-primary no-underline font-semibold hover:text-violet-light transition-colors duration-200">Log in</Link>
      </p>
    </div>
  );
};

export default Register;
