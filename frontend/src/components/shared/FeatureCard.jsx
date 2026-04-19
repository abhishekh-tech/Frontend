import React from 'react';
import { User, ChevronRight } from 'lucide-react';

const FeatureCard = ({ icon: IconComponent, title, desc, author, category, actionButton }) => (
  <div className="skill-card glass-panel">
    <div className="skill-icon-wrapper">
      <IconComponent size={24} />
    </div>
    <div>
      <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold', marginBottom: '0.2rem' }}>{category}</div>
      <h3 className="card-title">{title}</h3>
      <p className="card-desc">{desc}</p>
    </div>
    <div className="card-footer">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        <User size={16} /> {author}
      </div>
      {actionButton ? actionButton : <ChevronRight size={18} color="var(--primary)" />}
    </div>
  </div>
);

export default FeatureCard;
