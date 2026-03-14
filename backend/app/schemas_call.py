from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# Call schemas
class CallBase(BaseModel):
    agent_id: int
    caller_number: Optional[str] = None
    callee_number: Optional[str] = None


class CallCreate(CallBase):
    call_sid: Optional[str] = None


class CallUpdate(BaseModel):
    status: Optional[str] = None
    transcript: Optional[List[Dict[str, Any]]] = None
    duration_seconds: Optional[int] = None
    recording_url: Optional[str] = None
    ended_at: Optional[datetime] = None


class MessageItem(BaseModel):
    role: str  # user, assistant
    content: str
    timestamp: Optional[datetime] = None


class CallResponse(CallBase):
    id: int
    call_sid: Optional[str] = None
    status: str
    transcript: Optional[List[Dict[str, Any]]] = None
    duration_seconds: int
    recording_url: Optional[str] = None
    started_at: datetime
    ended_at: Optional[datetime] = None
    user_id: int

    class Config:
        from_attributes = True


class CallDetailResponse(CallResponse):
    conversations: List["ConversationResponse"] = []


# Conversation schemas
class ConversationBase(BaseModel):
    role: str
    content: str
    audio_url: Optional[str] = None


class ConversationResponse(ConversationBase):
    id: int
    call_id: int
    timestamp: datetime

    class Config:
        from_attributes = True
