import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const features = [
    { icon: '🧠', title: 'Behavioral Scoring', desc: 'Analyzes 7 behavioral signals from real earnings data, not just salary slips.' },
    { icon: '📈', title: 'Income Trend Analysis', desc: 'Tracks monthly income patterns to detect stability and growth trajectory.' },
    { icon: '⭐', title: 'Platform Reputation', desc: 'Incorporates customer ratings and reliability metrics from gig platforms.' },
    { icon: '🎛️', title: 'Score Simulator', desc: 'Lets workers see how improving their behavior can boost their credit score.' },
    { icon: '🏦', title: 'Loan Eligibility', desc: 'Estimates loan eligibility based on behavioral score and income history.' },
    { icon: '🔒', title: 'Risk Assessment', desc: 'Provides lenders with a transparent, explainable risk band for each worker.' },
];

const stats = [
    { value: '45', suffix: 'M+', label: 'Gig Workers in India' },
    { value: '92', suffix: '%', label: 'Lack Formal Credit Scores' },
    { value: '3.2', suffix: 'x', label: 'Higher Approval Rate' },
];

function AnimatedCounter({ target, suffix }) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        const isDecimal = String(target).includes('.');
        const duration = 1800;
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) { setCount(target); clearInterval(timer); }
            else setCount(isDecimal ? parseFloat(current.toFixed(1)) : Math.floor(current));
        }, duration / steps);
        return () => clearInterval(timer);
    }, [target]);
    return <span>{count}{suffix}</span>;
}

export default function Landing() {
    const navigate = useNavigate();

    return (
        <div className="landing-page">
            {/* Nav */}
            <nav className="landing-nav">
                <div className="flex items-center gap-2">
                    <div className="logo-icon">⚡</div>
                    <span className="logo-text" style={{ fontSize: 16 }}>Shadow<span style={{ color: 'var(--accent)' }}>Credit</span></span>
                </div>
                <div className="flex gap-3">
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin')}>Lender Portal</button>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate('/onboarding')}>Get Your Score</button>
                </div>
            </nav>

            {/* Hero */}
            <section className="landing-hero">
                <div className="hero-grid-bg" />
                <div className="hero-glow" />

                <div className="hero-badge animate-in">
                    <span>🚀</span> Behavioral Credit Scoring · India's Gig Workers
                </div>

                <h1 className="hero-title animate-in" style={{ animationDelay: '0.1s' }}>
                    Your Work History<br />
                    <span className="accent">Is Your Credit Score</span>
                </h1>

                <p className="hero-subtitle animate-in" style={{ animationDelay: '0.2s' }}>
                    ShadowCredit builds a behavioral credit profile from your gig earnings, ratings, and consistency — no salary slip required. Access fair financial products based on how you actually work.
                </p>

                <div className="hero-cta animate-in" style={{ animationDelay: '0.3s' }}>
                    <button className="btn btn-primary btn-lg" onClick={() => navigate('/onboarding')}>
                        🎯 Calculate My Score
                    </button>
                    <button className="btn btn-secondary btn-lg" onClick={() => navigate('/dashboard')}>
                        📊 View Demo Dashboard
                    </button>
                </div>

                <div className="hero-stats animate-in" style={{ animationDelay: '0.4s' }}>
                    {stats.map(s => (
                        <div className="hero-stat" key={s.label}>
                            <div className="hero-stat-value">
                                <AnimatedCounter target={parseFloat(s.value)} suffix={s.suffix} />
                            </div>
                            <div className="hero-stat-label">{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section className="features-section">
                <div className="section-heading">
                    <h2>Built For The New Economy</h2>
                    <p>Comprehensive behavioral signals give gig workers a fair shot at formal credit.</p>
                </div>

                <div className="features-grid">
                    {features.map(f => (
                        <div className="feature-card" key={f.title}>
                            <div className="feature-icon">{f.icon}</div>
                            <h3>{f.title}</h3>
                            <p>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Score Factors Strip */}
            <section style={{ padding: '40px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ maxWidth: 900, margin: '0 auto' }}>
                    <h3 style={{ textAlign: 'center', marginBottom: 32, fontSize: 20, fontWeight: 700 }}>
                        The 7 Factors Behind Your Score
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                        {[
                            ['Income Stability', '25%', '#14b8a6'],
                            ['Work Consistency', '20%', '#10b981'],
                            ['Platform Reputation', '20%', '#3b82f6'],
                            ['Activity Longevity', '10%', '#8b5cf6'],
                            ['Reliability', '10%', '#f59e0b'],
                            ['Financial Discipline', '10%', '#ec4899'],
                            ['Growth Trend', '5%', '#ef4444'],
                        ].map(([name, pct, color]) => (
                            <div key={name} style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '10px 14px', background: 'var(--bg-card)',
                                borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)'
                            }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                                <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{name}</span>
                                <span style={{ fontSize: 13, fontWeight: 700, color }}>{pct}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Footer */}
            <section style={{ padding: '80px 40px', textAlign: 'center' }}>
                <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16, letterSpacing: '-0.3px' }}>
                    Ready to See Your Score?
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 16 }}>
                    Takes under 2 minutes. No documents required.
                </p>
                <button className="btn btn-primary btn-lg" onClick={() => navigate('/onboarding')}>
                    Start Free Assessment →
                </button>
            </section>

            <footer style={{ padding: '20px 40px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                <span>© 2025 ShadowCredit · Prototype Demo</span>
                <span>Built with FastAPI + React</span>
            </footer>
        </div>
    );
}
