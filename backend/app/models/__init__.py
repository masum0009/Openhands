from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    agents = relationship("Agent", back_populates="owner")
    calls = relationship("Call", back_populates="user")


class Agent(Base):
    __tablename__ = "agents"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    system_prompt = Column(Text, nullable=False, default="You are a helpful AI voice assistant.")
    
    # Voice settings
    voice_id = Column(String(100), default="cartesia")
    voice_speed = Column(Float, default=1.0)
    voice_pitch = Column(Float, default=1.0)
    
    # Provider configuration
    stt_provider = Column(String(50), default="deepgram")
    llm_provider = Column(String(50), default="openai")
    tts_provider = Column(String(50), default="cartesia")
    
    # LLM model
    llm_model = Column(String(100), default="gpt-4o")
    
    # Additional config
    webhook_url = Column(String(500))
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Foreign keys
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    owner = relationship("User", back_populates="agents")
    calls = relationship("Call", back_populates="agent")


class Call(Base):
    __tablename__ = "calls"
    
    id = Column(Integer, primary_key=True, index=True)
    call_sid = Column(String(100), unique=True, index=True)
    caller_number = Column(String(50))
    callee_number = Column(String(50))
    status = Column(String(50), default="initiated")  # initiated, ringing, in-progress, completed, failed
    
    # Transcript
    transcript = Column(JSON)  # Array of {role, content, timestamp}
    
    # Metadata
    duration_seconds = Column(Integer, default=0)
    recording_url = Column(String(500))
    
    # Timestamps
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    ended_at = Column(DateTime(timezone=True))
    
    # Foreign keys
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    agent = relationship("Agent", back_populates="calls")
    user = relationship("User", back_populates="calls")
    conversations = relationship("Conversation", back_populates="call")


class Conversation(Base):
    __tablename__ = "conversations"
    
    id = Column(Integer, primary_key=True, index=True)
    role = Column(String(20), nullable=False)  # user, assistant
    content = Column(Text, nullable=False)
    audio_url = Column(String(500))
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Foreign key
    call_id = Column(Integer, ForeignKey("calls.id"), nullable=False)
    
    # Relationships
    call = relationship("Call", back_populates="conversations")
