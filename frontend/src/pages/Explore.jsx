import React, { useState, useEffect } from 'react';
import { Search, Code2, BookOpen, Globe, Palette, GraduationCap, Music, Dumbbell, Loader } from 'lucide-react';
import Navbar from '../components/shared/Navbar';
import FeatureCard from '../components/shared/FeatureCard';
import { fetchWithAuth, API_BASE_URL } from '../utils/api';

// Map category strings → icons
const CATEGORY_ICONS = {
  PROGRAMMING: Code2,
  DESIGN: Palette,
  LANGUAGES: Globe,
  BUSINESS: BookOpen,
  MUSIC: Music,
  FITNESS: Dumbbell,
  OTHER: GraduationCap,
};

const FALLBACK_COURSES = [
  { _id: 'f1', icon: Code2,    category: 'PROGRAMMING', title: 'Python for Data Science',  desc: "Let's trade! I teach Python, you teach me basic French.", author: 'Jina V.' },
  { _id: 'f2', icon: BookOpen, category: 'BUSINESS',    title: 'Startup Pitching',          desc: 'I have raised $2M, can teach you how to pitch. Looking for UI design.', author: 'Mark T.' },
  { _id: 'f3', icon: Globe,    category: 'LANGUAGES',   title: 'Japanese N4 Prep',          desc: "I'll help you pass JLPT N4. I need help with advanced calculus.", author: 'Kenji S.' },
  { _id: 'f4', icon: Palette,  category: 'DESIGN',      title: 'Logo Animation',            desc: 'In After Effects. Learn to bring brands to life.', author: 'Priya R.' },
];

const CATEGORIES = ['ALL', 'PROGRAMMING', 'DESIGN', 'LANGUAGES', 'BUSINESS', 'MUSIC', 'FITNESS', 'OTHER'];

