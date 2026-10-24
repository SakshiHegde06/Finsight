"""
FinSight Spending Pattern & Trend Forecasting Service.
Uses time series velocity and linear trend models to project monthly spend.
"""
import numpy as np
from datetime import datetime
from typing import List, Dict, Any

class ForecasterService:
    def forecast_spending(
        self,
        monthly_budget: float,
        transactions: List[Dict[str, Any]],
        days_in_month: int = 30,
        current_day: int = 15
    ) -> Dict[str, Any]:
        # Filter out income transactions for expense forecasting
        expense_txs = [
            t for t in transactions 
            if str(t.get("category", "")).lower() != "income" and str(t.get("type", "")).upper() != "INCOME" and float(t.get("amount", 0.0)) > 0
        ]
        
        if not expense_txs:
            return {
                "current_spend": 0.0,
                "projected_end_of_month": 0.0,
                "budget_variance": float(monthly_budget or 0.0),
                "burn_rate_daily": 0.0,
                "is_overbudget_risk": False,
                "confidence_level": "Awaiting Data",
                "forecast_points": []
            }
        
        # Accumulate spending per day
        daily_spend = {d: 0.0 for d in range(1, days_in_month + 1)}
        
        for t in expense_txs:
            try:
                tx_date = t.get("date", "")
                if tx_date:
                    dt = datetime.strptime(tx_date.split("T")[0], "%Y-%m-%d")
                    day_num = dt.day
                    if 1 <= day_num <= days_in_month:
                        daily_spend[day_num] += float(t.get("amount", 0.0))
            except Exception:
                continue

        current_day = max(1, min(current_day, days_in_month))
        
        # Calculate spend up to current day
        cumulative_points = []
        running_total = 0.0
        
        for d in range(1, current_day + 1):
            running_total += daily_spend[d]
            cumulative_points.append({
                "day": d,
                "date": f"Day {d}",
                "projected_spend": round(daily_spend[d], 2),
                "cumulative_spend": round(running_total, 2)
            })

        current_spend = running_total
        
        # Calculate burn rate
        burn_rate_daily = current_spend / current_day if current_day > 0 else 0.0
        
        # Fit trend or linear projection for remaining days
        remaining_days = days_in_month - current_day
        projected_end_of_month = current_spend + (burn_rate_daily * remaining_days)
        
        # Build projected trajectory points for the rest of the month
        proj_running = current_spend
        for d in range(current_day + 1, days_in_month + 1):
            proj_running += burn_rate_daily
            cumulative_points.append({
                "day": d,
                "date": f"Day {d}",
                "projected_spend": round(burn_rate_daily, 2),
                "cumulative_spend": round(proj_running, 2)
            })

        budget_variance = monthly_budget - projected_end_of_month
        is_overbudget_risk = projected_end_of_month > monthly_budget
        
        confidence = "High" if current_day >= 10 else "Moderate"

        return {
            "current_spend": round(current_spend, 2),
            "projected_end_of_month": round(projected_end_of_month, 2),
            "budget_variance": round(budget_variance, 2),
            "burn_rate_daily": round(burn_rate_daily, 2),
            "is_overbudget_risk": is_overbudget_risk,
            "confidence_level": confidence,
            "forecast_points": cumulative_points
        }

forecaster_service = ForecasterService()
