import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from './Navbar';

const DashboardLayout = ({ children, sidebarLinks }) => {
  const location = useLocation();
  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          <div style={{ padding: '0 1rem' }}>
            <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1px' }}>Menu</h3>
          </div>
          <nav className="dashboard-nav" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {sidebarLinks.map((link, idx) => (
              <Link
                key={idx}
                to={link.path}
                className={location.pathname === link.path ? 'active' : ''}
                style={{ cursor: link.path === '#' ? 'default' : 'pointer' }}
              >
                <link.icon size={20} /> {link.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="dashboard-content">
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </div>
    </>
  );
};

export default DashboardLayout;
