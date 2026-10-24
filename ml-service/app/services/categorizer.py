"""
FinSight Categorizer Service
Uses NLP Pipeline to classify transactions into financial categories.
"""
import os
import re
import joblib
from typing import Dict, Any, List, Optional
from app.training.train_models import MODEL_PATH, train_and_save_model

TAG_MAPPING = {
    "food": ["food", "dining", "restaurant", "takeout"],
    "travel": ["commute", "travel", "rideshare", "transit"],
    "shopping": ["retail", "ecommerce", "shopping", "goods"],
    "emi": ["loan", "debt", "emi", "mortgage"],
    "entertainment": ["leisure", "streaming", "movies", "games"],
    "healthcare": ["health", "medical", "pharmacy", "wellness"],
    "investment": ["wealth", "stocks", "savings", "portfolio"],
    "utilities": ["bills", "electricity", "water", "recharge"],
    "education": ["learning", "courses", "college", "fees"]
}

DISPLAY_NAMES = {
    "food": "Food & Dining",
    "travel": "Travel & Commute",
    "shopping": "Shopping",
    "emi": "Loan & EMI",
    "entertainment": "Entertainment",
    "healthcare": "Healthcare",
    "investment": "Investments",
    "utilities": "Utilities & Bills",
    "education": "Education"
}

class CategorizerService:
    def __init__(self):
        self.model = self._load_model()
        
    def _load_model(self):
        if not os.path.exists(MODEL_PATH):
            print("[*] Model file not found, initiating training...")
            return train_and_save_model()
        try:
            return joblib.load(MODEL_PATH)
        except Exception as e:
            print(f"[!] Error loading model: {e}. Retraining...")
            return train_and_save_model()

    def clean_text(self, text: str) -> str:
        # Strip transaction hex tokens (e.g. TXNde8842f7) and currency markers
        cleaned = re.sub(r'TXN[a-zA-Z0-9]+', '', text)
        cleaned = re.sub(r'\bINR\b', '', cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r'\b[0-9]+\b', '', cleaned)
        return " ".join(cleaned.split())

    def categorize(self, description: str, merchant: Optional[str] = None, amount: Optional[float] = None) -> Dict[str, Any]:
        text = f"{merchant or ''} {description}".strip()
        cleaned_text = self.clean_text(text)
        
        if not cleaned_text:
            return {
                "category": "shopping",
                "display_category": "Shopping",
                "confidence": 0.5,
                "suggested_tags": ["general"]
            }
            
        probs = self.model.predict_proba([cleaned_text])[0]
        classes = self.model.classes_
        
        top_idx = probs.argmax()
        raw_category = classes[top_idx]
        confidence = float(probs[top_idx])
        
        # Comprehensive Rule Refinements
        lower = text.lower()
        if any(w in lower for w in [
            "fever", "cough", "cold", "flu", "headache", "paracetamol", "dolo", "crocin", 
            "medicine", "tablets", "syrup", "capsule", "antibiotic", "painkiller", "prescription",
            "hospital", "clinic", "doctor", "dr.", "physician", "patient", "consultation",
            "pharmacy", "chemist", "drugstore", "medical", "healthcare", "mediclaim",
            "apollo", "medplus", "netmeds", "pharmeasy", "1mg", "practo",
            "blood test", "diagnostic", "pathology", "lab test", "xray", "x-ray", "mri", "scan", "ultrasound",
            "dental", "dentist", "tooth", "optometrist", "eye checkup", "pediatrician", "dermatologist", "surgery", "therapy"
        ]):
            raw_category = "healthcare"
            confidence = max(confidence, 0.98)
        elif any(w in lower for w in [
            "uber", "ola", "rapido", "cab", "taxi", "flight", "air ticket", "indigo", "air india", 
            "irctc", "train ticket", "bus ticket", "redbus", "metro", "hotel", "makemytrip", 
            "goibibo", "petrol", "diesel", "fuel", "fastag", "toll", "parking", "auto ride"
        ]):
            raw_category = "travel"
            confidence = max(confidence, 0.98)
        elif any(w in lower for w in [
            "zomato", "swiggy", "pizza", "burger", "restaurant", "dining", "cafe", "coffee", "starbucks",
            "tea", "chai", "lunch", "dinner", "breakfast", "snacks", "bakery", "mcdonalds", "biryani",
            "groceries", "supermarket", "blinkit", "zepto", "instamart", "bigbasket", "vegetables", "milk"
        ]):
            raw_category = "food"
            confidence = max(confidence, 0.98)
        elif any(w in lower for w in [
            "home loan", "car loan", "bike loan", "personal loan", "emi", "hdfc loan", "sbi loan", "icici loan", "bajaj finserv"
        ]):
            raw_category = "emi"
            confidence = max(confidence, 0.98)
        elif any(w in lower for w in [
            "netflix", "movie", "pvr", "inox", "cinema", "theatre", "bookmyshow", "concert", 
            "spotify", "hotstar", "prime video", "youtube premium", "steam", "playstation", "arcade", "game"
        ]):
            raw_category = "entertainment"
            confidence = max(confidence, 0.98)
        elif any(w in lower for w in [
            "mutual fund", "sip", "zerodha", "groww", "stock", "shares", "crypto", "bitcoin", "fixed deposit", "ppf", "nps", "demat"
        ]):
            raw_category = "investment"
            confidence = max(confidence, 0.98)
        elif any(w in lower for w in [
            "electricity", "power bill", "bescom", "water bill", "gas bill", "lpg", "cylinder", 
            "recharge", "airtel", "jio", "broadband", "wifi", "maintenance bill", "tata play", "dth"
        ]):
            raw_category = "utilities"
            confidence = max(confidence, 0.98)
        elif any(w in lower for w in [
            "school fee", "college fee", "tuition", "exam fee", "university", "coursera", "udemy", "course", "library", "books", "coaching"
        ]):
            raw_category = "education"
            confidence = max(confidence, 0.98)
        elif any(w in lower for w in [
            "amazon", "flipkart", "myntra", "ajio", "zara", "h&m", "nykaa", "croma", "reliance digital", "shopping", "clothes", "shoes", "electronics"
        ]):
            raw_category = "shopping"
            confidence = max(confidence, 0.95)
        elif confidence < 0.35:
            raw_category = "shopping"
            confidence = 0.50
            
        tags = TAG_MAPPING.get(raw_category, ["expense"])
        display_name = DISPLAY_NAMES.get(raw_category, raw_category.title())
        
        return {
            "category": raw_category,
            "display_category": display_name,
            "confidence": round(confidence, 3),
            "suggested_tags": tags
        }

    def batch_categorize(self, items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        results = []
        for item in items:
            res = self.categorize(
                description=item.get("description", ""),
                merchant=item.get("merchant", ""),
                amount=item.get("amount")
            )
            results.append({
                "id": item.get("id"),
                "category": res["category"],
                "display_category": res["display_category"],
                "confidence": res["confidence"],
                "suggested_tags": res["suggested_tags"]
            })
        return results

categorizer_service = CategorizerService()
