'use client';

export default function AttendanceHeatmap({ data }: { data: any[] }) {
  if (!data || data.length === 0) return <p className="text-muted text-sm">No attendance data</p>;
  return (
    <div className="flex flex-wrap gap-1">
      {data.map((d, i) => {
        const intensity = d.total > 0 ? d.present / d.total : 0;
        const bg = intensity >= 0.8 ? 'bg-accent2' : intensity >= 0.5 ? 'bg-accent' : intensity > 0 ? 'bg-danger' : 'bg-surface';
        return (
          <div key={i} className={`w-4 h-4 rounded-sm ${bg} opacity-70`} title={`${d.date}: ${d.present}/${d.total}`} />
        );
      })}
    </div>
  );
}
