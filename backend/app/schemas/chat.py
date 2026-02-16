from datetime import datetime
from uuid import UUID
from pydantic import BaseModel
from typing import Optional, List

# Message Schemas
class MessageBase(BaseModel):
    content: str
    sender: str  # 'user' or 'ai'

class MessageCreate(MessageBase):
    pass

class MessageResponse(MessageBase):
    id: UUID
    conversation_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

# Conversation Schemas
class ConversationBase(BaseModel):
    title: Optional[str] = None

class ConversationCreate(ConversationBase):
    pass

class ConversationResponse(ConversationBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True

# Chat Request Schema
class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[UUID] = None
