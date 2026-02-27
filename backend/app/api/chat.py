from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.core import get_db
from app.models import User, Conversation, Message
from app.schemas.chat import ChatRequest, ConversationResponse, MessageResponse
from app.api.auth import get_current_user
from app.llm.service import generate_chat_response
from uuid import UUID
import logging

router = APIRouter(prefix="/chat", tags=["chat"])
logger = logging.getLogger(__name__)


@router.get("", response_model=list[ConversationResponse])
def get_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all conversations for current user."""
    conversations = db.query(Conversation).filter(
        Conversation.user_id == current_user.id
    ).order_by(Conversation.updated_at.desc()).all()
    return conversations


@router.get("/{conversation_id}", response_model=ConversationResponse)
def get_conversation(
    conversation_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get specific conversation with messages."""
    conversation = db.query(Conversation).options(
        joinedload(Conversation.messages)
    ).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return conversation


@router.post("/message", response_model=ConversationResponse)
async def send_message(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Send a message and get AI response."""
    
    # 1. Get or Create Conversation
    if request.conversation_id:
        conversation = db.query(Conversation).filter(
            Conversation.id == request.conversation_id,
            Conversation.user_id == current_user.id
        ).first()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        # Create new conversation
        # Generate title from first message (truncate)
        title = request.message[:50] + "..." if len(request.message) > 50 else request.message
        conversation = Conversation(
            user_id=current_user.id,
            title=title
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    # 2. Save User Message
    user_msg = Message(
        conversation_id=conversation.id,
        sender="user",
        content=request.message
    )
    db.add(user_msg)
    
    # 3. Generate AI Response
    # Fetch history for context
    history = db.query(Message).filter(
        Message.conversation_id == conversation.id
    ).order_by(Message.created_at.asc()).all()
    
    # We include the *current* user message in history for the AI service if it's not committed yet?
    # SQLAlchemy session has it pending. We can pass it manually.
    
    # Call Service — ใช้ persona จาก request ก่อน ถ้าไม่มีใช้ user default
    effective_persona = request.persona or str(current_user.persona.value if hasattr(current_user.persona, 'value') else current_user.persona)
    ai_response_text = await generate_chat_response(
        history=history,
        current_message=request.message,
        persona=effective_persona
    )
    
    # 4. Save AI Message
    ai_msg = Message(
        conversation_id=conversation.id,
        sender="ai",
        content=ai_response_text
    )
    db.add(ai_msg)
    
    # Update conversation timestamp
    conversation.updated_at = ai_msg.created_at
    
    db.commit()
    db.refresh(conversation)
    
    # Return updated conversation with all messages
    # Force reload messages to ensure order
    db.refresh(conversation)
    return conversation
