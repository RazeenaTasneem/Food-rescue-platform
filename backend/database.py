import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from urllib.parse import quote_plus

load_dotenv()

DB_USER = os.getenv("DATABASE_USER")
DB_PASSWORD = os.getenv("DATABASE_PASSWORD")
DB_HOST = os.getenv("DATABASE_HOST", "localhost")
DB_PORT = os.getenv("DATABASE_PORT", "5432")
DB_NAME = os.getenv("DATABASE_NAME")

FULL_DB_URL = os.getenv("DATABASE_URL")

if FULL_DB_URL:
    # If the user provides a direct connection string, ensure it uses psycopg2
    if FULL_DB_URL.startswith("postgres://"):
        FULL_DB_URL = FULL_DB_URL.replace("postgres://", "postgresql+psycopg2://", 1)
    elif FULL_DB_URL.startswith("postgresql://"):
        FULL_DB_URL = FULL_DB_URL.replace("postgresql://", "postgresql+psycopg2://", 1)
        
    DATABASE_URL = FULL_DB_URL
    engine = create_engine(DATABASE_URL, echo=False)
elif DB_USER and DB_PASSWORD:
    # Safely encode the password so special characters don't break the URL
    encoded_password = quote_plus(DB_PASSWORD)
    DATABASE_URL = (
        f"postgresql://{DB_USER}:{encoded_password}"
        f"@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )
    engine = create_engine(
        DATABASE_URL,
        echo=False
    )
else:
    # Fallback to SQLite if no postgres credentials are provided
    DATABASE_URL = "sqlite:///./sharebite.db"
    engine = create_engine(
        DATABASE_URL, connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()