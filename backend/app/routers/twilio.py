from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, Query
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from twilio.twiml.voice_response import VoiceResponse, Connect
from twilio.rest import Client
from typing import Optional

from app.config import settings
from app.database import get_db
from app.models import User, Agent, Call
from app.auth import get_current_active_user
from app.voice.pipeline import VoicePipeline

router = APIRouter(prefix="/twilio", tags=["Twilio"])


@router.post("/inbound")
async def handle_inbound_call(
    CallSid: str = Query(...),
    From: str = Query(...),
    To: str = Query(...),
    db: AsyncSession = Depends(get_db)
):
    """Handle inbound Twilio calls and connect to voice agent"""
    # Find agent by phone number or use default
    result = await db.execute(select(Agent).where(Agent.is_active == True))
    agent = result.scalars().first()
    
    if not agent:
        raise HTTPException(status_code=404, detail="No active agent available")
    
    # Create call record
    call = Call(
        call_sid=CallSid,
        caller_number=From,
        callee_number=To,
        agent_id=agent.id,
        user_id=agent.owner_id,
        status="initiated"
    )
    db.add(call)
    await db.commit()
    
    # Generate TwiML response to connect to media stream
    response = VoiceResponse()
    connect = Connect()
    connect.stream(url=f"wss://{settings.TWILIO_ACCOUNT_SID}:voice")
    response.append(connect)
    
    return Response(content=str(response), media_type="application/xml")


@router.websocket("/voice/{call_id}")
async def voice_websocket(
    websocket: WebSocket,
    call_id: int,
    db: AsyncSession = Depends(get_db)
):
    """WebSocket endpoint for real-time voice processing"""
    await websocket.accept()
    
    # Get call and agent
    result = await db.execute(select(Call).where(Call.id == call_id))
    call = result.scalar_one_or_none()
    
    if not call:
        await websocket.close(code=4004, reason="Call not found")
        return
    
    result = await db.execute(select(Agent).where(Agent.id == call.agent_id))
    agent = result.scalar_one_or_none()
    
    if not agent:
        await websocket.close(code=4004, reason="Agent not found")
        return
    
    # Create and run voice pipeline
    pipeline = VoicePipeline(agent=agent, call=call, db=db)
    
    try:
        await pipeline.run(websocket)
    except Exception as e:
        print(f"Pipeline error: {e}")
    finally:
        await websocket.close()


@router.post("/status")
async def handle_status_callback(
    CallSid: str = Query(...),
    CallStatus: str = Query(...),
    db: AsyncSession = Depends(get_db)
):
    """Handle Twilio status callback"""
    result = await db.execute(select(Call).where(Call.call_sid == CallSid))
    call = result.scalar_one_or_none()
    
    if call:
        call.status = CallStatus
        if CallStatus in ["completed", "busy", "failed", "no-answer"]:
            from datetime import datetime
            call.ended_at = datetime.utcnow()
        await db.commit()
    
    return {"status": "ok"}
