import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const navItems = [
    { to: '/', icon: '🏠', label: 'Home', end: true },
    { to: '/onboarding', icon: '📋', label: 'New Application' },
];

const appItems = [
    { to: '/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/score-explanation', icon: '🔍', label: 'Score Breakdown' },
    { to: '/simulator', icon: '🎛️', label: 'Score Simulator' },
    { to: '/admin', icon: '👔', label: 'Lender Panel' },
];

export default function Sidebar() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button className="mobile-nav-toggle" onClick={() => setOpen(true)}>☰</button>
            <div className={`sidebar-overlay ${open ? 'open' : ''}`} onClick={() => setOpen(false)} />
            <aside className={`sidebar ${open ? 'open' : ''}`}>
                <div className="sidebar-logo">
                    <div className="logo-mark">
                        <div className="logo-icon">⚡</div>
                        <span className="logo-text">Shadow<span>Credit</span></span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <span className="nav-section-label">Navigation</span>
                    {navItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            onClick={() => setOpen(false)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}

                    <span className="nav-section-label">Platform</span>
                    {appItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            onClick={() => setOpen(false)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div style={{ marginBottom: 4 }}>v1.0.0 · Demo Mode</div>
                    <div style={{ color: 'var(--accent)', fontSize: 10 }}>● API Connected</div>
                </div>
            </aside>
        </>
    );
}
