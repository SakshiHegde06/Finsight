"""
FinSight FastAPI ML Service Entry Point.
Microservice exposing Scikit-Learn models for Categorization, Anomaly Detection, Forecasting, and Recommendations.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any

from app.config import settings
from app.models.schemas import (
    CategorizeRequest, CategorizeResponse,
    BatchCategorizeRequest, BatchCategorizeResponse,
    AnomalyDetectionRequest, AnomalyResult,
    BatchAnomalyRequest, BatchAnomalyResponse,
    SpendingForecastRequest, SpendingForecastResponse,
    RecommendationRequest, RecommendationResponse
)
from app.services.categorizer import categorizer_service
from app.services.anomaly_detector import anomaly_detector_service
from app.services.forecaster import forecaster_service
from app.services.recommender import recommender_service

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Machine learning intelligence service for expense categorization, anomaly detection, spending pattern analysis, and financial insights."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {
        "service": settings.PROJECT_NAME,
        "status": "UP",
        "version": settings.VERSION,
        "engine": "scikit-learn + FastAPI"
    }

@app.post(f"{settings.API_PREFIX}/categorize", response_model=CategorizeResponse)
def categorize_transaction(req: CategorizeRequest):
    try:
        res = categorizer_service.categorize(
            description=req.description,
            merchant=req.merchant,
            amount=req.amount
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Categorization error: {str(e)}")

@app.post(f"{settings.API_PREFIX}/categorize/batch", response_model=BatchCategorizeResponse)
def batch_categorize(req: BatchCategorizeRequest):
    try:
        items = [i.model_dump() for i in req.items]
        predictions = categorizer_service.batch_categorize(items)
        return {"predictions": predictions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch categorization error: {str(e)}")

@app.post(f"{settings.API_PREFIX}/anomalies/detect", response_model=AnomalyResult)
def detect_anomaly(req: AnomalyDetectionRequest):
    try:
        current = req.current_transaction.model_dump()
        history = [h.model_dump() for h in req.history]
        result = anomaly_detector_service.detect_single(current, history)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Anomaly detection error: {str(e)}")

@app.post(f"{settings.API_PREFIX}/anomalies/batch", response_model=BatchAnomalyResponse)
def batch_detect_anomalies(req: BatchAnomalyRequest):
    try:
        txs = [t.model_dump() for t in req.transactions]
        result = anomaly_detector_service.detect_batch(txs)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch anomaly detection error: {str(e)}")

@app.post(f"{settings.API_PREFIX}/forecast", response_model=SpendingForecastResponse)
def forecast_spending(req: SpendingForecastRequest):
    try:
        txs = [t.model_dump() for t in req.transactions]
        result = forecaster_service.forecast_spending(
            monthly_budget=req.monthly_budget,
            transactions=txs,
            days_in_month=req.days_in_month,
            current_day=req.current_day
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecast error: {str(e)}")

@app.post(f"{settings.API_PREFIX}/recommendations", response_model=RecommendationResponse)
def get_recommendations(req: RecommendationRequest):
    try:
        txs = [t.model_dump() for t in req.transactions]
        budgets = [b.model_dump() for b in req.budgets]
        result = recommender_service.generate_recommendations(
            monthly_income=req.monthly_income,
            transactions=txs,
            budgets=budgets
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation error: {str(e)}")
