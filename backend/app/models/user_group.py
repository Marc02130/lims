# backend/app/models/user_group.py
from sqlmodel import SQLModel, Field

class UserGroup(SQLModel, table=True):
    user_id: int = Field(foreign_key="users.id", primary_key=True)
    group_id: int = Field(foreign_key="groups.id", primary_key=True)