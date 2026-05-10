'use client';
const dims = [
  { key: 'dsaSkills', label: 'DSA', icon: '🧩' },
  { key: 'projects', label: 'Projects', icon: '💻' },
  { key: 'communication', label: 'Communication', icon: '🗣️' },
  { key: 'aptitude', label: 'Aptitude', icon: '🧮' },
];

export default function ReadinessDimensions({ breakdown }: { breakdown: any }) {
  if (!breakdown) return null;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {dims.map(d => (
        <div key={d.key} className="text-center">
          <p className="text-2xl mb-1">{d.icon}</p>
          <p className="font-syne font-bold text-2xl text-white">{breakdown[d.key] || 0}%</p>
          <p className="text-muted text-xs mt-1">{d.label}</p>
        </div>
      ))}
    </div>
  );
}
