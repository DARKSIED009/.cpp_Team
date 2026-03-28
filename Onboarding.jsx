import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateScore } from './api';

const steps = ['Basic Info', 'Work History', 'Income Data', 'Review'];

const jobTypes = ['Delivery Rider', 'Cab Driver', 'Freelancer', 'Home Services', 'Other'];
const platforms = ['Swiggy / Zomato', 'Ola / Uber', 'Rapido', 'Upwork / Fiverr', 'Urban Company', 'Dunzo', 'Other'];

const defaultForm = {
    name: '',
    job_type: '',
    platform: '',
    city: '',
    rating: '',
    months_active: '',
    account_age_months: '',
    active_months_last_year: '',
    completed_jobs: '',
    cancellations: '',
    income_sources: '1',
    monthly_incomes: [],
    incomeInput: '',
};

export default function Onboarding() {
    const [step, setStep] = useState(0);
    const [form, setForm] = useState(defaultForm);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const addIncome = () => {
        const val = parseFloat(form.incomeInput);
        if (!isNaN(val) && val > 0 && form.monthly_incomes.length < 12) {
            set('monthly_incomes', [...form.monthly_incomes, val]);
            set('incomeInput', '');
        }
    };

    const removeIncome = (i) => {
        set('monthly_incomes', form.monthly_incomes.filter((_, idx) => idx !== i));
    };

    const next = () => {
        setError('');
        if (step === 0 && (!form.name || !form.job_type || !form.platform || !form.city)) {
            setError('Please fill all fields.'); return;
        }
        if (step === 1 && (!form.rating || !form.months_active || !form.completed_jobs)) {
            setError('Please fill all required fields.'); return;
        }
        if (step === 2 && form.monthly_incomes.length < 3) {
            setError('Please enter at least 3 months of income data.'); return;
        }
        setStep(s => s + 1);
    };

    const submit = async () => {
        setLoading(true);
        setError('');
        try {
            const payload = {
                name: form.name,
                job_type: form.job_type,
                platform: form.platform,
                city: form.city,
                rating: parseFloat(form.rating),
                months_active: parseInt(form.months_active),
                account_age_months: parseInt(form.account_age_months || form.months_active),
                active_months_last_year: parseInt(form.active_months_last_year || Math.min(form.months_active, 12)),
                completed_jobs: parseInt(form.completed_jobs),
                cancellations: parseInt(form.cancellations || 0),
                income_sources: parseInt(form.income_sources || 1),
                monthly_incomes: form.monthly_incomes,
            };
            const result = await calculateScore(payload);
            sessionStorage.setItem('shadowcredit_result', JSON.stringify(result));
            navigate('/dashboard');
        } catch (e) {
            setError('Failed to calculate score. Is the backend running? Try: uvicorn main:app --reload');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="onboarding-page">
            <div className="onboarding-container">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
                        <div className="logo-icon" style={{ width: 28, height: 28, fontSize: 14 }}>⚡</div>
                        <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>ShadowCredit</span>
                    </div>
                    <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.3px', marginBottom: 6 }}>
                        Credit Assessment Form
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                        Step {step + 1} of {steps.length} — {steps[step]}
                    </p>
                </div>

                {/* Step indicators */}
                <div className="step-indicator mb-6">
                    {steps.map((label, i) => (
                        <>
                            <div key={`dot-${i}`} className={`step-dot ${i < step ? 'done' : i === step ? 'active' : 'pending'}`}>
                                {i < step ? '✓' : i + 1}
                            </div>
                            {i < steps.length - 1 && (
                                <div key={`line-${i}`} className={`step-line ${i < step ? 'done' : ''}`} />
                            )}
                        </>
                    ))}
                </div>

                {/* Form card */}
                <div className="card animate-in">
                    {error && (
                        <div className="signal-item danger mb-4" style={{ display: 'flex' }}>⚠ {error}</div>
                    )}

                    {/* Step 0: Basic Info */}
                    {step === 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 4 }}>Basic Information</h2>
                            <div className="form-group">
                                <label className="form-label">Full Name <span>*</span></label>
                                <input className="form-input" placeholder="e.g. Ravi Kumar" value={form.name} onChange={e => set('name', e.target.value)} />
                            </div>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Job Type <span>*</span></label>
                                    <select className="form-select" value={form.job_type} onChange={e => set('job_type', e.target.value)}>
                                        <option value="">Select...</option>
                                        {jobTypes.map(j => <option key={j}>{j}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Primary Platform <span>*</span></label>
                                    <select className="form-select" value={form.platform} onChange={e => set('platform', e.target.value)}>
                                        <option value="">Select...</option>
                                        {platforms.map(p => <option key={p}>{p}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">City <span>*</span></label>
                                <input className="form-input" placeholder="e.g. Bengaluru" value={form.city} onChange={e => set('city', e.target.value)} />
                            </div>
                        </div>
                    )}

                    {/* Step 1: Work History */}
                    {step === 1 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 4 }}>Work History</h2>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Customer Rating (1–5) <span>*</span></label>
                                    <input className="form-input" type="number" min="1" max="5" step="0.1" placeholder="e.g. 4.6" value={form.rating} onChange={e => set('rating', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Months Active <span>*</span></label>
                                    <input className="form-input" type="number" min="1" placeholder="e.g. 18" value={form.months_active} onChange={e => set('months_active', e.target.value)} />
                                </div>
                            </div>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Completed Jobs <span>*</span></label>
                                    <input className="form-input" type="number" min="0" placeholder="e.g. 1240" value={form.completed_jobs} onChange={e => set('completed_jobs', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Cancellations</label>
                                    <input className="form-input" type="number" min="0" placeholder="e.g. 48" value={form.cancellations} onChange={e => set('cancellations', e.target.value)} />
                                </div>
                            </div>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Active Months Last Year</label>
                                    <input className="form-input" type="number" min="0" max="12" placeholder="e.g. 11" value={form.active_months_last_year} onChange={e => set('active_months_last_year', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Account Age (months)</label>
                                    <input className="form-input" type="number" min="1" placeholder="e.g. 20" value={form.account_age_months} onChange={e => set('account_age_months', e.target.value)} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Number of Income Sources</label>
                                <input className="form-input" type="number" min="1" max="10" placeholder="e.g. 2" value={form.income_sources} onChange={e => set('income_sources', e.target.value)} />
                                <span className="form-hint">Count all gig platforms you earn from</span>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Income Data */}
                    {step === 2 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 4 }}>Monthly Income History</h2>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                Enter monthly earnings (₹) from most recent to oldest. Enter 3–12 months. ({form.monthly_incomes.length}/12 added)
                            </p>
                            <div className="flex gap-2">
                                <input
                                    className="form-input"
                                    type="number"
                                    placeholder="Monthly income in ₹"
                                    value={form.incomeInput}
                                    onChange={e => set('incomeInput', e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addIncome()}
                                    style={{ flex: 1 }}
                                />
                                <button className="btn btn-primary" onClick={addIncome} disabled={form.monthly_incomes.length >= 12}>
                                    + Add
                                </button>
                            </div>
                            {form.monthly_incomes.length > 0 && (
                                <div className="income-tags">
                                    {form.monthly_incomes.map((inc, i) => (
                                        <span key={i} className="income-tag">
                                            ₹{inc.toLocaleString()}
                                            <button onClick={() => removeIncome(i)}>×</button>
                                        </span>
                                    ))}
                                </div>
                            )}
                            {form.monthly_incomes.length >= 3 && (
                                <div style={{ padding: '12px 16px', background: 'var(--accent-glow)', borderRadius: 'var(--radius-sm)', fontSize: 13, color: 'var(--accent-light)' }}>
                                    ✓ Sufficient data entered. Avg: ₹{Math.round(form.monthly_incomes.reduce((a, b) => a + b, 0) / form.monthly_incomes.length).toLocaleString()}/month
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3: Review */}
                    {step === 3 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 4 }}>Review Your Application</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                {[
                                    ['Name', form.name],
                                    ['Job Type', form.job_type],
                                    ['Platform', form.platform],
                                    ['City', form.city],
                                    ['Rating', `${form.rating} / 5.0`],
                                    ['Months Active', form.months_active],
                                    ['Completed Jobs', parseInt(form.completed_jobs).toLocaleString()],
                                    ['Cancellations', form.cancellations || '0'],
                                    ['Income Entries', `${form.monthly_incomes.length} months`],
                                    ['Avg Monthly', `₹${Math.round(form.monthly_incomes.reduce((a, b) => a + b, 0) / form.monthly_incomes.length || 0).toLocaleString()}`],
                                ].map(([label, val]) => (
                                    <div key={label} style={{ padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{label}</div>
                                        <div style={{ fontSize: 14, fontWeight: 600 }}>{val}</div>
                                    </div>
                                ))}
                            </div>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                                By submitting, you confirm the above data is accurate. This is a prototype and scores are for demonstration only.
                            </p>
                        </div>
                    )}

                    {/* Nav buttons */}
                    <div className="flex justify-between" style={{ marginTop: 28 }}>
                        <button
                            className="btn btn-secondary"
                            onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/')}
                        >
                            ← {step > 0 ? 'Back' : 'Home'}
                        </button>

                        {step < 3 ? (
                            <button className="btn btn-primary" onClick={next}>
                                Continue →
                            </button>
                        ) : (
                            <button className="btn btn-primary" onClick={submit} disabled={loading}>
                                {loading ? '⏳ Calculating...' : '🎯 Calculate My Score'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
