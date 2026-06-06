import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

# We use the DATABASE_URL from .env. If not present or still has placeholder, fallback to SQLite for local development so it doesn't crash.
db_url = os.getenv("DATABASE_URL", "sqlite:///./vendorbridge2.db")

if "[YOUR-PASSWORD]" in db_url:
    print("WARNING: You must replace [YOUR-PASSWORD] in backend/.env with your Supabase password. Falling back to local SQLite temporarily.")
    db_url = "sqlite:///./vendorbridge2.db"

# PostgreSQL connect_args don't take check_same_thread
connect_args = {}
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(db_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
