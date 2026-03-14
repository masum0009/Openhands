from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# Agent schemas
class AgentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    system_prompt: str = Field(default="You are a helpful AI voice assistant.")
    voice_id: str = "cartesia"
    voice_speed: float = 1.0
    voice_pitch: float = 1.0
    stt_provider: str = "deepgram"
    llm_provider: str = "openai"
    tts_provider: str = "cartesia"
    llm_model: str = "gpt-4o"
    webhook_url: Optional[str] = None
    is_active: bool = True


class AgentCreate(AgentBase):
    pass


class AgentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    system_prompt: Optional[str] = None
    voice_id: Optional[str] = None
    voice_speed: Optional[float] = None
    voice_pitch: Optional[float] = None
    stt_provider: Optional[str] = None
    llm_provider: Optional[str] = None
    tts_provider: Optional[str] = None
    llm_model: Optional[str] = None
    webhook_url: Optional[str] = None
    is_active: Optional[bool] = None


class AgentResponse(AgentBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
