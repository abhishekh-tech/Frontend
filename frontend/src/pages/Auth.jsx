import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, ChevronRight } from 'lucide-react';
import { API_BASE_URL } from '../utils/api';

const Auth = ({ type }) => {
  const isLogin = type === 'login';
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });
  const [errorMSG, setErrorMSG] = useState('');
  const [loading, setLoading] = useState(false);

  const { name, email, password, role } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();

    if (!email || !password || (!isLogin && (!name || !role))) {
      setErrorMSG('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setErrorMSG('');

    const url = isLogin
      ? `${API_BASE_URL}/auth/login`
      : `${API_BASE_URL}/auth/signup`;

    const body = isLogin ? { email, password } : { name, email, password, role };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      navigate('/explore');

    } catch (err) {
      setErrorMSG(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Link to="/" style={{ position: 'absolute', top: '2rem', left: '2rem', color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} /> Back to Home
      </Link>

      <div className="auth-box glass-panel">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <div className="nav-logo">
            <Sparkles className="text-primary" size={32} />
          </div>
        </div>
        <h2>{isLogin ? 'Welcome Back' : 'Create an Account'}</h2>

        {errorMSG && <div style={{ color: 'white', backgroundColor: 'var(--secondary)', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{errorMSG}</div>}

        <form onSubmit={onSubmit}>
          {!isLogin && (
            <div className="input-group">
              <label>Full Name</label>
              <input type="text" name="name" value={name} onChange={onChange} placeholder="John Doe" />
            </div>
          )}
          <div className="input-group">
            <label>Email</label>
            <input type="email" name="email" value={email} onChange={onChange} placeholder="you@example.com" />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" name="password" value={password} onChange={onChange} placeholder="••••••••" />
          </div>
          {!isLogin && (
            <div className="input-group">
              <label>Join as</label>
              <select 
                name="role" 
                value={role} 
                onChange={onChange}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
          )}
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
            {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <Link to={isLogin ? '/signup' : '/login'} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
            {isLogin ? 'Sign up' : 'Log in'}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Auth;
