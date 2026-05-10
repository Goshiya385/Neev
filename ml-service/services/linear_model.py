"""
Linear Regression model for CGPA trend prediction.
Fits on historical semester-wise performance and projects future CGPA.
"""
import numpy as np

try:
    from sklearn.linear_model import LinearRegression, Ridge
    from sklearn.preprocessing import PolynomialFeatures
    HAS_SKLEARN = True
except ImportError:
    HAS_SKLEARN = False


class LinearCGPAModel:
    """Uses Linear Regression + Polynomial features for semester-wise CGPA trend projection."""

    def __init__(self):
        self.lr_model = LinearRegression() if HAS_SKLEARN else None
        self.ridge_model = Ridge(alpha=1.0) if HAS_SKLEARN else None
        self.poly = PolynomialFeatures(degree=2, include_bias=False) if HAS_SKLEARN else None

    def predict_trend(self, semester_data: list, current_semester: int) -> dict:
        """
        Input: semester_data = [{"semester": 1, "sgpa": 7.5}, {"semester": 2, "sgpa": 7.8}, ...]
               current_semester = int
        Output: projected CGPA for next 2 semesters + trend line
        """
        if not semester_data or len(semester_data) < 2:
            return self._insufficient_data(current_semester)

        semesters = np.array([d["semester"] for d in semester_data]).reshape(-1, 1)
        sgpas = np.array([d["sgpa"] for d in semester_data])

        if not HAS_SKLEARN:
            return self._numpy_fallback(semesters.flatten(), sgpas, current_semester)

        # ── Linear Regression ──
        self.lr_model.fit(semesters, sgpas)
        lr_score = round(self.lr_model.score(semesters, sgpas), 4)

        # ── Ridge with Polynomial features ──
        X_poly = self.poly.fit_transform(semesters)
        self.ridge_model.fit(X_poly, sgpas)
        ridge_score = round(self.ridge_model.score(X_poly, sgpas), 4)

        # Project next 2 semesters
        future_sems = np.array([[current_semester + 1], [current_semester + 2]])
        lr_preds = self.lr_model.predict(future_sems)
        ridge_preds = self.ridge_model.predict(self.poly.transform(future_sems))

        # Ensemble (average of both)
        ensemble = np.clip((lr_preds * 0.4 + ridge_preds * 0.6), 4.0, 10.0)

        # Trend line for visualization
        all_sems = np.arange(1, current_semester + 3).reshape(-1, 1)
        trend_line = list(np.clip(self.lr_model.predict(all_sems), 4.0, 10.0))

        # Slope analysis
        slope = float(self.lr_model.coef_[0])
        if slope > 0.15:
            trend = "strongly_improving"
            message = f"📈 Strong upward trend! CGPA increasing by ~{round(slope, 2)} per semester."
        elif slope > 0.05:
            trend = "improving"
            message = f"📈 Steady improvement. CGPA growing by ~{round(slope, 2)} per semester."
        elif slope > -0.05:
            trend = "stable"
            message = f"➡️ CGPA is stable. Consider pushing harder to break the plateau."
        elif slope > -0.15:
            trend = "declining"
            message = f"📉 Slight decline detected. CGPA dropping by ~{round(abs(slope), 2)} per semester."
        else:
            trend = "strongly_declining"
            message = f"📉 Significant decline! CGPA dropping by ~{round(abs(slope), 2)} per semester. Immediate action needed."

        return {
            "projections": [
                {"semester": current_semester + 1, "predicted_sgpa": round(float(ensemble[0]), 2)},
                {"semester": current_semester + 2, "predicted_sgpa": round(float(ensemble[1]), 2)},
            ],
            "trend": trend,
            "slope": round(slope, 4),
            "lr_r2": lr_score,
            "ridge_r2": ridge_score,
            "trend_line": [{"semester": i+1, "value": round(float(v), 2)} for i, v in enumerate(trend_line)],
            "message": message,
            "models_used": ["LinearRegression", "RidgeRegression(poly=2)"],
            "current_cgpa": round(float(np.mean(sgpas)), 2),
            "best_semester": {"semester": int(semesters[np.argmax(sgpas)][0]), "sgpa": round(float(np.max(sgpas)), 2)},
            "worst_semester": {"semester": int(semesters[np.argmin(sgpas)][0]), "sgpa": round(float(np.min(sgpas)), 2)},
        }

    def _numpy_fallback(self, semesters, sgpas, current_semester):
        """Simple numpy-only linear regression fallback."""
        coeffs = np.polyfit(semesters, sgpas, 1)
        slope, intercept = coeffs
        next1 = round(np.clip(slope * (current_semester + 1) + intercept, 4.0, 10.0), 2)
        next2 = round(np.clip(slope * (current_semester + 2) + intercept, 4.0, 10.0), 2)
        trend = "improving" if slope > 0.05 else "declining" if slope < -0.05 else "stable"
        return {
            "projections": [
                {"semester": current_semester + 1, "predicted_sgpa": next1},
                {"semester": current_semester + 2, "predicted_sgpa": next2},
            ],
            "trend": trend, "slope": round(float(slope), 4),
            "message": f"Linear projection: Next sem SGPA ~{next1}",
            "models_used": ["numpy_polyfit"],
        }

    def _insufficient_data(self, current_semester):
        return {
            "projections": [],
            "trend": "insufficient_data",
            "message": "Need at least 2 semesters of data for trend prediction.",
            "models_used": [],
        }


linear_model = LinearCGPAModel()
