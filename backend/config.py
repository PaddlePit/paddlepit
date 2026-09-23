from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    # App Settings
    APP_NAME: str = "PaddlePit API"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"  # development, staging, production

    # Database (DynamoDB)
    DB_REGION_NAME: str = "us-east-1"
    DB_ACCESS_KEY_ID: Optional[str] = None
    DB_SECRET_ACCESS_KEY: Optional[str] = None
    DYNAMODB_ENDPOINT_URL: Optional[str] = None  # For local development

    # AWS (General)
    AWS_REGION: str = "us-east-1"

    # S3
    S3_BUCKET_NAME: str = "paddlepit-dev-uploads"
    S3_UPLOADS_DIR: str = "uploads"

    # SES (Email)
    SES_SENDER_EMAIL: str = "noreply@paddlepit.local"
    SES_REGION_NAME: str = "us-east-1"

    # PayMongo
    PAYMONGO_SECRET_KEY: Optional[str] = None
    PAYMONGO_PUBLIC_KEY: Optional[str] = None
    PAYMONGO_WEBHOOK_SECRET: Optional[str] = None

    # Google OAuth
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/auth/google/callback"

    # JWT (Authentication)
    JWT_SECRET_KEY: Optional[str] = None
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:3001"]

    # API Settings
    API_DOCS_ENABLED: bool = True
    API_REDOC_ENABLED: bool = True

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
