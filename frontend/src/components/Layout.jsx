import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Dashboard, Tune, BarChart, Speed, Settings, History, Assessment } from '@mui/icons-material';

const navItems = [
  { to: '/', icon: Dashboard, label: 'Dashboard', end: true },
  { to: '/optimization', icon: Tune, label: 'Optimization' },
  { to: '/explainability', icon: BarChart, label: 'Analytics' },
  { to: '/execution', icon: Speed, label: 'Execution' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/gap-analysis', icon: Assessment, label: 'Gap Analysis' },
];

const navStyle = (isActive) => ({
  display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', borderRadius: '8px',
  textDecoration: 'none', color: isActive ? '#1152d4' : '#666',
  backgroundColor: isActive ? '#f0f4ff' : 'transparent',
  fontWeight: isActive ? 600 : 500,
  fontSize: '0.95rem'
});

const Layout = () => {
  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#fafafa', fontFamily: '"Inter", sans-serif', color: '#1a1a1a' }}>
      {/* Sidebar */}
      <nav style={{ width: '240px', backgroundColor: '#ffffff', borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '2rem 1.5rem', fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.5px' }}>
          Powerpuff AI
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0 1rem' }}>
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end} style={({ isActive }) => navStyle(isActive)}>
              <Icon fontSize="small" /> {label}
            </NavLink>
          ))}
        </div>

        <div style={{ marginTop: 'auto', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <NavLink to="/settings" style={({ isActive }) => navStyle(isActive)}>
            <Settings fontSize="small" /> Settings
          </NavLink>
        </div>
      </nav>

      {/* Main Content Area */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '2rem 3rem' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
