"""
FinSight Anomaly Detector Service
Ensemble combining Scikit-Learn IsolationForest with Z-Score Statistical Outlier Analysis.
"""
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Optional
from sklearn.ensemble import IsolationForest

# Benchmark category typical averages and standard deviations for baseline bootstrap in Indian Rupees (INR)
CATEGORY_BENCHMARKS = {
    "food": {"mean": 800.0, "std": 600.0, "max": 4000.0},
    "shopping": {"mean": 3500.0, "std": 3000.0, "max": 15000.0},
    "travel": {"mean": 350.0, "std": 300.0, "max": 2500.0},
    "emi": {"mean": 35000.0, "std": 15000.0, "max": 75000.0},
    "utilities": {"mean": 2500.0, "std": 1500.0, "max": 10000.0},
    "healthcare": {"mean": 3500.0, "std": 3000.0, "max": 20000.0},
    "entertainment": {"mean": 1500.0, "std": 1000.0, "max": 6000.0},
    "investment": {"mean": 25000.0, "std": 15000.0, "max": 100000.0},
    "education": {"mean": 8000.0, "std": 5000.0, "max": 35000.0},
    "miscellaneous": {"mean": 2000.0, "std": 1500.0, "max": 10000.0}
}

class AnomalyDetectorService:
    def detect_single(self, current: Dict[str, Any], history: List[Dict[str, Any]]) -> Dict[str, Any]:
        amount = float(current.get("amount", 0.0))
        cat_key = str(current.get("category", "miscellaneous")).strip().lower()
        is_income = cat_key == "income" or str(current.get("type", "")).upper() == "INCOME"
        
        # Don't flag income as negative spending anomaly
        if is_income:
            return {
                "is_anomaly": False,
                "anomaly_score": 0.0,
                "reason": "Income transaction",
                "confidence": 0.99,
                "expected_range": {"min": 0.0, "max": 200000.0, "avg": amount}
            }

        # Filter history for category
        cat_history = [
            float(t["amount"]) for t in history 
            if str(t.get("category", "")).strip().lower() == cat_key and float(t.get("amount", 0.0)) > 0
        ]
        
        # Get baseline parameters
        benchmark = CATEGORY_BENCHMARKS.get(cat_key, CATEGORY_BENCHMARKS["miscellaneous"])
        
        if len(cat_history) >= 4:
            hist_mean = float(np.mean(cat_history))
            hist_std = float(np.std(cat_history))
            if hist_std < 50.0:
                hist_std = benchmark["std"]
        else:
            hist_mean = benchmark["mean"]
            hist_std = benchmark["std"]

        # 1. Z-Score analysis
        z_score = (amount - hist_mean) / (hist_std if hist_std > 0 else 1.0)
        
        # 2. Isolation Forest score
        iso_score = 0.0
        if len(cat_history) >= 5:
            try:
                features = np.array(cat_history).reshape(-1, 1)
                clf = IsolationForest(contamination=0.08, random_state=42)
                clf.fit(features)
                pred = clf.predict([[amount]])[0]  # -1 for anomaly, 1 for normal
                raw_decision = clf.decision_function([[amount]])[0]
                iso_score = float(max(0.0, min(1.0, 0.5 - raw_decision)))
            except Exception:
                iso_score = max(0.0, min(1.0, z_score / 4.0))
        else:
            iso_score = max(0.0, min(1.0, z_score / 3.5))

        # Expected range calculation
        expected_min = max(0.0, round(hist_mean - (1.5 * hist_std), 2))
        expected_max = round(hist_mean + (2.5 * hist_std), 2)
        
        # Determine anomaly flag
        is_anomaly = False
        reason = "Normal transaction within expected range."
        anomaly_score = round(max(0.0, min(1.0, (z_score * 0.3) + (iso_score * 0.7))), 3)
        confidence = 0.85

        if z_score >= 3.0 or amount > expected_max * 1.5:
            is_anomaly = True
            multiple = round(amount / hist_mean, 1) if hist_mean > 0 else 2.0
            reason = f"Unusually high expense! ₹{amount:,.0f} is {multiple}x higher than typical benchmark of ₹{hist_mean:,.0f}."
            anomaly_score = max(anomaly_score, 0.82)
            confidence = 0.94
        elif z_score >= 2.0 or amount > expected_max:
            is_anomaly = True
            diff_pct = int(((amount - hist_mean) / hist_mean) * 100) if hist_mean > 0 else 100
            reason = f"Spike detected: ₹{amount:,.0f} is {diff_pct}% above your normal range (expected max ₹{expected_max:,.0f})."
            anomaly_score = max(anomaly_score, 0.65)
            confidence = 0.88
        elif amount <= 0:
            is_anomaly = True
            reason = "Zero or negative amount recorded."
            anomaly_score = 0.7
            confidence = 0.99


        return {
            "is_anomaly": is_anomaly,
            "anomaly_score": anomaly_score,
            "reason": reason,
            "confidence": confidence,
            "expected_range": {
                "min": expected_min,
                "max": expected_max,
                "avg": round(hist_mean, 2)
            }
        }

    def detect_batch(self, transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not transactions:
            return {"anomalies": [], "total_analyzed": 0, "anomaly_count": 0}
            
        anomalies = []
        for i, tx in enumerate(transactions):
            # Use other transactions as context history
            history = transactions[:i] + transactions[i+1:]
            res = self.detect_single(tx, history)
            if res["is_anomaly"]:
                anomalies.append({
                    "id": tx.get("id"),
                    "description": tx.get("description"),
                    "amount": tx.get("amount"),
                    "category": tx.get("category"),
                    "date": tx.get("date"),
                    "anomaly_score": res["anomaly_score"],
                    "reason": res["reason"],
                    "expected_range": res["expected_range"]
                })
                
        return {
            "anomalies": anomalies,
            "total_analyzed": len(transactions),
            "anomaly_count": len(anomalies)
        }

anomaly_detector_service = AnomalyDetectorService()
