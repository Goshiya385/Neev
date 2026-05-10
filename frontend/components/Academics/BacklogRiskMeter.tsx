'use client';
export default function BacklogRiskMeter({ risk }: { risk: number }) {
  const color = risk >= 60 ? '#F87171' : risk >= 30 ? '#F5A623' : '#4ADE80';
  return (
    <div className="text-center">
      <div className="relative w-24 h-24 mx-auto mb-2">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15.5" fill="none" stroke="#1C2E25" strokeWidth="2.5" />
          <circle cx="18" cy="18" r="15.5" fill="none" stroke={color} strokeWidth="2.5"
            strokeDasharray={`${risk * 0.975} 97.5`} strokeLinecap="round" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-syne font-bold" style={{ color }}>{risk}%</span>
      </div>
      <p className="text-muted text-xs">Backlog Risk</p>
    </div>
  );
}
