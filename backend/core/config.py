from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    gemini_api_key: str = ""
    gemini_model: str = "gemini-3-flash-preview"
    sarvam_api_key: str = ""
    sarvam_api_base: str = "https://api.sarvam.ai"
    firebase_project_id: str = ""
    firebase_private_key: str = ""
    firebase_client_email: str = ""
    allowed_origins: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
