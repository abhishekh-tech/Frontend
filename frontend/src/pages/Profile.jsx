import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Calendar, Edit3, Save, X, Loader } from 'lucide-react';
import { fetchWithAuth } from '../utils/api';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const storedUserStr = localStorage.getItem('user');
      const storedUser = storedUserStr ? JSON.parse(storedUserStr) : null;
      const userId = storedUser?.id || storedUser?._id;

      if (!userId) {
        setError('User session not found. Please log in again.');
        return;
      }

      const res = await fetchWithAuth(`/users/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch profile settings');
      
      const data = await res.json();
      setUser(data);
      setFormData({ name: data.name, email: data.email });
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetchWithAuth(`/users/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Update failed');
      }

      const updatedUser = await res.json();
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser)); // Sync with local storage
      setSuccess('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ padding: '5rem', textAlign: 'center' }}>
      <Loader size={48} className="animate-spin" style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
      <p style={{ color: 'var(--text-muted)' }}>Loading your profile...</p>
    </div>
  );

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Personal Profile</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your account settings and public information.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem', alignItems: 'start' }}>
        {/* Left Card: Summary */}
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <User size={50} style={{ color: 'var(--primary)' }} />
          </div>
          <h2 style={{ marginBottom: '0.5rem' }}>{user.name}</h2>
          <span style={{ 
            padding: '0.3rem 1rem', 
            borderRadius: '20px', 
            background: user.role === 'teacher' ? 'rgba(99,102,241,0.15)' : 'rgba(34,197,94,0.15)', 
            color: user.role === 'teacher' ? 'var(--primary)' : '#4ade80',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            textTransform: 'uppercase'
          }}>
            {user.role}
          </span>
          <div style={{ marginTop: '2rem', textAlign: 'left', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                <Mail size={16} /> {user.email}
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                <Calendar size={16} /> Joined {new Date(user.createdAt).toLocaleDateString()}
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <Shield size={16} /> {user.isVerified ? 'Verified Account' : 'Standard Account'}
             </div>
          </div>
        </div>

        {/* Right Card: Edit info */}
        <div className="glass-panel" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.4rem' }}>Account Details</h3>
            {!editing ? (
              <button 
                onClick={() => setEditing(true)} 
                className="btn btn-secondary" 
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
              >
                <Edit3 size={16} /> Edit Profile
              </button>
            ) : (
              <button 
                onClick={() => { setEditing(false); setFormData({ name: user.name, email: user.email }); }} 
                className="btn btn-secondary" 
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
              >
                <X size={16} /> Cancel
              </button>
            )}
          </div>

          {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>{error}</div>}
          {success && <div style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>{success}</div>}

          <form onSubmit={handleUpdate}>
            <div className="input-group" style={{ marginBottom: '1.5rem' }}>
              <label>Full Name</label>
              {editing ? (
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  required 
                />
              ) : (
                <div style={{ padding: '0.7rem 0', color: 'var(--text-main)', fontSize: '1.1rem' }}>{user.name}</div>
              )}
            </div>

            <div className="input-group" style={{ marginBottom: '1.5rem' }}>
              <label>Email Address</label>
              {editing ? (
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                  required 
                />
              ) : (
                <div style={{ padding: '0.7rem 0', color: 'var(--text-main)', fontSize: '1.1rem' }}>{user.email}</div>
              )}
            </div>

            <div className="input-group">
              <label>Role</label>
              <div style={{ padding: '0.7rem 0', color: 'var(--text-muted)', fontSize: '1.1rem', textTransform: 'capitalize' }}>{user.role}</div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Roles cannot be changed after registration.</p>
            </div>

            {editing && (
              <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" disabled={saving} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.8rem 2rem' }}>
                  {saving ? <Loader className="animate-spin" size={18} /> : <><Save size={18} /> Save Changes</>}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
