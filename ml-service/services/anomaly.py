"""
Anomaly Detection — Isolation Forest to detect unusual student patterns.
"""
import numpy as np
from typing import List, Dict

try:
    from sklearn.ensemble import IsolationForest
    from sklearn.preprocessing import StandardScaler
    HAS_SKLEARN = True
except ImportError:
    HAS_SKLEARN = False


class AnomalyDetector:
    def detect_anomalies(self, students: List[Dict]) -> List[Dict]:
        if len(students) < 5 or not HAS_SKLEARN:
            return []

        X = np.array([[
            s.get('cgpa', 6.0), s.get('attendancePct', 75.0),
            s.get('currentStreak', 0), s.get('placementReadiness', 40.0), s.get('backlogs', 0),
        ] for s in students])

        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        clf = IsolationForest(contamination=0.1, random_state=42)
        predictions = clf.fit_predict(X_scaled)
        scores = clf.score_samples(X_scaled)

        anomalies = []
        for i, student in enumerate(students):
            if predictions[i] == -1:
                anomaly_score = round(abs(float(scores[i])), 3)
                reasons = self._explain(student, X, i)
                anomalies.append({
                    "student_id": str(student.get('_id', '')), "name": student.get('name', ''),
                    "anomaly_score": anomaly_score,
                    "severity": "high" if anomaly_score > 0.15 else "medium",
                    "reasons": reasons,
                    "recommendation": self._recommend(reasons)
                })
        return sorted(anomalies, key=lambda x: x['anomaly_score'], reverse=True)

    def _explain(self, student, X, idx):
        reasons = []
        means, stds = X.mean(axis=0), X.std(axis=0)
        row = X[idx]
        if row[0] < means[0] - 1.5 * stds[0]: reasons.append(f"CGPA {student.get('cgpa')} is significantly below class average")
        if row[1] < means[1] - 1.5 * stds[1]: reasons.append(f"Attendance {student.get('attendancePct')}% is critically low")
        if row[4] > means[4] + 1.5 * stds[4]: reasons.append(f"{int(student.get('backlogs', 0))} active backlogs detected")
        if row[2] < 2 and means[2] > 5: reasons.append("No activity streak — inactive student")
        return reasons if reasons else ["Unusual combination of performance metrics"]

    def _recommend(self, reasons):
        if any("attendance" in r.lower() for r in reasons): return "Urgent: Address attendance issues immediately."
        if any("backlog" in r.lower() for r in reasons): return "Focus on clearing backlogs before new semester."
        if any("cgpa" in r.lower() for r in reasons): return "Schedule one-on-one mentoring session."
        return "Monitor closely. Schedule check-in with teacher."


anomaly_detector = AnomalyDetector()
