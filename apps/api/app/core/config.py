from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Enterprise Operations Dashboard"

    DATABASE_URL: str = (
        "postgresql://postgres:postgres@localhost:5432/enterprise_dashboard"
    )

    SECRET_KEY: str = "development-secret-key"

    class Config:
        env_file = ".env"


settings = Settings()