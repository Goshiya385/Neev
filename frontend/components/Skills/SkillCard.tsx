'use client';
export default function SkillCard({ skill }: { skill: any }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-border/30">
      <div className="flex-1">
        <p className="text-sm font-medium">{skill.skillName}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full" style={{ width: `${skill.completionPercent}%` }} />
          </div>
          <span className="text-xs text-muted">{skill.completionPercent}%</span>
        </div>
      </div>
      <div className="text-center px-2">
        <p className="text-accent font-syne font-bold text-sm">{skill.confidenceLevel}/5</p>
        <p className="text-[10px] text-muted">Confidence</p>
      </div>
    </div>
  );
}
