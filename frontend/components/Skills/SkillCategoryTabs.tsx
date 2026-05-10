'use client';
const cats = [
  { key: 'language', label: 'Languages', icon: '💻' },
  { key: 'cs-core', label: 'CS Core', icon: '🧠' },
  { key: 'development', label: 'Development', icon: '🔧' },
  { key: 'tools', label: 'Tools', icon: '🛠️' },
  { key: 'future-tech', label: 'Future Tech', icon: '🚀' },
];

export default function SkillCategoryTabs({ active, onChange }: { active: string; onChange: (key: string) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto">
      {cats.map(c => (
        <button key={c.key} onClick={() => onChange(c.key)}
          className={`px-4 py-2 text-sm font-syne rounded whitespace-nowrap transition-all ${active === c.key ? 'bg-accent text-black' : 'text-muted hover:text-white bg-surface'}`}>
          {c.icon} {c.label}
        </button>
      ))}
    </div>
  );
}
