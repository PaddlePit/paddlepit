# """Database session management"""
# from typing import AsyncGenerator
# from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
# from sqlalchemy.orm import sessionmaker
# from sqlmodel import SQLModel

# DATABASE_URL = "sqlite+aiosqlite:///./paddlepit.db"

# engine = create_async_engine(
#     DATABASE_URL,
#     echo=False,
#     future=True,
#     connect_args={"check_same_thread": False},
# )

# async_session = sessionmaker(
#     engine, class_=AsyncSession, expire_on_commit=False
# )


# async def init_db():
#     """Initialize database tables"""
#     async with engine.begin() as conn:
#         await conn.run_sync(SQLModel.metadata.create_all)


# async def get_session() -> AsyncGenerator[AsyncSession, None]:
#     """Dependency to get database session"""
#     async with async_session() as session:
#         yield session
