export default function RiskBadge({ band }) {
    const classMap = {
        'Excellent': 'excellent',
        'Good': 'good',
        'Fair': 'fair',
        'High Risk': 'high-risk',
    };

    const dotMap = {
        'Excellent': '●',
        'Good': '●',
        'Fair': '●',
        'High Risk': '●',
    };

    return (
        <span className={`risk-badge ${classMap[band] || 'fair'}`}>
            <span style={{ fontSize: 8 }}>{dotMap[band]}</span>
            {band}
        </span>
    );
}
