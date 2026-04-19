import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Code2, Palette, Heart } from 'lucide-react';
import FeatureCard from '../../components/shared/FeatureCard';

const LearnerWishlist = () => {
  const [items, setItems] = useState(() => [
    { _id: 'w1', icon: Code2, category: 'PROGRAMMING', title: 'Advanced React Patterns', desc: 'Saved for later — open Overview to enroll when you are ready.', author: 'Alex D.' },
    { _id: 'w2', icon: Palette, category: 'DESIGN', title: 'Logo Animation', desc: 'Motion design in After Effects for brand systems.', author: 'Priya R.' },
  ]);

  const removeItem = (id) => setItems((prev) => prev.filter((c) => c._id !== id));

  return (
    <>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Wishlist</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Courses and skills you want to revisit. Remove anything you no longer need, or go to Overview to enroll.
        </p>
      </header>
      {items.length === 0 ? (
        <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <Heart size={44} style={{ color: 'var(--primary)', marginBottom: '1rem', opacity: 0.85 }} />
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
            Nothing saved yet. When you add courses to your wishlist, they will show up here.
          </p>
          <Link to="/dashboard/learner" className="btn btn-primary">
            Browse courses
          </Link>
        </div>
      ) : (
        <div className="skills-grid" style={{ paddingTop: 0 }}>
          {items.map((course) => (
            <FeatureCard
              key={course._id}
              icon={course.icon}
              category={course.category}
              title={course.title}
              desc={course.desc}
              author={course.author}
              actionButton={
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}
                  onClick={() => removeItem(course._id)}
                >
                  Remove
                </button>
              }
            />
          ))}
        </div>
      )}
    </>
  );
};

export default LearnerWishlist;
