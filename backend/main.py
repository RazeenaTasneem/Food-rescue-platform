from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine

from database import Base
from models import User

from routes.auth import router as auth_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Food Rescue Platform API",
    description="Backend API for connecting food donors, NGOs and volunteers.",
    version="1.0.0"
)

app.include_router(auth_router)


# Allow React frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Food Rescue Platform API is running"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy"
    }


@app.get("/api/database-test")
def database_test():
    try:
        with engine.connect() as connection:
            return {
                "database": "connected",
                "status": "success"
            }

    except Exception as error:
        return {
            "database": "connection failed",
            "error": str(error)
        }