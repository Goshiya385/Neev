'use client';
export default function ReadinessScore({ score }: { score: number }) {
  const color = score >= 60 ? '#4ADE80' : score >= 40 ? '#F5A623' : '#F87171';
  return (
    <div className="text-center">
      <div className="relative w-40 h-40 mx-auto mb-4">
        <svg className="w-40 h-40 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15.5" fill="none" stroke="#1C2E25" strokeWidth="2" />
          <circle cx="18" cy="18" r="15.5" fill="none" stroke={color} strokeWidth="2.5" strokeDasharray={`${score * 0.975} 97.5`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="stat-number text-4xl" style={{ color }}>{score}%</span>
          <span className="text-muted text-xs">Placement Ready</span>
        </div>
      </div>
    </div>
  );
}
