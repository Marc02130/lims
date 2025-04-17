# backend/app/main.py
from fastapi import FastAPI, Depends
from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker  # Fixed import
from sqlalchemy.sql import text
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# FastAPI app
app = FastAPI(title="LIMS API")

# Database configuration
engine = create_async_engine(os.getenv("DATABASE_URL"))
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_session():
    async with AsyncSessionLocal() as session:
        yield session

# Test endpoint
@app.get("/test")
async def test_db(session: AsyncSession = Depends(get_session)):
    result = await session.execute(text("SELECT * FROM users"))
    return result.fetchall()