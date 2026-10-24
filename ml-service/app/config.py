import os

class Settings:
    PROJECT_NAME: str = "FinSight ML Intelligence Service"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api/ml"
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    CORS_ORIGINS: list = ["*"]

settings = Settings()
