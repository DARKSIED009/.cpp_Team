import { useState } from 'react';
import { getAICoachPlan } from '../api';

export default function AICoach({ workerProfile }) {
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const generatePlan = async () => {
        setLoading(true);
        setError(false);
        try {
            const result = await getAICoachPlan(workerProfile);
            setPlan(result.text);
        } catch (err) {
            console.error(err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const parsePlan = (text) => {
        // Find sections
        const sections = [
            { id: '7-day', title: '7-Day Quick Wins', content: [] },
            { id: '30-day', title: '30-Day Habits', content: [] },
            { id: '90-day', title: '90-Day Strategy', content: [] }
        ];

        let currentSection = -1;
        const lines = text.split('\n');

        lines.forEach(line => {
            if (line.toLowerCase().includes('7-day plan') || line.toLowerCase().includes('7 day plan')) {
                currentSection = 0;
            } else if (line.toLowerCase().includes('30-day plan') || line.toLowerCase().includes('30 day plan')) {
                currentSection = 1;
            } else if (line.toLowerCase().includes('90-day plan') || line.toLowerCase().includes('90 day plan')) {
                currentSection = 2;
            } else if (currentSection !== -1 && line.trim() !== '') {
                sections[currentSection].content.push(line.replace(/^\*?\s*/, '').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>'));
            }
        });

        // Fallback if parsing fails (e.g. AI formats it completely differently)
        if (sections.every(s => s.content.length === 0)) {
            return null;
        }

        return sections;
    };

    const parsed = plan ? parsePlan(plan) : null;

    return (
        <div className="card">
            <div className="card-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
                <div>
                    <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        🎯 AI Growth Coach
                    </span>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                        Generates a personalized 90-day trajectory to optimize scores and risk tier.
                    </div>
                </div>
                {!plan && !loading && (
                    <button className="btn btn-primary btn-sm" onClick={generatePlan}>
                        Generate Action Plan
                    </button>
                )}
            </div>

            <div className="card-body" style={{ paddingTop: 16 }}>
                {loading && (
                    <div className="ai-loader" style={{ padding: '40px 0' }}>
                        <div className="spinner" style={{ width: 24, height: 24, borderWidth: 3 }} />
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>AI compiling strategic action plan...</span>
                    </div>
                )}

                {error && !loading && (
                    <div style={{ color: 'var(--risk-high)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>⚠</span> Failed to generate AI plan. Rate limit may have been hit.
                    </div>
                )}

                {!loading && plan && parsed && (
                    <div className="coach-timeline" style={{ position: 'relative', marginTop: 10, paddingLeft: 10 }}>
                        {/* Timeline wire */}
                        <div style={{ position: 'absolute', left: 21, top: 10, bottom: 20, width: 2, background: 'var(--border-subtle)', zIndex: 0 }} />
                        
                        {parsed.map((section, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: 20, marginBottom: 24, position: 'relative', zIndex: 1 }}>
                                <div style={{ 
                                    width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-primary)', 
                                    border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', 
                                    justifyContent: 'center', flexShrink: 0, marginTop: 2,
                                    color: 'var(--accent)', fontSize: 10, fontWeight: 'bold'
                                }}>
                                    {idx + 1}
                                </div>
                                <div style={{ flex: 1, background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                                        {section.title}
                                    </div>
                                    <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
                                        {section.content.map((item, i) => (
                                            <li key={i} dangerouslySetInnerHTML={{ __html: item }} style={{ marginBottom: 4 }} />
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && plan && !parsed && (
                    // Fallback plain markdown renderer if parse failed
                    <div className="ai-text markdown-body" style={{ marginTop: 10 }}>
                        {plan.split('\n').map((line, i) => {
                            let cl = line.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
                            if (line.startsWith('* ') || line.startsWith('- ')) return <li key={i} dangerouslySetInnerHTML={{__html: cl.substring(2)}} />;
                            if (line.trim() === '') return <br key={i} />;
                            return <p key={i} dangerouslySetInnerHTML={{__html: cl}} />;
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
