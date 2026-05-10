'use client';
export default function ShimmerLoader() {
  return (
    <div className="w-full h-1 rounded-full overflow-hidden bg-surface">
      <div className="h-full shimmer rounded-full" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(245,166,35,0.3) 50%, transparent 100%)', backgroundSize: '200% 100%' }} />
    </div>
  );
}
