'use client';
import { motion } from 'framer-motion';
export default function RoadmapTimeline({ milestones }: { milestones: any[] }) {
  const sorted = [...milestones].sort((a, b) => a.dueWeek - b.dueWeek);
  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
      <div className="space-y-4">
        {sorted.map((m, i) => (
          <motion.div key={m._id || i} className="flex items-center gap-6 ml-4 pl-6 relative"
            initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
            <div className={`absolute left-[-4px] w-3 h-3 rounded-full border-2 ${m.completed ? 'bg-accent2 border-accent2' : 'bg-bg border-muted'}`} />
            <div className="flex-1 py-1">
              <p className={`text-sm ${m.completed ? 'line-through text-muted' : ''}`}>{m.title}</p>
              <p className="text-xs text-muted">{m.category} • Week {m.dueWeek}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
