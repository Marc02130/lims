# backend/app/models/refresh_token.py
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Column
import sqlalchemy as sa  # Added import

class RefreshToken(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    token: str = Field(sa_column=sa.Column(UUID(as_uuid=True), unique=True, server_default=sa.text("uuid_generate_v4()")))
    expires_at: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)
