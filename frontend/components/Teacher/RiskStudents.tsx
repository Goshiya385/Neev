'use client';
export default function RiskStudents({ students }: { students: any[] }) {
  if (!students || students.length === 0) return <p className="text-muted text-sm">No at-risk students</p>;
  return (
    <div className="space-y-2">
      {students.map(s => (
        <div key={s._id} className="flex items-center justify-between py-3 border-b border-border/30">
          <div>
            <p className="text-sm font-medium">{s.name} <span className="text-muted text-xs">({s.rollNumber})</span></p>
            <p className="text-xs text-muted">CGPA {s.cgpa} • {s.backlogs} backlogs</p>
          </div>
          <span className={`text-xs font-syne ${s.riskLevel === 'high' ? 'text-danger' : 'text-accent'}`}>{s.riskLevel}</span>
        </div>
      ))}
    </div>
  );
}
