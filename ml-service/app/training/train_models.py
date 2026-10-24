"""
FinSight ML Model Trainer.
Builds and serializes the scikit-learn NLP categorization pipeline.
"""
import os
import sys

# Ensure root directory is in sys.path
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from app.training.dataset import TRAINING_DATA

MODEL_DIR = os.path.join(os.path.dirname(__file__), "saved_models")
MODEL_PATH = os.path.join(MODEL_DIR, "categorizer_pipeline.joblib")

def train_and_save_model():
    os.makedirs(MODEL_DIR, exist_ok=True)
    
    texts = [item[0] for item in TRAINING_DATA]
    labels = [item[1] for item in TRAINING_DATA]
    
    print(f"[*] Training NLP Categorizer on {len(texts)} samples across {len(set(labels))} categories...")
    
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(
            ngram_range=(1, 3),
            lowercase=True,
            stop_words='english',
            token_pattern=r'(?u)\b[a-zA-Z]{2,}\b'  # Ignore hex transaction IDs and purely numerical tokens
        )),
        ('clf', LogisticRegression(
            C=10.0,
            max_iter=500,
            class_weight='balanced',
            solver='lbfgs'
        ))
    ])
    
    pipeline.fit(texts, labels)
    
    train_score = pipeline.score(texts, labels)
    print(f"[+] Categorizer trained successfully! Accuracy: {train_score * 100:.2f}%")
    
    joblib.dump(pipeline, MODEL_PATH)
    print(f"[+] Model saved to: {MODEL_PATH}")
    return pipeline

if __name__ == "__main__":
    train_and_save_model()
