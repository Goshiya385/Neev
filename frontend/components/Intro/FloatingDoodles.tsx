'use client';
import { motion } from 'framer-motion';

const doodles = [
  { icon: '⚙️', x: 10, y: 15, size: 28, delay: 0 },
  { icon: '💡', x: 85, y: 20, size: 24, delay: 0.3 },
  { icon: '🔧', x: 20, y: 70, size: 22, delay: 0.6 },
  { icon: '📐', x: 75, y: 80, size: 26, delay: 0.9 },
  { icon: '🧮', x: 50, y: 10, size: 20, delay: 1.2 },
  { icon: '💻', x: 90, y: 55, size: 30, delay: 0.4 },
  { icon: '🔬', x: 5, y: 45, size: 22, delay: 0.8 },
  { icon: '📏', x: 60, y: 85, size: 18, delay: 1.0 },
  { icon: '⚡', x: 40, y: 30, size: 20, delay: 0.5 },
  { icon: '🧪', x: 30, y: 55, size: 24, delay: 0.7 },
];

export default function FloatingDoodles() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {doodles.map((d, i) => (
        <motion.span
          key={i}
          className="absolute opacity-[0.04]"
          style={{ left: `${d.x}%`, top: `${d.y}%`, fontSize: d.size }}
          animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 6 + i, delay: d.delay, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        >
          {d.icon}
        </motion.span>
      ))}
    </div>
  );
}
