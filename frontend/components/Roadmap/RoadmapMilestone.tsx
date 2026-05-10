'use client';
export default function RoadmapMilestone({ milestone, onComplete }: { milestone: any; onComplete?: () => void }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border/30">
      <div className="flex items-center gap-3">
        <div className={`w-4 h-4 rounded-full border-2 ${milestone.completed ? 'bg-accent2 border-accent2' : 'border-muted'}`} />
        <div>
          <p className={`text-sm ${milestone.completed ? 'line-through text-muted' : ''}`}>{milestone.title}</p>
          <p className="text-xs text-muted">{milestone.category} • Week {milestone.dueWeek}</p>
        </div>
      </div>
      {!milestone.completed && onComplete && (
        <button onClick={onComplete} className="text-xs text-accent hover:underline">Complete</button>
      )}
    </div>
  );
}
