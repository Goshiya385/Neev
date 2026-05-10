'use client';
import { motion } from 'framer-motion';

export default function PredictionCards({ prediction }: { prediction: any }) {
  if (!prediction) return null;
  return (
    <div className="grid grid-cols-2 gap-6">
      {prediction.cgpa && (
        <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs text-muted mb-2">Predicted Next SGPA</p>
          <p className="stat-number text-accent text-4xl">{prediction.cgpa.predictedNextSGPA}</p>
          <p className="text-xs text-muted mt-2">Trend: <span className={prediction.cgpa.trend === 'improving' ? 'text-accent2' : prediction.cgpa.trend === 'declining' ? 'text-danger' : 'text-info'}>{prediction.cgpa.trend}</span></p>
          <p className="text-xs text-muted">Confidence: {prediction.cgpa.confidence}%</p>
        </motion.div>
      )}
      {prediction.backlog && (
        <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
          <p className="text-xs text-muted mb-2">Backlog Risk</p>
          <p className={`stat-number text-4xl ${prediction.backlog.overallRisk > 50 ? 'text-danger' : 'text-accent2'}`}>{prediction.backlog.overallRisk}%</p>
          <p className="text-xs text-muted mt-2">{prediction.backlog.subjectRisks?.length || 0} subjects analyzed</p>
        </motion.div>
      )}
    </div>
  );
}
