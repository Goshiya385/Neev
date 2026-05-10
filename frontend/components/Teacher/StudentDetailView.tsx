'use client';
export default function StudentDetailView({ data }: { data: any }) {
  if (!data) return null;
  const s = data.student;
  return (
    <div>
      <div className="grid grid-cols-4 gap-8 mb-12">
        <div><p className="stat-number text-accent">{s.cgpa?.toFixed(2)}</p><p className="text-muted text-sm mt-2">CGPA</p></div>
        <div><p className="stat-number text-accent2">{s.placementReadiness}%</p><p className="text-muted text-sm mt-2">Placement</p></div>
        <div><p className={`stat-number ${s.backlogs > 0 ? 'text-danger' : 'text-accent2'}`}>{s.backlogs}</p><p className="text-muted text-sm mt-2">Backlogs</p></div>
        <div><p className="stat-number text-info">{s.currentStreak}</p><p className="text-muted text-sm mt-2">Streak</p></div>
      </div>
      {data.skills?.length > 0 && (
        <div className="mb-8">
          <h3 className="font-syne text-lg font-bold mb-4">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((sk: any) => (
              <span key={sk._id} className="text-xs bg-surface px-3 py-1.5 rounded text-muted">{sk.skillName} ({sk.completionPercent}%)</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
