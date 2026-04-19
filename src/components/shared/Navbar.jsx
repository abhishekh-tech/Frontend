import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const Navbar = () => {
  const userStr = localStorage.getItem('user');
  let user = null;

  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (err) {
    console.warn('Failed to parse stored user data:', err);
    localStorage.removeItem('user');
    user = null;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <nav className="glass-nav">
      <div className="container nav-content">
        <Link to="/" className="nav-logo">
          <Sparkles className="text-primary" />
          <span>SkillSwap</span>
        </Link>
        <div className="nav-links" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link to="/explore">Explore</Link>
          <Link to="/community">Community</Link>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '0.5rem' }}>Demo Views:</p>
            <Link to="/dashboard/teacher" className="btn btn-secondary" style={{ padding: '0.2rem 0.8rem', fontSize: '0.8rem', borderColor: 'var(--primary)', color: 'var(--primary)' }}>Teacher</Link>
            <Link to="/dashboard/learner" className="btn btn-secondary" style={{ padding: '0.2rem 0.8rem', fontSize: '0.8rem', borderColor: 'var(--secondary)', color: 'var(--secondary)' }}>Learner</Link>
          </div>
          {user ? (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Link to="/profile" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>
                Hi, {typeof user.name === 'string' && user.name.trim()
                  ? user.name.trim().split(/\s+/)[0]
                  : 'there'}!
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>Log Out</button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>Log In</Link>
              <Link to="/signup" className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
