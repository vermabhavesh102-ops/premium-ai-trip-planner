from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Security
    # Scaffold-only default to avoid import-time crashes when .env is not created yet.
    # Replace with a real secret in production.
    JWT_SECRET: str = "dev_change_me"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Database
    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DB: str = "ai_trip_plan"

    # Other services
    GEMINI_API_KEY: str = ""
    GOOGLE_MAPS_API_KEY: str = ""


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
