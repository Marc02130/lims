# backend/app/models/role.py
from sqlmodel import SQLModel, Field
from typing import Optional
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import Column

class Role(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True)
    permissions: Optional[dict] = Field(default=None, sa_column=Column(JSONB))