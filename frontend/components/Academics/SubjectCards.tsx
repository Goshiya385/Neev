'use client';
import { motion } from 'framer-motion';

interface Props { marks: any[]; }

export default function SubjectCards({ marks }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {marks.map((m, i) => {
        const total = m.internalMarks + m.externalMarks + m.practicalMarks;
        const max = m.maxInternal + m.maxExternal + m.maxPractical;
        const pct = max > 0 ? Math.round((total / max) * 100) : 0;
        return (
          <motion.div key={m._id || i} className="py-4 border-b border-border/30"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">{m.subject}</span>
              <span className={`font-syne font-bold text-sm ${pct >= 60 ? 'text-accent2' : pct >= 40 ? 'text-accent' : 'text-danger'}`}>{pct}%</span>
            </div>
            <div className="h-1.5 bg-surface rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: pct >= 60 ? '#4ADE80' : pct >= 40 ? '#F5A623' : '#F87171' }} />
            </div>
            <div className="flex gap-4 mt-2 text-xs text-muted">
              <span>Int: {m.internalMarks}/{m.maxInternal}</span>
              <span>Ext: {m.externalMarks}/{m.maxExternal}</span>
              <span>Prac: {m.practicalMarks}/{m.maxPractical}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
