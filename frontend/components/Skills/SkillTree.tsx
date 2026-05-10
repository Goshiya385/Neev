'use client';
import { motion } from 'framer-motion';

export default function SkillTree({ skills }: { skills: any[] }) {
  const categories = [...new Set(skills.map(s => s.category))];
  return (
    <div className="space-y-8">
      {categories.map(cat => (
        <div key={cat}>
          <p className="text-sm font-syne font-semibold text-accent mb-3 capitalize">{cat.replace('-', ' ')}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {skills.filter(s => s.category === cat).map((s, i) => (
              <motion.div key={s._id} className="py-3 px-4 bg-surface rounded-lg" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <p className="text-sm mb-1">{s.skillName}</p>
                <div className="h-1 bg-border rounded-full"><div className="h-full bg-accent rounded-full" style={{ width: `${s.completionPercent}%` }} /></div>
                <p className="text-xs text-muted mt-1">{s.completionPercent}%</p>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
