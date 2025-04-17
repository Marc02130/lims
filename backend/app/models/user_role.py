# backend/app/models/user_role.py
from sqlmodel import SQLModel, Field

class UserRole(SQLModel, table=True):
    user_id: int = Field(foreign_key="users.id", primary_key=True)
    role_id: int = Field(foreign_key="roles.id", primary_key=True)