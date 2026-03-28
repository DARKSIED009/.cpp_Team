import { useEffect, useRef } from 'react';

export default function ScoreGauge({ score, riskBand, riskColor }) {
    const circumference = 2 * Math.PI * 80;
    const progress = Math.min(score / 1000, 1);
    const dashOffset = circumference * (1 - progress * 0.75); // 270° arc

    const colorMap = {
        'Excellent': '#10b981',
        'Good': '#14b8a6',
        'Fair': '#f59e0b',
        'High Risk': '#ef4444',
    };
    const color = colorMap[riskBand] || '#14b8a6';

    return (
        <div className="score-gauge-wrapper">
            <svg className="gauge-svg" width="220" height="200" viewBox="0 0 220 200">
                {/* Background arc */}
                <circle
                    cx="110" cy="120" r="80"
                    fill="none"
                    stroke="#1f2937"
                    strokeWidth="14"
                    strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
                    strokeDashoffset={circumference * 0.125}
                    strokeLinecap="round"
                    transform="rotate(135 110 120)"
                />
                {/* Score arc */}
                <circle
                    cx="110" cy="120" r="80"
                    fill="none"
                    stroke={color}
                    strokeWidth="14"
                    strokeDasharray={`${circumference}`}
                    strokeDashoffset={dashOffset + circumference * 0.125}
                    strokeLinecap="round"
                    transform="rotate(135 110 120)"
                    style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.5s' }}
                    filter={`drop-shadow(0 0 8px ${color}80)`}
                />

                {/* Band markers */}
                {[0, 0.5, 0.65, 0.8, 1].map((pct, i) => {
                    const angle = (135 + pct * 270) * (Math.PI / 180);
                    const r = 95;
                    const x = 110 + r * Math.cos(angle);
                    const y = 120 + r * Math.sin(angle);
                    return (
                        <circle key={i} cx={x} cy={y} r="2.5" fill="#374151" />
                    );
                })}

                {/* Score number */}
                <text
                    x="110" y="116"
                    textAnchor="middle"
                    className="gauge-score-text"
                    style={{ fill: 'var(--text-primary)', fontSize: 42, fontWeight: 800 }}
                >
                    {score}
                </text>
                <text
                    x="110" y="138"
                    textAnchor="middle"
                    style={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 500 }}
                >
                    out of 1000
                </text>
                <text
                    x="110" y="156"
                    textAnchor="middle"
                    style={{ fill: color, fontSize: 14, fontWeight: 700 }}
                >
                    {riskBand}
                </text>
            </svg>

            {/* Legend */}
            <div className="flex gap-3" style={{ marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                {[['<500', 'High Risk', '#ef4444'], ['500', 'Fair', '#f59e0b'], ['650', 'Good', '#14b8a6'], ['800', 'Excellent', '#10b981']].map(([label, band, c]) => (
                    <div key={band} className="flex items-center gap-1" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: c }} />
                        <span>{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
