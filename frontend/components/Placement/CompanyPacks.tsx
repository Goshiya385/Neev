'use client';
const companies = [
  { key: 'TCS', label: 'TCS Digital', color: '#60A5FA' },
  { key: 'Infosys', label: 'Infosys SP', color: '#4ADE80' },
  { key: 'Wipro', label: 'Wipro Elite', color: '#A78BFA' },
  { key: 'Amazon', label: 'Amazon SDE', color: '#F5A623' },
  { key: 'Google', label: 'Google SWE', color: '#F87171' },
  { key: 'Microsoft', label: 'Microsoft', color: '#34D399' },
];

export default function CompanyPacks({ onSelect }: { onSelect: (key: string) => void }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {companies.map(c => (
        <button key={c.key} onClick={() => onSelect(c.key)}
          className="text-left p-4 bg-surface rounded-lg hover:bg-border/30 transition-all">
          <div className="w-3 h-3 rounded-full mb-2" style={{ background: c.color }} />
          <p className="text-sm font-syne font-semibold">{c.label}</p>
          <p className="text-xs text-muted mt-0.5">{c.key}</p>
        </button>
      ))}
    </div>
  );
}
