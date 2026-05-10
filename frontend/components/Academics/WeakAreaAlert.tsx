'use client';
import type { Pattern } from '@/lib/types';
export default function WeakAreaAlert({ patterns }: { patterns: Pattern[] }) {
  if (!patterns || patterns.length === 0) return null;
  return (
    <div className="space-y-3">
      {patterns.map((p, i) => (
        <div key={i} className={`flex items-start gap-3 py-3 border-l-2 pl-4 ${p.risk === 'high' ? 'border-danger' : 'border-accent'}`}>
          <div>
            <p className="text-sm">{p.message}</p>
            {p.recommendation && <p className="text-xs text-muted mt-1">💡 {p.recommendation}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
