from fastapi import FastAPI, Depends
from sqlalchemy.sql import text

app = FastAPI()

@app.get("/test")
async def test_db(session: AsyncSession = Depends(get_session)):
    result = await session.execute(text("SELECT * FROM users"))
    return result.fetchall()