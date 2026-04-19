import React, { useState, useEffect } from 'react';
import { Search, Loader, Users, Mail, ShieldCheck, MapPin } from 'lucide-react';
import { fetchWithAuth } from '../utils/api';

const Community = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetchWithAuth('/users');
      if (!res.ok) throw new Error('Failed to fetch user directory');
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="container" style={{ padding: '3rem 1rem', paddingBottom: '6rem' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Community Directory</h1>
        <p style={{ color: 'var(--text-muted)' }}>Meet the teachers and learners making an impact on SkillSwap.</p>
      </header>

      {/* Filters & Search */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '3rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.8rem 1.2rem 0.8rem 3.5rem' }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Filter by:</span>
          <select 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ padding: '0.7rem 1.2rem', minWidth: '150px' }}
          >
            <option value="ALL">All Roles</option>
            <option value="teacher">Teachers</option>
            <option value="student">Students</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0' }}>
          <Loader size={48} className="animate-spin" style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-muted)' }}>Fetching community members...</p>
        </div>
      ) : error ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', color: '#f87171' }}>{error}</div>
      ) : filteredUsers.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <Users size={60} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: '1.5rem' }} />
          <h3 style={{ marginBottom: '0.5rem' }}>No Members Found</h3>
          <p style={{ color: 'var(--text-muted)' }}>No anyone matches your current search or filter criteria.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
          {filteredUsers.map(user => (
            <div key={user._id} className="glass-panel" style={{ padding: '2rem', transition: 'transform 0.2s', cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
              <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={32} style={{ color: 'var(--primary)' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{user.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ 
                        fontSize: '0.7rem', 
                        padding: '0.2rem 0.6rem', 
                        borderRadius: '12px', 
                        background: user.role === 'teacher' ? 'rgba(99,102,241,0.1)' : 'rgba(34,197,94,0.1)', 
                        color: user.role === 'teacher' ? 'var(--primary)' : '#4ade80',
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                    }}>
                        {user.role}
                    </span>
                    {user.isVerified && <ShieldCheck size={14} style={{ color: 'var(--primary)' }} />}
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <Mail size={16} /> {user.email}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <MapPin size={16} /> Global Community
                </div>
              </div>
              
              <button className="btn btn-secondary" style={{ width: '100%', marginTop: '1.5rem', fontSize: '0.85rem' }} onClick={() => alert(`Viewing profile of ${user.name} (Feature coming soon!)`)}>
                View Profile
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Community;
