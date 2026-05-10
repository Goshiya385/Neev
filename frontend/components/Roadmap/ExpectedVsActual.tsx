'use client';
export default function ExpectedVsActual({ expected, actual }: { expected: number; actual: number }) {
  const gap = expected - actual;
  return (
    <div className="grid grid-cols-3 gap-6 text-center">
      <div><p className="stat-number text-accent2 text-3xl">{expected}%</p><p className="text-muted text-xs mt-1">Expected</p></div>
      <div><p className="stat-number text-accent text-3xl">{actual}%</p><p className="text-muted text-xs mt-1">Actual</p></div>
      <div><p className={`stat-number text-3xl ${gap > 0 ? 'text-danger' : 'text-accent2'}`}>{gap}%</p><p className="text-muted text-xs mt-1">Gap</p></div>
    </div>
  );
}
