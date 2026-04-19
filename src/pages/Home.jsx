import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Code2, Palette, Globe, ChevronRight, GraduationCap, BookOpen, Music, Dumbbell } from 'lucide-react';
import Navbar from '../components/shared/Navbar';
import FeatureCard from '../components/shared/FeatureCard';
import { fetchWithAuth } from '../utils/api';

const CATEGORY_ICONS = {
  PROGRAMMING: Code2,
  DESIGN: Palette,
  LANGUAGES: Globe,
  BUSINESS: BookOpen,
  MUSIC: Music,
  FITNESS: Dumbbell,
  OTHER: GraduationCap,
};

const STATIC_TRENDING = [
  { _id: 's1', icon: Code2,   category: 'PROGRAMMING', title: 'Advanced React Patterns',   desc: 'I will teach you how to build scalable React applications using modern design patterns.', author: 'Alex D.' },
  { _id: 's2', icon: Palette, category: 'DESIGN',       title: 'UI/UX Fundamentals',        desc: 'Learn Figma basics, wireframing, and how to create beautiful user interfaces.', author: 'Sarah K.' },
  { _id: 's3', icon: Globe,   category: 'LANGUAGES',    title: 'Conversational Spanish',    desc: 'Practice spoken Spanish with a native speaker. Focus on real-world conversations.', author: 'Carlos M.' },
];

const Home = () => {
  const navigate = useNavigate();
  const [trending, setTrending] = useState(STATIC_TRENDING);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return; // Guest users see static cards

    const fetchTrending = async () => {
      try {
        const res = await fetchWithAuth('/courses');
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          // Show the 3 most recently added courses as "Trending"
          const mapped = data.slice(0, 3).map(c => ({
            ...c,
            icon: CATEGORY_ICONS[c.category] || GraduationCap,
          }));
          setTrending(mapped);
        }
      } catch {
        // silently keep static fallback
      }
    };

    fetchTrending();
  }, []);

  return (
    <>
      <Navbar />
      <main className="container">
        <section className="hero">
          <div style={{ animation: 'float 6s ease-in-out infinite' }}>
            <h1>Master new skills.<br />Share what you know.</h1>
            <p>Join the premier exchange platform where creatives, developers, and makers trade their expertise without spending a dime.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button onClick={() => navigate('/explore')} className="btn btn-primary">
                Explore Skills <Search size={18} />
              </button>
              <button onClick={() => navigate('/signup')} className="btn btn-secondary">
                Start Teaching
              </button>
            </div>
          </div>
        </section>

        <section style={{ padding: '4rem 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Trending Skills</h2>
              <p style={{ color: 'var(--text-muted)' }}>Learn from top-rated mentors in our community.</p>
            </div>
            <Link to="/explore" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              View all <ChevronRight size={16} />
            </Link>
          </div>

          <div className="skills-grid">
            {trending.map(c => (
              <FeatureCard
                key={c._id}
                icon={c.icon}
                category={c.category}
                title={c.title}
                desc={c.desc}
                author={c.author}
              />
            ))}
          </div>
        </section>
      </main>
    </>
  );
};

export default Home;
