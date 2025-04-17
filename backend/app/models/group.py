# backend/app/models/group.py
from sqlmodel import SQLModel, Field
from typing import Optional

class Group(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True)
    description: Optional[str] = None
    parent_group_id: Optional[int] = Field(default=None, foreign_key="groups.id")