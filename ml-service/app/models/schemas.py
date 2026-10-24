from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import date, datetime

class CategorizeRequest(BaseModel):
    description: str = Field(..., example="Starbucks Coffee Seattle")
    amount: Optional[float] = Field(None, example=4.75)
    merchant: Optional[str] = Field(None, example="Starbucks")

class CategorizeResponse(BaseModel):
    category: str
    display_category: Optional[str] = None
    confidence: float
    suggested_tags: List[str] = []

class BatchCategorizeItem(BaseModel):
    id: Optional[str] = None
    description: str
    amount: Optional[float] = None
    merchant: Optional[str] = None

class BatchCategorizeRequest(BaseModel):
    items: List[BatchCategorizeItem]

class BatchCategorizeResponse(BaseModel):
    predictions: List[Dict[str, Any]]

class TransactionHistoryItem(BaseModel):
    id: Optional[str] = None
    description: str
    category: str
    amount: float
    date: str  # YYYY-MM-DD
    merchant: Optional[str] = ""
    type: Optional[str] = "EXPENSE"


class AnomalyDetectionRequest(BaseModel):
    current_transaction: TransactionHistoryItem
    history: List[TransactionHistoryItem] = []

class AnomalyResult(BaseModel):
    is_anomaly: bool
    anomaly_score: float  # 0.0 (normal) to 1.0 (highly anomalous)
    reason: str
    confidence: float
    expected_range: Dict[str, float]  # min, max, avg

class BatchAnomalyRequest(BaseModel):
    transactions: List[TransactionHistoryItem]

class BatchAnomalyResponse(BaseModel):
    anomalies: List[Dict[str, Any]]
    total_analyzed: int
    anomaly_count: int

class ForecastPoint(BaseModel):
    day: int
    date: str
    projected_spend: float
    cumulative_spend: float

class SpendingForecastRequest(BaseModel):
    monthly_budget: float
    transactions: List[TransactionHistoryItem]
    days_in_month: int = 30
    current_day: int = 15

class SpendingForecastResponse(BaseModel):
    current_spend: float
    projected_end_of_month: float
    budget_variance: float  # surplus (positive) or deficit (negative)
    burn_rate_daily: float
    is_overbudget_risk: bool
    confidence_level: str
    forecast_points: List[ForecastPoint]

class BudgetCategory(BaseModel):
    category: str
    allocated: float
    spent: float

class RecommendationRequest(BaseModel):
    monthly_income: float = 5000.0
    transactions: List[TransactionHistoryItem]
    budgets: List[BudgetCategory] = []

class RecommendationItem(BaseModel):
    id: str
    type: str  # 'SAVINGS', 'WARNING', 'BUDGET_OPTIMIZATION', 'SUBSCRIPTION', 'INVESTMENT'
    severity: str  # 'INFO', 'LOW', 'MEDIUM', 'HIGH'
    title: str
    message: str
    potential_savings: float
    action: str

class RecommendationResponse(BaseModel):
    health_score: int  # 0 to 100
    health_status: str  # 'Excellent', 'Good', 'Needs Attention', 'Critical'
    savings_rate: float
    recommendations: List[RecommendationItem]
    summary_insights: List[str]
