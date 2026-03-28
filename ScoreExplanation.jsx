import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWorker, getWorkers } from './api';
import RiskBadge from './RiskBadge';

const FACTOR_META = {
    income_stability: { label: 'Income Stability', weight: 25, icon: '📈', desc: 'Measures how consistent your monthly earnings are. Lower variance = higher score.' },
    work_consistency: { label: 'Work Consistency', weight: 20, icon: '📅', desc: 'Ratio of active working months to total months on the platform.' },
    platform_reputation: { label: 'Platform Reputation', weight: 20, icon: '⭐', desc: 'Based on your average customer rating, normalized from 1–5 scale.' },
    activity_longevity: { label: 'Activity Longevity', weight: 10, icon: '🕐', desc: 'How long you have been active on the platform. Older accounts score higher.' },
    reliability: { label: 'Reliability', weight: 10, icon: '✅', desc: 'Ratio of completed to total jobs. Low cancellation rate improves this.' },
    financial_discipline: { label: 'Financial Discipline', weight: 10, icon: '💡', desc: 'Proxy based on quarter-over-quarter income growth — rewarding upward consistency.' },
    growth_trend: { label: 'Growth Trend', weight: 5, icon: '🚀', desc: 'Compares first-half vs second-half average income to detect earnings growth.' },
};

const FACTOR_COLORS = ['#14b8a6', '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#ef4444'];

export default function ScoreExplanation() {
    const [data, setData] = useState(null);
    const [workers, setWorkers] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const stored = sessionStorage.getItem('shadowcredit_result');
        if (stored) { setData(JSON.parse(stored)); setLoading(false); }
        getWorkers().then(w => {
            setWorkers(w);
            if (!stored && w.length > 0) loadWorker(w[0].id);
        }).catch(() => setLoading(false));
    }, []);

    const loadWorker = (id) => {
        setLoading(true); setSelectedId(id);
        getWorker(id).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
    };

    if (loading) return <div className="loading-screen"><div className="spinner" /><p>Loading score breakdown...</p></div>;
    if (!data) return <div className="error-screen"><p>No data found. <button className="btn btn-secondary btn-sm" onClick={() => navigate('/dashboard')}>Go to Dashboard</button></p></div>;

    const report = data.credit_report || {};
    const profile = data.profile || {};
    const factors = report.factors || {};
    const factorScores = report.factor_scores || {};
    const factorKeys = Object.keys(FACTOR_META);

    return (
        <div className="animate-in">
            <div className="page-header flex justify-between items-center" style={{ flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1>Score Explanation</h1>
                    <p>Detailed breakdown of how each factor contributes to the behavioral credit score</p>
                </div>
                <RiskBadge band={report.risk_band} />
            </div>

            {/* Worker selector */}
            {workers.length > 0 && (
                <div className="worker-selector">
                    {workers.map(w => (
                        <div key={w.id} className={`worker-chip ${selectedId === w.id ? 'active' : ''}`} onClick={() => loadWorker(w.id)}>
                            <div className="avatar" style={{ width: 24, height: 24, fontSize: 9, borderRadius: 6 }}>{w.avatar}</div>
                            {w.name}
                        </div>
                    ))}
                </div>
            )}

            {/* Summary card */}
            <div className="card mb-5" style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 240 }}>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>TOTAL SCORE</div>
                    <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: '-2px', color: report.risk_color || 'var(--accent)', lineHeight: 1.1 }}>
                        {report.score}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>out of 1000 · {report.risk_band}</div>
                </div>
                <div style={{ flex: 2, minWidth: 300 }}>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                        This score is computed from <strong style={{ color: 'var(--text-primary)' }}>7 behavioral signals</strong> derived
                        from {profile.name || 'this worker'}'s platform activity. Each factor is weighted by its importance to
                        creditworthiness for gig workers without formal salary proof.
                    </p>
                </div>
                {/* Score band reference */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 160 }}>
                    {[['800–1000', 'Excellent', '#10b981'], ['650–799', 'Good', '#14b8a6'], ['500–649', 'Fair', '#f59e0b'], ['< 500', 'High Risk', '#ef4444']].map(([range, band, color]) => (
                        <div key={band} className="flex items-center gap-2" style={{ fontSize: 12 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                            <span style={{ color: report.risk_band === band ? color : 'var(--text-muted)', fontWeight: report.risk_band === band ? 600 : 400 }}>
                                {range} · {band}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Factor breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {factorKeys.map((key, idx) => {
                    const meta = FACTOR_META[key];
                    const pct = factors[key] || 0;
                    const pts = factorScores[key] || 0;
                    const color = FACTOR_COLORS[idx];
                    return (
                        <div key={key} className="card card-sm" style={{ display: 'flex', gap: 20, alignItems: 'start', flexWrap: 'wrap' }}>
                            <div style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>{meta.icon}</div>
                            <div style={{ flex: 1, minWidth: 280 }}>
                                <div className="flex justify-between items-center mb-2">
                                    <div>
                                        <span style={{ fontSize: 14, fontWeight: 600 }}>{meta.label}</span>
                                        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>Weight: {meta.weight}%</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span style={{ fontSize: 13, fontWeight: 700, color }}>{pct}%</span>
                                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>({pts} pts)</span>
                                    </div>
                                </div>
                                <div className="progress-bar-track">
                                    <div
                                        className="progress-bar-fill"
                                        style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}60` }}
                                    />
                                </div>
                                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>{meta.desc}</p>
                            </div>
                            {/* Score chip */}
                            <div style={{
                                padding: '6px 14px', borderRadius: 'var(--radius-sm)',
                                background: `${color}18`, border: `1px solid ${color}40`,
                                fontSize: 13, fontWeight: 700, color, flexShrink: 0
                            }}>
                                {pts} / {meta.weight * 10}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Methodology note */}
            <div className="card" style={{ marginTop: 20, borderLeft: '3px solid var(--accent)' }}>
                <div className="card-title mb-2">Scoring Methodology</div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    ShadowCredit uses a weighted multi-factor model. Each factor is normalized to a 0–1 scale before weighting.
                    Income Stability uses the Coefficient of Variation (σ/μ) of monthly earnings. Reliability is the completion ratio.
                    Growth Trend compares first-half vs second-half average income. The weighted sum is multiplied by 1000 to produce the final score.
                </p>
            </div>
        </div>
    );
}
