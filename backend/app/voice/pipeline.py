"""
Voice Pipeline Module - Real-time voice processing with Pipecat
"""
import asyncio
import json
from typing import Dict, Any, Optional
from datetime import datetime

from pipecat.audio.vad.silero import SileroVAD
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat.processors.aggregators.openai_llm_context import OpenAILLMContext
from pipecat.processors.frame_processor import FrameProcessor
from pipecat.transports.network.fastapi_ws import FastAPIWebsocketTransport
from pipecat.services.openai import OpenAILLMService
from pipecat.services.deepgram import DeepgramSTTService
from pipecat.services.cartesia import CartesiaTTSService
from fastapi import WebSocket

from app.models import Agent, Call
from sqlalchemy.ext.asyncio import AsyncSession


class TranscriptFrame:
    """Frame to hold transcript data"""
    def __init__(self, role: str, content: str):
        self.role = role
        self.content = content
        self.timestamp = datetime.utcnow()


class TwilioFrameProcessor(FrameProcessor):
    """Custom frame processor for Twilio audio format"""
    
    def __init__(self, websocket: WebSocket, call: Call, db: AsyncSession):
        super().__init__()
        self.websocket = websocket
        self.call = call
        self.db = db
        self.transcript = []
        self.duration_seconds = 0
        self.start_time = datetime.utcnow()
    
    async def process_frame(self, frame, direction):
        await super().process_frame(frame, direction)
        
        if isinstance(frame, TranscriptFrame):
            # Store transcript
            self.transcript.append({
                "role": frame.role,
                "content": frame.content,
                "timestamp": frame.timestamp.isoformat()
            })
            
            # Update call in database periodically
            if len(self.transcript) % 5 == 0:
                await self.save_transcript()
    
    async def save_transcript(self):
        """Save transcript to database"""
        self.call.transcript = self.transcript
        self.duration_seconds = int((datetime.utcnow() - self.start_time).total_seconds())
        self.call.duration_seconds = self.duration_seconds
        await self.db.commit()
    
    async def cleanup(self):
        """Save final transcript"""
        await self.save_transcript()


class VoicePipeline:
    """Voice agent pipeline using Pipecat"""
    
    def __init__(self, agent: Agent, call: Call, db: AsyncSession):
        self.agent = agent
        self.call = call
        self.db = db
        self.transcript = []
    
    async def run(self, websocket: WebSocket):
        """Run the voice pipeline"""
        # Create transport for Twilio WebSocket
        transport = FastAPIWebsocketTransport(
            websocket=websocket,
            audio_out_sample_rate=8000,
            audio_out_channels=1
        )
        
        # Initialize services
        vad = SileroVAD()
        
        stt = DeepgramSTTService(
            api_key="",  # Will be loaded from config
            model="nova-2",
            language="en"
        )
        
        llm = OpenAILLMService(
            api_key="",  # Will be loaded from config
            model=self.agent.llm_model
        )
        
        tts = CartesiaTTSService(
            api_key="",  # Will be loaded from config
            voice_id=self.agent.voice_id
        )
        
        # Create custom frame processor
        frame_processor = TwilioFrameProcessor(websocket, self.call, self.db)
        
        # Build conversation context with system prompt
        messages = [
            {
                "role": "system",
                "content": self.agent.system_prompt
            }
        ]
        context = OpenAILLMContext(messages)
        context_aggregator = llm.create_context_aggregator(context)
        
        # Build pipeline
        pipeline = Pipeline([
            transport.input(),  # Twilio transport
            vad,  # Voice activity detection
            stt,  # Speech to text
            context_aggregator.user(),
            llm,  # LLM processing
            tts,  # Text to speech
            transport.output(),  # Twilio transport
            context_aggregator.assistant(),
            frame_processor,  # Custom transcript processor
        ])
        
        # Run pipeline
        runner = PipelineRunner()
        
        await runner.run(pipeline)


async def create_voice_pipeline(agent_id: int, call_id: int, db: AsyncSession) -> Optional[VoicePipeline]:
    """Factory function to create a voice pipeline"""
    from sqlalchemy import select
    
    # Get agent
    result = await db.execute(select(Agent).where(Agent.id == agent_id))
    agent = result.scalar_one_or_none()
    
    if not agent or not agent.is_active:
        return None
    
    # Get call
    result = await db.execute(select(Call).where(Call.id == call_id))
    call = result.scalar_one_or_none()
    
    if not call:
        return None
    
    return VoicePipeline(agent=agent, call=call, db=db)
