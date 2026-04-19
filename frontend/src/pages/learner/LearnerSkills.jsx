import React, { useState, useEffect } from 'react';
import { Search, Filter, Loader, Code2, Palette, Globe, BookOpen, GraduationCap, Music, Dumbbell, Star } from 'lucide-react';
import FeatureCard from '../../components/shared/FeatureCard';
import { fetchWithAuth, API_BASE_URL } from '../../utils/api';

const CATEGORY_ICONS = {
  PROGRAMMING: Code2,
  DESIGN: Palette,
  LANGUAGES: Globe,
  BUSINESS: BookOpen,
  MUSIC: Music,
  FITNESS: Dumbbell,
  OTHER: GraduationCap,
};

const LearnerSkills = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [selectedCourseContent, setSelectedCourseContent] = useState(null);
  const [textContent, setTextContent] = useState('');
  const [textLoading, setTextLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await fetchWithAuth('/skills');
        const data = await response.json();
        setSkills(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Fetch skills error:', err);
        setError('Failed to load skills.');
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, []);

  // ── Fetch Text Content ───────────────────────────────────────────────────
  useEffect(() => {
    if (selectedCourseContent && (selectedCourseContent.content?.type === 'text' || selectedCourseContent.content?.type === 'text-file')) {
      const fetchText = async () => {
        setTextLoading(true);
        setTextContent('');
        try {
          const res = await fetchWithAuth(`/skills/${selectedCourseContent._id}/stream`);
          const text = await res.text();
          setTextContent(text);
        } catch (err) {
          console.error('Text fetch error:', err);
          setTextContent('Failed to load content.');
        } finally {
          setTextLoading(false);
        }
      };
      fetchText();
    }
  }, [selectedCourseContent]);

  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         skill.desc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || skill.category === selectedCategory;
    const matchesLevel = selectedLevel === 'ALL' || skill.level === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <div style={{ paddingBottom: '3rem' }}>
      {/* Skill content viewer modal */}
      {selectedCourseContent && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)'
        }}>
          <div className="glass-panel" style={{ width: '100vw', height: '100vh', maxWidth: 'none', maxHeight: 'none', overflow: 'auto', padding: '2rem', position: 'relative', borderRadius: 0, border: 'none' }}>
            <button
              onClick={() => setSelectedCourseContent(null)}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-main)', zIndex: 10 }}
            >✕</button>
            <div style={{ paddingRight: '1rem' }}>
              <h2 style={{ marginBottom: '0.5rem', fontSize: '1.8rem' }}>{selectedCourseContent.title}</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Instructor: {selectedCourseContent.createdBy?.name || 'Expert'}</p>
              
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                   {selectedCourseContent.content?.type === 'video' ? '🎬 Video Preview' : selectedCourseContent.content?.type === 'pdf' ? '📄 PDF Document Preview' : '📝 Text Preview'}
                </p>

                {/* Video Player */}
                {selectedCourseContent.content?.type === 'video' && (
                  <div style={{ textAlign: 'center', width: '100%', height: 'calc(100vh - 350px)' }}>
                    <video controls style={{ width: '100%', height: '100%', backgroundColor: '#000', borderRadius: '6px', objectFit: 'contain' }}>
                      <source src={`${API_BASE_URL}/skills/${selectedCourseContent._id}/stream?token=${localStorage.getItem('token')}`} type={selectedCourseContent.content.mimeType} />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}

                {/* PDF Preview */}
                {selectedCourseContent.content?.type === 'pdf' && (
                  <div style={{ width: '100%', height: 'calc(100vh - 350px)', borderRadius: '6px', overflow: 'hidden', background: '#333' }}>
                    <iframe
                      src={`${API_BASE_URL}/skills/${selectedCourseContent._id}/stream?token=${localStorage.getItem('token')}#toolbar=0`}
                      width="100%"
                      height="100%"
                      title="PDF Preview"
                      style={{ border: 'none' }}
                    ></iframe>
                  </div>
                )}

                {/* Text Preview */}
                {(selectedCourseContent.content?.type === 'text' || selectedCourseContent.content?.type === 'text-file') && (
                  <div style={{ width: '100%', height: 'calc(100vh - 350px)', overflowY: 'auto', background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {textLoading ? (
                      <div style={{ textAlign: 'center', padding: '2rem' }}><Loader size={20} className="animate-spin" /> Loading content...</div>
                    ) : (
                      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
                        {textContent}
                      </pre>
                    )}
                  </div>
                )}

                {!selectedCourseContent.content && (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No preview content available for this skill.
                  </div>
                )}

                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ color: 'var(--text-main)', fontWeight: '600', fontSize: '0.9rem' }}>{selectedCourseContent.content?.fileName}</p>
                  {selectedCourseContent.content?.fileName && (
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = `${API_BASE_URL}/skills/${selectedCourseContent._id}/download?token=${localStorage.getItem('token')}`;
                        link.download = selectedCourseContent.content.fileName;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      style={{ 
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem', 
                        background: 'rgba(99,102,241,0.15)', color: 'var(--primary)', 
                        border: '1px solid var(--primary)', padding: '0.5rem 1rem', 
                        borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' 
                      }}
                    >
                      ⬇ Download
                    </button>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setSelectedCourseContent(null)} 
                className="btn btn-secondary"
                style={{ width: '100%' }}
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Explore Skills</h1>
        <p style={{ color: 'var(--text-muted)' }}>Discover new skills to master from our community of experts.</p>
      </header>

      {/* Search and Filters */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2.5rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search skills..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', paddingLeft: '3rem' }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ padding: '0.7rem 1.2rem' }}
          >
            <option value="ALL">All Categories</option>
            <option value="PROGRAMMING">Programming</option>
            <option value="DESIGN">Design</option>
            <option value="LANGUAGES">Languages</option>
            <option value="BUSINESS">Business</option>
            <option value="MUSIC">Music</option>
            <option value="FITNESS">Fitness</option>
            <option value="OTHER">Other</option>
          </select>

          <select 
            value={selectedLevel} 
            onChange={(e) => setSelectedLevel(e.target.value)}
            style={{ padding: '0.7rem 1.2rem' }}
          >
            <option value="ALL">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
          <Loader className="animate-spin" size={40} style={{ marginBottom: '1rem' }} />
          <p>Loading available skills...</p>
        </div>
      ) : error ? (
        <div style={{ color: '#f87171', textAlign: 'center', padding: '2rem' }}>{error}</div>
      ) : filteredSkills.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <Filter size={48} style={{ color: 'var(--text-muted)', opacity: 0.5, marginBottom: '1.5rem' }} />
          <h3>No Skills Found</h3>
          <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search or filters to find what you're looking for.</p>
        </div>
      ) : (
        <div className="skills-grid" style={{ paddingTop: 0 }}>
          {filteredSkills.map(skill => (
            <FeatureCard
              key={skill._id}
              icon={CATEGORY_ICONS[skill.category] || Star}
              category={`${skill.category} • ${skill.level.toUpperCase()}`}
              title={skill.title}
              desc={skill.desc}
              author={skill.author || 'Instructor'}
              actionButton={
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                  onClick={() => setSelectedCourseContent(skill)}
                >
                  View Content
                </button>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LearnerSkills;
