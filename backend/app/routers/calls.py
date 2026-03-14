from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.database import get_db
from app.models import User, Agent, Call, Conversation
from app.auth import get_current_active_user
from app.schemas_call import (
    CallCreate, CallUpdate, CallResponse, CallDetailResponse,
    ConversationResponse
)

router = APIRouter(prefix="/calls", tags=["Calls"])


@router.get("/", response_model=List[CallResponse])
async def list_calls(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    agent_id: int = None,
    skip: int = 0,
    limit: int = 100
):
    query = select(Call).where(Call.user_id == current_user.id)
    
    if agent_id:
        query = query.where(Call.agent_id == agent_id)
    
    result = await db.execute(
        query.offset(skip).limit(limit).order_by(Call.started_at.desc())
    )
    return result.scalars().all()


@router.get("/{call_id}", response_model=CallDetailResponse)
async def get_call(
    call_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(
        select(Call).where(Call.id == call_id, Call.user_id == current_user.id)
    )
    call = result.scalar_one_or_none()
    
    if not call:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Call not found"
        )
    return call


@router.put("/{call_id}", response_model=CallResponse)
async def update_call(
    call_id: int,
    call_data: CallUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(
        select(Call).where(Call.id == call_id, Call.user_id == current_user.id)
    )
    call = result.scalar_one_or_none()
    
    if not call:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Call not found"
        )
    
    update_data = call_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(call, field, value)
    
    await db.commit()
    await db.refresh(call)
    return call


@router.get("/{call_id}/transcript")
async def get_transcript(
    call_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(
        select(Call).where(Call.id == call_id, Call.user_id == current_user.id)
    )
    call = result.scalar_one_or_none()
    
    if not call:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Call not found"
        )
    
    return {"transcript": call.transcript or [], "duration_seconds": call.duration_seconds}
