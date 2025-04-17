# backend/app/models/sample.py
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import Column

class Sample(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    sample_id: str = Field(unique=True)
    group_id: int = Field(foreign_key="groups.id")
    type: str
    status: str
    metadata: Optional[dict] = Field(default=None, sa_column=Column(JSONB))
    created_at: datetime = Field(default_factory=datetime.utcnow)