const Explore = () => {
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [selectedCourseContent, setSelectedCourseContent] = useState(null);
  const [textContent, setTextContent] = useState('');
  const [textLoading, setTextLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Not logged in - show static fallbacks
      setAllCourses(FALLBACK_COURSES);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [coursesRes, skillsRes] = await Promise.all([
          fetchWithAuth('/courses'),
          fetchWithAuth('/skills')
        ]);

        const [coursesData, skillsData] = await Promise.all([
          coursesRes.json(),
          skillsRes.json()
        ]);

        const mappedCourses = Array.isArray(coursesData) ? coursesData.map(c => ({
          ...c,
          type: 'Course',
          icon: CATEGORY_ICONS[c.category] || GraduationCap,
        })) : [];

        const mappedSkills = Array.isArray(skillsData) ? skillsData.map(s => ({
          ...s,
          type: 'Skill',
          author: s.createdBy?.name || 'Expert',
          icon: CATEGORY_ICONS[s.category] || BookOpen,
        })) : [];

        const combined = [...mappedCourses, ...mappedSkills].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );

        if (combined.length > 0) {
          setAllCourses(combined);
        } else {
          setAllCourses(FALLBACK_COURSES);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setAllCourses(FALLBACK_COURSES);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ── Fetch Text Content ───────────────────────────────────────────────────
  useEffect(() => {
    if (selectedCourseContent && (selectedCourseContent.content?.type === 'text' || selectedCourseContent.content?.type === 'text-file')) {
      const fetchText = async () => {
        setTextLoading(true);
        setTextContent('');
        try {
          const res = await fetchWithAuth(`/${selectedCourseContent.type === 'Skill' ? 'skills' : 'courses'}/${selectedCourseContent._id}/stream`);
          const text = await res.text();
          setTextContent(text);
        } catch (err) {
          console.error('Text fetch error:', err);
          setTextContent('Failed to load text content.');
        } finally {
          setTextLoading(false);
        }
      };
      fetchText();
    } else {
      setTextContent('');
    }
  }, [selectedCourseContent]);

  // Filter by search + category
  const filtered = allCourses.filter(c => {
    const matchesSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.desc || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.author || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'ALL' || c.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Navbar />
      
      {/* Course content viewer modal */}
      {selectedCourseContent && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)'
        }}>
          <div className="glass-panel" style={{ width: '100vw', height: '100vh', maxWidth: 'none', maxHeight: 'none', overflow: 'auto', padding: '2rem', position: 'relative', borderRadius: 0, border: 'none' }}>
            <button
              onClick={() => setSelectedCourseContent(null)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-main)' }}
            >✕</button>
            <div style={{ paddingRight: '2rem' }}>
              <h2 style={{ marginBottom: '0.5rem', fontSize: '1.8rem' }}>{selectedCourseContent.title}</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>by {selectedCourseContent.author}</p>
              
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  {selectedCourseContent.content?.type === 'video' ? '🎬 Video Preview' : selectedCourseContent.content?.type === 'pdf' ? '📄 PDF Document Preview' : '📝 Text Preview'}
                </p>

                {/* Video Player */}
                {selectedCourseContent.content?.type === 'video' && (
                  <div style={{ textAlign: 'center', width: '100%', height: 'calc(100vh - 350px)' }}>
                    <video controls style={{ width: '100%', height: '100%', backgroundColor: '#000', borderRadius: '6px', objectFit: 'contain' }}>
                      <source src={`${API_BASE_URL}/${selectedCourseContent.type === 'Skill' ? 'skills' : 'courses'}/${selectedCourseContent._id}/stream?token=${localStorage.getItem('token')}`} type={selectedCourseContent.content.mimeType} />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}

                {/* PDF Preview */}
                {selectedCourseContent.content?.type === 'pdf' && (
                  <div style={{ width: '100%', height: 'calc(100vh - 350px)', borderRadius: '6px', overflow: 'hidden', background: '#333' }}>
                    <iframe
                      src={`${API_BASE_URL}/${selectedCourseContent.type === 'Skill' ? 'skills' : 'courses'}/${selectedCourseContent._id}/stream?token=${localStorage.getItem('token')}#toolbar=0`}
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

                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ color: 'var(--text-main)', fontWeight: '600', fontSize: '0.9rem' }}>{selectedCourseContent.content?.fileName}</p>
                  {selectedCourseContent.content?.fileName && (
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = `${API_BASE_URL}/${selectedCourseContent.type === 'Skill' ? 'skills' : 'courses'}/${selectedCourseContent._id}/download?token=${localStorage.getItem('token')}`;
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

      <main className="container" style={{ padding: '4rem 0' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Explore Skills</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Discover courses and skills shared by our community of experts.
        </p>

        {/* Search bar */}
        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
          <Search size={20} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, description, or author…"
            style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', fontSize: '1rem' }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem' }}
            >✕</button>
          )}
        </div>

        {/* Category pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '0.35rem 0.9rem',
                borderRadius: '999px',
                border: '1px solid',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: activeCategory === cat ? 'var(--primary)' : 'transparent',
                borderColor: activeCategory === cat ? 'var(--primary)' : 'var(--border-color)',
                color: activeCategory === cat ? 'white' : 'var(--text-muted)',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        {!loading && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            {filtered.length} item{filtered.length !== 1 ? 's' : ''} found
            {search ? ` for "${search}"` : ''}
            {activeCategory !== 'ALL' ? ` in ${activeCategory}` : ''}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <Loader size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>Loading courses…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
            <Search size={44} style={{ color: 'var(--primary)', marginBottom: '1rem', opacity: 0.4 }} />
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
              No courses match your search. Try different keywords or clear the filter.
            </p>
            <button className="btn btn-secondary" onClick={() => { setSearch(''); setActiveCategory('ALL'); }}>
              Clear filters
            </button>
          </div>
        ) : (
          <div className="skills-grid">
            {filtered.map(c => (
              <FeatureCard
                key={c._id}
                icon={c.icon || CATEGORY_ICONS[c.category] || GraduationCap}
                category={<><span style={{ color: 'var(--primary)', opacity: 0.7 }}>{c.type?.toUpperCase()} • </span> {c.category}</>}
                title={c.title}
                desc={c.desc}
                author={c.author}
                actionButton={
                  <button 
                    onClick={() => setSelectedCourseContent(c)}
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  >
                    View Content
                  </button>
                }
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
};

export default Explore;
