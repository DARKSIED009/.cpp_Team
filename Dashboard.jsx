import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWorker, getWorkers, getAIExplanation, getAILenderSummary, getAIAnomalyReport } from './api';
import ScoreGauge from './ScoreGauge';
import StatCard from './StatCard';
import RiskBadge from './RiskBadge';
import AIPanel from './components/AIPanel';
import AskAI from './components/AskAI';
import AICoach from './components/AICoach';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, ArcElement, Tooltip, Legend, Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const chartDefaults = {
    plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11, family: 'Inter' }, boxWidth: 12 } } },
    scales: {
        x: { ticks: { color: '#4b5563', font: { size: 11 } }, grid: { color: '#161e2b' } },
        y: { ticks: { color: '#4b5563', font: { size: 11 } }, grid: { color: '#161e2b' } },
    },
};

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [workers, setWorkers] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAnomaly, setShowAnomaly] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Try sessionStorage result first (from onboarding)
        const stored = sessionStorage.getItem('shadowcredit_result');
        if (stored) {
            const parsed = JSON.parse(stored);
            setData(parsed);
            setLoading(false);
        }
        // Also load worker list for selector
        getWorkers().then(w => {
            setWorkers(w);
            if (!stored && w.length > 0) {
                loadWorker(w[0].id);
            }
        }).catch(() => setLoading(false));
    }, []);

    const loadWorker = (id) => {
        setLoading(true);
        setSelectedId(id);
        setShowAnomaly(false);
        sessionStorage.removeItem('shadowcredit_result');
        getWorker(id).then(d => {
            setData(d);
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    if (loading) return (
        <div className="loading-screen">
            <div className="spinner" />
            <p>Loading credit report...</p>
        </div>
    );

    if (!data) return (
        <div className="error-screen">
            <div style={{ fontSize: 48 }}>❌</div>
            <p>Could not load data. Check if backend is running.</p>
            <button className="btn btn-secondary" onClick={() => navigate('/onboarding')}>Try Onboarding</button>
        </div>
    );

    const profile = data.profile || {};
    const report = data.credit_report || {};
    const incomes = profile.monthly_incomes || [];
    const monthLabels = MONTHS.slice(0, incomes.length);

    // Charts
    const earningsData = {
        labels: monthLabels,
        datasets: [{
            label: 'Monthly Income (₹)',
            data: incomes,
            borderColor: '#14b8a6',
            backgroundColor: 'rgba(20,184,166,0.08)',
            borderWidth: 2.5,
            pointBackgroundColor: '#14b8a6',
            pointRadius: 4,
            tension: 0.4,
            fill: true,
        }]
    };

    const factors = report.factors || {};
    const factorLabels = {
        income_stability: 'Income Stability',
        work_consistency: 'Work Consistency',
        platform_reputation: 'Platform Reputation',
        activity_longevity: 'Activity Longevity',
        reliability: 'Reliability',
        financial_discipline: 'Financial Discipline',
        growth_trend: 'Growth Trend',
    };
    const factorColors = ['#14b8a6', '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#ef4444'];

    const doughnutData = {
        labels: Object.values(factorLabels),
        datasets: [{
            data: Object.keys(factorLabels).map(k => factors[k] || 0),
            backgroundColor: factorColors.map(c => c + '99'),
            borderColor: factorColors,
            borderWidth: 2,
            hoverOffset: 8,
        }]
    };

    const completed = profile.completed_jobs || 0;
    const cancelled = profile.cancellations || 0;
    const totalJobs = completed + cancelled;
    const jobsData = {
        labels: ['Completed', 'Cancelled'],
        datasets: [{
            label: 'Jobs',
            data: [completed, cancelled],
            backgroundColor: ['rgba(16,185,129,0.7)', 'rgba(239,68,68,0.7)'],
            borderColor: ['#10b981', '#ef4444'],
            borderWidth: 2,
            borderRadius: 6,
        }]
    };

    const recs = report.recommendations || [];
    const signals = report.risk_signals || [];

    return (
        <div className="animate-in">
            {/* Page Header */}
            <div className="page-header flex justify-between items-center" style={{ flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1>Credit Dashboard</h1>
                    <p>{profile.name ? `${profile.name} · ${profile.job_type || ''} · ${profile.city || ''}` : 'Worker Credit Report'}</p>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/score-explanation')}>
                    🔍 Score Breakdown
                </button>
            </div>

            {/* Worker selector */}
            {workers.length > 0 && (
                <div className="worker-selector">
                    {workers.map(w => (
                        <div
                            key={w.id}
                            className={`worker-chip ${selectedId === w.id ? 'active' : ''}`}
                            onClick={() => loadWorker(w.id)}
                        >
                            <div className="avatar" style={{ width: 24, height: 24, fontSize: 9, borderRadius: 6 }}>{w.avatar}</div>
                            {w.name}
                        </div>
                    ))}
                    <div className="worker-chip" onClick={() => navigate('/onboarding')}>
                        ＋ New Worker
                    </div>
                </div>
            )}

            {/* Score + Stats row */}
            <div className="dashboard-top mb-5">
                <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="card-header w-full">
                        <span className="card-title">Behavioral Score</span>
                        <RiskBadge band={report.risk_band} />
                    </div>
                    <ScoreGauge score={report.score} riskBand={report.risk_band} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="stat-grid">
                        <StatCard icon="💰" label="Avg Monthly Income" value={`₹${(report.avg_monthly_income || 0).toLocaleString()}`} sub="Based on submitted history" />
                        <StatCard icon="📉" label="Income Volatility" value={`${report.income_volatility || 0}%`} sub={report.income_volatility > 40 ? '⚠ High variance' : '✓ Stable earnings'} subType={report.income_volatility > 40 ? 'negative' : 'positive'} />
                        <StatCard icon="⭐" label="Customer Rating" value={`${profile.rating || 'N/A'} / 5.0`} sub={profile.rating >= 4.5 ? 'Excellent' : profile.rating >= 4.0 ? 'Good' : 'Below average'} subType={profile.rating >= 4.5 ? 'positive' : profile.rating >= 4.0 ? '' : 'negative'} />
                        <StatCard icon="⏱️" label="Months Active" value={profile.months_active || 'N/A'} sub={`${profile.platform || 'Multi-platform'}`} />
                        <StatCard icon="✅" label="Completed Jobs" value={(profile.completed_jobs || 0).toLocaleString()} sub={`${profile.cancellations || 0} cancellations`} />
                        <StatCard
                            icon="🏦"
                            label="Loan Eligibility Est."
                            value={report.estimated_loan_eligibility > 0 ? `₹${report.estimated_loan_eligibility.toLocaleString()}` : 'Not Eligible'}
                            sub={report.risk_band === 'High Risk' ? 'Score too low for loan' : `Based on ${report.risk_band} band`}
                            subType={report.estimated_loan_eligibility > 0 ? 'positive' : 'negative'}
                        />
                    </div>
                </div>
            </div>

            {/* Charts row */}
            <div className="charts-row mb-5">
                {/* Earnings Trend */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Earnings Trend</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{incomes.length} months</span>
                    </div>
                    <div className="chart-container" style={{ height: 220 }}>
                        <Line data={earningsData} options={{
                            ...chartDefaults,
                            responsive: true, maintainAspectRatio: false,
                            plugins: { ...chartDefaults.plugins, legend: { display: false } },
                        }} />
                    </div>
                </div>

                {/* Score Breakdown */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Score Breakdown</span>
                    </div>
                    <div className="chart-container" style={{ height: 220, display: 'flex', justifyContent: 'center' }}>
                        <Doughnut data={doughnutData} options={{
                            responsive: true, maintainAspectRatio: false,
                            cutout: '65%',
                            plugins: {
                                legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 10 }, boxWidth: 10, padding: 8 } }
                            }
                        }} />
                    </div>
                </div>

                {/* Jobs Chart */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Jobs Overview</span>
                    </div>
                    <div className="chart-container" style={{ height: 220 }}>
                        <Bar data={jobsData} options={{
                            ...chartDefaults, responsive: true, maintainAspectRatio: false,
                            plugins: { ...chartDefaults.plugins },
                            scales: {
                                x: chartDefaults.scales.x,
                                y: { ...chartDefaults.scales.y, beginAtZero: true },
                            }
                        }} />
                    </div>
                </div>
            </div>

            {/* AI Insights Row */}
            <div className="charts-row mb-5">
                <AIPanel 
                    title="Score Explanation" 
                    icon="✨" 
                    fetchFn={getAIExplanation} 
                    args={[data.profile]} 
                    trigger={selectedId} 
                />
                <AIPanel 
                    title="Lender Summary" 
                    icon="🏦" 
                    fetchFn={getAILenderSummary} 
                    args={[data.profile]} 
                    trigger={selectedId} 
                />
            </div>

            {/* Recommendations + Risk Signals */}
            <div className="charts-row">
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Recommendations</span>
                        <span className="risk-badge good">{recs.length} actions</span>
                    </div>
                    <div className="rec-list">
                        {recs.map((r, i) => (
                            <div key={i} className="rec-item">
                                <div className="rec-icon">{r.icon}</div>
                                <div className="rec-content">
                                    <div className="rec-title">{r.title}</div>
                                    <div className="rec-detail">{r.detail}</div>
                                </div>
                                <div className={`impact-badge ${r.impact.toLowerCase()}`}>{r.impact}</div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            <AskAI workerData={data.profile} />
        </div>
    );
}
