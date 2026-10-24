"""
FinSight Intelligent Recommendations & Financial Health Scorer Engine.
Evaluates budget utilization, recurring subscriptions, discretionary ratio, and generates actionable advice.
"""
import uuid
from typing import List, Dict, Any

class RecommenderService:
    CATEGORY_DISPLAY_MAP = {
        "food": "Food & Dining",
        "shopping": "Shopping",
        "travel": "Travel & Commute",
        "emi": "Loan & EMI",
        "utilities": "Utilities & Bills",
        "entertainment": "Entertainment",
        "healthcare": "Healthcare",
        "investment": "Investments",
        "education": "Education"
    }

    def generate_recommendations(
        self,
        monthly_income: float,
        transactions: List[Dict[str, Any]],
        budgets: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        income = float(monthly_income or 0.0)
        
        # Categorize spending (normalized to lowercase)
        expenses_by_cat: Dict[str, float] = {}
        total_expense = 0.0
        subscription_txs = []
        
        for t in transactions:
            raw_cat = str(t.get("category", "miscellaneous")).strip().lower()
            amt = float(t.get("amount", 0.0))
            is_income = raw_cat == "income" or str(t.get("type", "")).upper() == "INCOME"
            
            if not is_income and amt > 0:
                expenses_by_cat[raw_cat] = expenses_by_cat.get(raw_cat, 0.0) + amt
                total_expense += amt
                
                desc_lower = str(t.get("description", "")).lower()
                if raw_cat in ["entertainment", "subscriptions"] or any(s in desc_lower for s in ["netflix", "spotify", "gym", "prime", "subscription", "hotstar"]):
                    subscription_txs.append(t)

        # Empty state handling
        if total_expense == 0 and income == 0 and not budgets:
            return {
                "health_score": 0,
                "health_status": "No Data",
                "savings_rate": 0.0,
                "recommendations": [],
                "summary_insights": ["Add your income, transactions, or budget limits to generate real-time AI financial insights."]
            }

        # 1. Financial Health Score calculation
        savings_amount = max(0.0, income - total_expense) if income > 0 else 0.0
        savings_rate = round((savings_amount / income) * 100, 1) if income > 0 else 0.0
        
        # Total budget calculation
        total_budget = sum(float(b.get("allocated", 0.0) or b.get("allocatedAmount", 0.0) or 0.0) for b in budgets)
        
        score = 0
        # Metric A: Savings rate (up to 35 pts)
        if income > 0:
            if savings_rate >= 25:
                score += 35
            elif savings_rate >= 15:
                score += 25
            elif savings_rate >= 5:
                score += 15
            else:
                score += 5
        else:
            score += 15
            
        # Metric B: Budget adherence (up to 35 pts)
        if total_budget > 0:
            utilization = (total_expense / total_budget) * 100
            if utilization <= 85:
                score += 35
            elif utilization <= 100:
                score += 25
            elif utilization <= 115:
                score += 10
            else:
                score += 0
        else:
            score += 20

        # Metric C: Discretionary spend control (up to 30 pts)
        discretionary_cats = ["food", "shopping", "entertainment", "travel"]
        discretionary_spend = sum(expenses_by_cat.get(c, 0.0) for c in discretionary_cats)
        disc_ratio = (discretionary_spend / total_expense) if total_expense > 0 else 0
        if total_expense > 0:
            if disc_ratio <= 0.35:
                score += 30
            elif disc_ratio <= 0.50:
                score += 20
            elif disc_ratio <= 0.65:
                score += 10
            else:
                score += 5
        else:
            score += 25

        health_score = max(0, min(100, score)) if (total_expense > 0 or income > 0) else 0
        if health_score >= 80:
            health_status = "Excellent"
        elif health_score >= 65:
            health_status = "Good"
        elif health_score >= 50:
            health_status = "Fair"
        elif health_score > 0:
            health_status = "Needs Attention"
        else:
            health_status = "No Data"

        # 2. Recommendations & Insights Generation
        recommendations = []
        insights = []

        # A. Subscription Audit
        sub_total = sum(float(t.get("amount", 0.0)) for t in subscription_txs)
        if sub_total > 500:
            potential = round(sub_total * 0.35, 2)
            recommendations.append({
                "id": str(uuid.uuid4()),
                "type": "SUBSCRIPTION",
                "severity": "MEDIUM",
                "title": f"Subscription Audit: {len(subscription_txs)} active recurring services",
                "message": f"You are currently spending ₹{sub_total:,.0f} on recurring services. Canceling underutilized plans could save ~₹{potential:,.0f} per month.",
                "potential_savings": potential,
                "action": "Review Active Subscriptions"
            })
            insights.append(f"Recurring subscriptions account for ₹{sub_total:,.0f} of your monthly spending.")

        # B. Budget utilization checks per category
        for b in budgets:
            cat = str(b.get("category", "")).strip().lower()
            disp_cat = b.get("displayCategory") or self.CATEGORY_DISPLAY_MAP.get(cat, cat.title())
            allocated = float(b.get("allocated", 0.0) or b.get("allocatedAmount", 0.0) or 0.0)
            spent = expenses_by_cat.get(cat, float(b.get("spent", 0.0) or b.get("spentAmount", 0.0) or 0.0))
            
            if allocated > 0:
                ratio = spent / allocated
                if ratio >= 1.0:
                    overage = spent - allocated
                    recommendations.append({
                        "id": str(uuid.uuid4()),
                        "type": "WARNING",
                        "severity": "HIGH",
                        "title": f"Budget Exceeded in {disp_cat}",
                        "message": f"You've exceeded your {disp_cat} limit by ₹{overage:,.0f} (spent ₹{spent:,.0f} of ₹{allocated:,.0f}). Consider freezing discretionary purchases in this category.",
                        "potential_savings": round(overage, 2),
                        "action": f"Adjust {disp_cat} Budget"
                    })
                elif ratio >= 0.85:
                    rem = allocated - spent
                    recommendations.append({
                        "id": str(uuid.uuid4()),
                        "type": "BUDGET_OPTIMIZATION",
                        "severity": "MEDIUM",
                        "title": f"{disp_cat} near budget limit ({int(ratio*100)}%)",
                        "message": f"Only ₹{rem:,.0f} remaining in your {disp_cat} budget (spent ₹{spent:,.0f} of ₹{allocated:,.0f}). Slow down spending to prevent overshooting.",
                        "potential_savings": round(rem * 0.5, 2),
                        "action": f"Review {disp_cat} Expenses"
                    })

        # B2. Intelligent Cross-Category Budget Balancing
        over_budget_cats = []
        under_budget_cats = []
        for b in budgets:
            cat = str(b.get("category", "")).strip().lower()
            if cat in ["investment", "income"]:
                continue
            disp_cat = b.get("displayCategory") or self.CATEGORY_DISPLAY_MAP.get(cat, cat.title())
            allocated = float(b.get("allocated", 0.0) or b.get("allocatedAmount", 0.0) or 0.0)
            spent = expenses_by_cat.get(cat, float(b.get("spent", 0.0) or b.get("spentAmount", 0.0) or 0.0))
            if allocated > 0:
                if spent > allocated:
                    over_budget_cats.append({
                        "category": cat,
                        "displayCategory": disp_cat,
                        "overage": spent - allocated,
                        "spent": spent,
                        "allocated": allocated
                    })
                elif (allocated - spent) >= 500:
                    under_budget_cats.append({
                        "category": cat,
                        "displayCategory": disp_cat,
                        "buffer": allocated - spent,
                        "spent": spent,
                        "allocated": allocated
                    })

        if over_budget_cats and under_budget_cats:
            over_budget_cats.sort(key=lambda x: x["overage"], reverse=True)
            # Prioritize essential needs categories with active spending (e.g. healthcare) over commute/travel
            needs_order = {"healthcare": 1, "utilities": 2, "food": 3, "education": 4, "travel": 5}
            under_budget_cats.sort(key=lambda x: (x["spent"] > 0, -needs_order.get(x["category"], 99), x["buffer"]), reverse=True)
            
            top_over = over_budget_cats[0]
            top_under = under_budget_cats[0]
            
            deficit = top_over["overage"]
            buffer = top_under["buffer"]
            net_deficit = max(0.0, deficit - buffer)
            
            # Identify flexible discretionary categories to absorb the difference
            discretionary_candidates = ["shopping", "food", "entertainment"]
            disc_target = None
            disc_spend = 0.0
            for dc in discretionary_candidates:
                sp = expenses_by_cat.get(dc, 0.0)
                if sp > disc_spend:
                    disc_spend = sp
                    disc_target = self.CATEGORY_DISPLAY_MAP.get(dc, dc.title())
                    
            if not disc_target:
                disc_target = "Shopping"
                disc_spend = 5000.0
                
            raw_trim = net_deficit if net_deficit > 0 else (deficit * 0.5)
            # Round clean financial advisory to nearest ₹500
            rounded_trim = max(500.0, round(raw_trim / 500.0) * 500.0)
            trim_target = min(disc_spend, rounded_trim)
                
            recommendations.insert(0, {
                "id": str(uuid.uuid4()),
                "type": "BUDGET_OPTIMIZATION",
                "severity": "HIGH",
                "title": f"Cross-Category Balancing: Offset {top_over['displayCategory']} Overrun",
                "message": (
                    f"{top_over['displayCategory']} exceeded its limit by ₹{deficit:,.0f}. "
                    f"While {top_under['displayCategory']} has a ₹{buffer:,.0f} buffer, "
                    f"reduce {disc_target} by ₹{trim_target:,.0f} this month to maintain your {savings_rate}% savings rate target."
                ),
                "potential_savings": round(trim_target, 2),
                "action": f"Optimize {disc_target} Spend"
            })

        # C. Dining & Takeout Optimization
        dining_spend = expenses_by_cat.get("food", 0.0)
        if dining_spend > 3000:
            cook_savings = round(dining_spend * 0.25, 2)
            recommendations.append({
                "id": str(uuid.uuid4()),
                "type": "SAVINGS",
                "severity": "INFO",
                "title": "Smart Dining Strategy: 25% Meal Prep Shift",
                "message": f"Your Food & Dining expenses totaled ₹{dining_spend:,.0f}. Preparing 2 additional home-cooked meals weekly will comfortably save ~₹{cook_savings:,.0f}/month.",
                "potential_savings": cook_savings,
                "action": "Set Food Spending Cap"
            })
            if total_expense > 0:
                insights.append(f"Food & Dining represents {int((dining_spend/total_expense)*100)}% of your total expenses.")

        # D. 50/30/20 Rule Analysis
        needs_cats = ["utilities", "healthcare", "emi", "education", "travel"]
        needs_spend = sum(expenses_by_cat.get(c, 0.0) for c in needs_cats)
        
        if income > 0:
            needs_pct = (needs_spend / income) * 100
            wants_pct = (discretionary_spend / income) * 100
            insights.append(f"Current allocation: Needs {int(needs_pct)}% | Wants {int(wants_pct)}% | Savings {int(savings_rate)}% (Benchmark: 50% Needs, 30% Wants, 20% Savings).")
            
            if savings_rate < 15 and income >= total_expense:
                target_boost = round(income * 0.10, 2)
                recommendations.append({
                    "id": str(uuid.uuid4()),
                    "type": "INVESTMENT",
                    "severity": "HIGH",
                    "title": "Automate Pay-Yourself-First Savings Target",
                    "message": f"Your current savings rate is {savings_rate}%. Setting up an automated recurring transfer of ₹{target_boost:,.0f} into an SIP or savings fund will push you toward the 20% benchmark standard.",
                    "potential_savings": target_boost,
                    "action": "Boost Monthly SIP"
                })
        elif total_expense > 0:
            insights.append(f"Recorded ₹{total_expense:,.0f} across {len(transactions)} active transactions. Add income to unlock full 50/30/20 budget analysis.")

        return {
            "health_score": health_score,
            "health_status": health_status,
            "savings_rate": savings_rate,
            "recommendations": recommendations,
            "summary_insights": insights
        }

recommender_service = RecommenderService()
