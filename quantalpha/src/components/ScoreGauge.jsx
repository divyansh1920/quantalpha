export default function ScoreGauge({ score, verdict }) {
  if (score === null || score === undefined) return null;

  const clamped   = Math.max(0, Math.min(100, score));
  const radius    = 80;
  const stroke    = 10;
  const normalizedR = radius - stroke / 2;
  const circumference = Math.PI * normalizedR; // half circle
  const offset    = circumference - (clamped / 100) * circumference;

  const getColor = (s) => {
    if (s >= 75) return '#22c55e';
    if (s >= 60) return '#84cc16';
    if (s >= 45) return '#eab308';
    if (s >= 30) return '#f97316';
    return '#ef4444';
  };

  const color = getColor(clamped);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={radius * 2} height={radius + stroke} viewBox={`0 0 ${radius * 2} ${radius + stroke}`}>
        {/* Background arc */}
        <path
          d={`M ${stroke / 2} ${radius} A ${normalizedR} ${normalizedR} 0 0 1 ${radius * 2 - stroke / 2} ${radius}`}
          fill="none"
          stroke="#1e293b"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {/* Score arc */}
        <path
          d={`M ${stroke / 2} ${radius} A ${normalizedR} ${normalizedR} 0 0 1 ${radius * 2 - stroke / 2} ${radius}`}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        {/* Score text */}
        <text
          x={radius}
          y={radius - 8}
          textAnchor="middle"
          fill="white"
          fontSize="28"
          fontWeight="800"
          fontFamily="Inter, sans-serif"
        >
          {clamped}
        </text>
        <text
          x={radius}
          y={radius + 10}
          textAnchor="middle"
          fill={color}
          fontSize="11"
          fontWeight="600"
          fontFamily="Inter, sans-serif"
        >
          {verdict?.label || ''}
        </text>
      </svg>
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            style={{ color: i < (verdict?.stars || 0) ? color : '#334155' }}
            className="text-lg"
          >
            ★
          </span>
        ))}
      </div>
    </div>
  );
}