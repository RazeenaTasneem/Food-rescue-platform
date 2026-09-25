from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine

from database import Base
from models import User, Donation

from routes.auth import router as auth_router

from routes.donations import router as donations_router

from routes.ngo import router as ngo_router

from routes.volunteer import router as volunteer_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Food Rescue Platform API",
    description="Backend API for connecting food donors, NGOs and volunteers.",
    version="1.0.0"
)

app.include_router(auth_router)
app.include_router(donations_router)
app.include_router(ngo_router)
app.include_router(volunteer_router)


# Allow React frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
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