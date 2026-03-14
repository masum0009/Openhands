"""
Twilio Media Streams Transport for Pipecat

This module provides custom transport for handling Twilio Media Streams,
which uses a specific message format for audio data.
"""
import asyncio
import base64
import json
from typing import AsyncGenerator, Optional
from pipecat.transports.network.network_transport import NetworkTransport
from pipecat.transports.network.fastapi_ws import FastAPIWebsocketTransport
from pipecat.audio.aiostream2wavefile import aio2wav
import io


class TwilioMessageType:
    """Twilio Media Stream message types"""
    CONNECT = "connect"
    START = "start"
    MEDIA = "media"
    STOP = "stop"
    DISCONNECTED = "disconnected"


class TwilioTransport:
    """
    Custom transport for Twilio Media Streams
    
    Twilio sends audio in the following format:
    {
        "event": "media",
        "media": {
            "track": "inbound",
            "chunk": "1",
            "timestamp": "0",
            "payload": "<base64 encoded audio>"
        }
    }
    
    And expects responses in the same format for outbound audio.
    """
    
    def __init__(self, websocket, sample_rate: int = 8000, channels: int = 1):
        self.websocket = websocket
        self.sample_rate = sample_rate
        self.channels = channels
        self.stream_sid: Optional[str] = None
        self.is_active = False
        self._receive_task: Optional[asyncio.Task] = None
    
    async def connect(self):
        """Initialize the transport"""
        await self.websocket.accept()
        self.is_active = True
    
    async def handle_connect(self, payload: dict):
        """Handle CONNECT event from Twilio"""
        # Store any connection metadata
        pass
    
    async def handle_start(self, payload: dict):
        """Handle START event - stream is about to begin"""
        self.stream_sid = payload.get("streamSid")
        self.is_active = True
    
    async def handle_media(self, payload: dict) -> bytes:
        """Handle MEDIA event - receive audio data"""
        audio_data = payload.get("media", {}).get("payload", "")
        if audio_data:
            return base64.b64decode(audio_data)
        return b""
    
    async def handle_stop(self, payload: dict):
        """Handle STOP event - stream has ended"""
        self.is_active = False
    
    async def send_audio(self, audio_data: bytes):
        """Send audio data to Twilio"""
        if not self.is_active or not self.stream_sid:
            return
        
        # Encode audio as base64
        encoded = base64.b64encode(audio_data).decode("utf-8")
        
        message = {
            "event": "media",
            "streamSid": self.stream_sid,
            "media": {
                "payload": encoded
            }
        }
        
        await self.websocket.send_json(message)
    
    async def receive_audio(self) -> AsyncGenerator[bytes, None]:
        """Generator that yields incoming audio frames"""
        async for message in self.websocket.iter_json():
            event = message.get("event")
            
            if event == TwilioMessageType.CONNECT:
                await self.handle_connect(message)
            elif event == TwilioMessageType.START:
                await self.handle_start(message)
            elif event == TwilioMessageType.MEDIA:
                audio = await self.handle_media(message)
                if audio:
                    yield audio
            elif event == TwilioMessageType.STOP:
                await self.handle_stop(message)
                break
    
    async def close(self):
        """Close the transport"""
        self.is_active = False
        await self.websocket.close()
    
    async def get_audio_generator(self) -> AsyncGenerator[bytes, None]:
        """Get the audio receiver generator"""
        return self.receive_audio()
