'use client';
export default function BatchOverview({ data }: { data: any }) {
  if (!data) return null;
  return (
    <div className="grid grid-cols-4 gap-8">
      <div><p className="stat-number text-accent">{data.totalStudents}</p><p className="text-muted text-sm mt-2">Students</p></div>
      <div><p className="stat-number text-accent2">{data.avgCGPA}</p><p className="text-muted text-sm mt-2">Avg CGPA</p></div>
      <div><p className="stat-number text-info">{data.avgPlacement}%</p><p className="text-muted text-sm mt-2">Avg Placement</p></div>
      <div><p className="stat-number text-danger">{data.riskBreakdown?.high || 0}</p><p className="text-muted text-sm mt-2">High Risk</p></div>
    </div>
  );
}
