"""
K-Means student clustering — groups students into 4 performance categories.
"""
import numpy as np

try:
    from sklearn.cluster import KMeans
    from sklearn.preprocessing import StandardScaler
    HAS_SKLEARN = True
except ImportError:
    HAS_SKLEARN = False

CLUSTER_LABELS = {
    0: {"name": "High Achievers", "description": "Strong academics, active skills, placement-ready", "color": "#4ADE80"},
    1: {"name": "Steady Growers", "description": "Average performance with consistent improvement", "color": "#60A5FA"},
    2: {"name": "At Risk", "description": "Low attendance, weak subjects, needs mentoring", "color": "#F87171"},
    3: {"name": "Skill-Focused", "description": "Strong technical skills, weaker academics", "color": "#F5A623"},
}


class StudentClusteringEngine:
    def __init__(self):
        if HAS_SKLEARN:
            self.model = KMeans(n_clusters=4, random_state=42, n_init=10)
            self.scaler = StandardScaler()

    def extract_features(self, student: dict) -> list:
        return [
            student.get('cgpa', 6.0),
            student.get('attendancePct', 75.0),
            student.get('skillCompletion', 30.0),
            student.get('placementReadiness', 40.0),
            student.get('currentStreak', 0),
            student.get('backlogs', 0),
            student.get('projectsDone', 0),
        ]

    def fit_and_classify(self, students: list) -> list:
        if len(students) < 4 or not HAS_SKLEARN:
            return [{"student_id": str(s.get('_id', '')), "name": s.get('name', ''), "cluster_id": 1, **CLUSTER_LABELS[1]} for s in students]

        X = np.array([self.extract_features(s) for s in students])
        X_scaled = self.scaler.fit_transform(X)
        labels = self.model.fit_predict(X_scaled)

        # Sort clusters by mean CGPA
        cluster_cgpa = {}
        for i, s in enumerate(students):
            c = labels[i]
            cluster_cgpa.setdefault(c, []).append(s.get('cgpa', 6.0))
        sorted_clusters = sorted(cluster_cgpa.keys(), key=lambda c: np.mean(cluster_cgpa[c]), reverse=True)
        remap = {old: new for new, old in enumerate(sorted_clusters)}
        labels = np.array([remap[l] for l in labels])

        results = []
        for i, student in enumerate(students):
            cid = int(labels[i])
            info = CLUSTER_LABELS.get(cid, CLUSTER_LABELS[1])
            results.append({
                "student_id": str(student.get('_id', '')), "name": student.get('name', ''),
                "cluster_id": cid, **info,
                "features": {"cgpa": student.get('cgpa'), "attendance": student.get('attendancePct'),
                              "skills": student.get('skillCompletion'), "placement": student.get('placementReadiness')}
            })
        return results

    def classify_single(self, student: dict, all_students: list) -> dict:
        results = self.fit_and_classify(all_students)
        sid = str(student.get('_id', ''))
        for r in results:
            if r['student_id'] == sid:
                return r
        return {"cluster_id": 1, **CLUSTER_LABELS[1]}


clustering_engine = StudentClusteringEngine()
