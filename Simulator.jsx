import { useEffect, useState } from 'react';
import { getWorkers, simulateScore, getAISimulateAdvice } from './api';
import RiskBadge from './RiskBadge';
import ScoreGauge from './ScoreGauge';
import AIPanel from './components/AIPanel';

export default function Simulator() {
    const [workers, setWorkers] = useState([]);
    const [selectedId, setSelectedId] = useState(1);
    const [sliders, setSliders] = useState({
        rating_delta: 0,
        cancellation_reduction_pct: 0,
        volatility_reduction_pct: 0,
    });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [autoCalc, setAutoCalc] = useState(true);

    const [debouncedResult, setDebouncedResult] = useState(null);

    useEffect(() => {
        getWorkers().then(w => { setWorkers(w); if (w.length > 0) setSelectedId(w[0].id); });
    }, []);

    useEffect(() => {
        if (autoCalc) runSimulation();
    }, [sliders, selectedId]);

    // Debounce the AI requests to prevent rate-limiting the Gemini API
    useEffect(() => {
        if (!result) return;
        const timer = setTimeout(() => {
            setDebouncedResult(result);
        }, 1500);
        return () => clearTimeout(timer);
    }, [result]);

    const runSimulation = async () => {
        if (!selectedId) return;
        setLoading(true);
        try {
            const data = await simulateScore({ worker_id: selectedId, ...sliders });
            setResult(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const setSlider = (key, val) => setSliders(s => ({ ...s, [key]: val }));

    const selectedWorker = workers.find(w => w.id === selectedId);
    const delta = result ? result.score_delta : 0;
    const bandChanged = result && result.original_risk_band !== result.simulated_risk_band;

    return (
        <div className="animate-in">
            <div className="page-header">
                <h1>Score Simulator</h1>
                <p>Adjust behavioral factors and see how your credit score would change in real time</p>
            </div>

            {/* Worker selector */}
            {workers.length > 0 && (
                <div className="worker-selector">
                    {workers.map(w => (
                        <div key={w.id} className={`worker-chip ${selectedId === w.id ? 'active' : ''}`} onClick={() => setSelectedId(w.id)}>
                            <div className="avatar" style={{ width: 24, height: 24, fontSize: 9, borderRadius: 6 }}>{w.avatar}</div>
                            {w.name}
                        </div>
                    ))}
                </div>
            )}

            <div className="simulator-layout">
                {/* Left: sliders */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div className="card">
                        <div className="card-header">
                            <span className="card-title">Adjustment Controls</span>
                            {selectedWorker && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selectedWorker.name} · Current: {selectedWorker.score}</span>}
                        </div>

                        <div className="slider-group">
                            {/* Rating */}
                            <div className="slider-item">
                                <div className="slider-header">
                                    <span className="slider-label">⭐ Improve Rating</span>
                                    <span className="slider-value">+{sliders.rating_delta.toFixed(1)}</span>
                                </div>
                                <input
                                    className="range-input"
                                    type="range" min="0" max="1.5" step="0.1"
                                    value={sliders.rating_delta}
                                    onChange={e => setSlider('rating_delta', parseFloat(e.target.value))}
                                />
                                <div className="flex justify-between" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                    <span>No change</span>
                                    <span>+1.5 stars</span>
                                </div>
                                {sliders.rating_delta > 0 && selectedWorker && (
                                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                                        Rating: {selectedWorker.rating} → {Math.min(5.0, selectedWorker.rating + sliders.rating_delta).toFixed(1)} / 5.0
                                    </div>
                                )}
                            </div>

                            <div className="divider" style={{ margin: '4px 0' }} />

                            {/* Cancellations */}
                            <div className="slider-item">
                                <div className="slider-header">
                                    <span className="slider-label">✅ Reduce Cancellations</span>
                                    <span className="slider-value">{sliders.cancellation_reduction_pct}%</span>
                                </div>
                                <input
                                    className="range-input"
                                    type="range" min="0" max="100" step="5"
                                    value={sliders.cancellation_reduction_pct}
                                    onChange={e => setSlider('cancellation_reduction_pct', parseInt(e.target.value))}
                                />
                                <div className="flex justify-between" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                    <span>No reduction</span>
                                    <span>100% fewer</span>
                                </div>
                            </div>

                            <div className="divider" style={{ margin: '4px 0' }} />

                            {/* Income volatility */}
                            <div className="slider-item">
                                <div className="slider-header">
                                    <span className="slider-label">📈 Reduce Income Volatility</span>
                                    <span className="slider-value">{sliders.volatility_reduction_pct}%</span>
                                </div>
                                <input
                                    className="range-input"
                                    type="range" min="0" max="100" step="5"
                                    value={sliders.volatility_reduction_pct}
                                    onChange={e => setSlider('volatility_reduction_pct', parseInt(e.target.value))}
                                />
                                <div className="flex justify-between" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                    <span>No change</span>
                                    <span>Fully stable</span>
                                </div>
                            </div>
                        </div>

                        {/* Reset */}
                        <button
                            className="btn btn-ghost btn-sm"
                            style={{ marginTop: 16 }}
                            onClick={() => setSliders({ rating_delta: 0, cancellation_reduction_pct: 0, volatility_reduction_pct: 0 })}
                        >
                            ↺ Reset all adjustments
                        </button>
                    </div>

                    {/* What-if guide */}
                    <div className="card" style={{ borderLeft: '3px solid var(--accent)' }}>
                        <div className="card-title mb-3">What These Adjustments Mean</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {[
                                ['⭐', 'Rating improvement', 'Represents actively providing better service, completing more deliveries cleanly, or getting customer compliments.'],
                                ['✅', 'Cancellation reduction', 'Represents accepting and completing more orders without cancelling — building reliability.'],
                                ['📈', 'Income stability', 'Represents working consistent hours monthly rather than feast-and-famine patterns.'],
                            ].map(([icon, title, desc]) => (
                                <div key={title} className="flex gap-2" style={{ padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                                    <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{title}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: results */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {result && !loading ? (
                        <>
                            {/* Before vs After */}
                            <div className="card">
                                <div className="card-header">
                                    <span className="card-title">Score Comparison</span>
                                    {loading && <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />}
                                </div>

                                <div className="score-compare">
                                    <div className="score-compare-item">
                                        <div className="score-compare-label">Current</div>
                                        <div className="score-compare-value original">{result.original_score}</div>
                                        <RiskBadge band={result.original_risk_band} />
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: 30, color: 'var(--text-muted)' }}>→</div>
                                        <div className={`score-delta ${delta < 0 ? 'negative' : ''}`}>
                                            {delta >= 0 ? '+' : ''}{delta}
                                        </div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>points</div>
                                    </div>
                                    <div className="score-compare-item">
                                        <div className="score-compare-label">Projected</div>
                                        <div className="score-compare-value simulated">{result.simulated_score}</div>
                                        <RiskBadge band={result.simulated_risk_band} />
                                    </div>
                                </div>

                                {bandChanged && (
                                    <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 'var(--radius-sm)', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', fontSize: 13, fontWeight: 500 }}>
                                        🎉 Risk band upgrade! {result.original_risk_band} → {result.simulated_risk_band}
                                    </div>
                                )}
                            </div>

                            {/* Projected gauge */}
                            <div className="card" style={{ alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
                                <div className="card-title mb-2">Projected Score</div>
                                <ScoreGauge score={result.simulated_score} riskBand={result.simulated_risk_band} />
                            </div>

                            {/* Factor deltas */}
                            <div className="card">
                                <div className="card-title mb-3">Factor Impact</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {Object.entries(result.simulated_report?.factors || {}).map(([key, val]) => {
                                        const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                                        return (
                                            <div key={key} className="flex justify-between items-center" style={{ fontSize: 13 }}>
                                                <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                                                <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{val}%</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            {/* Context */}
                            <div className="card simulate-ai-card">
                                <AIPanel 
                                    title="AI Simulator Context" 
                                    icon="💡" 
                                    fetchFn={getAISimulateAdvice} 
                                    args={debouncedResult ? [debouncedResult.original_score, debouncedResult.simulated_score, debouncedResult.adjustments] : null} 
                                    trigger={debouncedResult ? `${debouncedResult.simulated_score}-${JSON.stringify(debouncedResult.adjustments)}` : null} 
                                />
                            </div>
                        </>
                    ) : (
                        <div className="card" style={{ alignItems: 'center', display: 'flex', flexDirection: 'column', minHeight: 300, justifyContent: 'center' }}>
                            {loading ? (
                                <><div className="spinner" /><p style={{ marginTop: 12, color: 'var(--text-muted)' }}>Recalculating...</p></>
                            ) : (
                                <p style={{ color: 'var(--text-muted)' }}>Adjust sliders to see simulated score</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
