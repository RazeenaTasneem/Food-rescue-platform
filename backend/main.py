from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine

from database import Base
from models import User, Donation

from routes.auth import router as auth_router

from routes.donations import router as donations_router

from routes.ngo import router as ngo_router

from routes.volunteer import router as volunteer_router
from routes.admin import router as admin_router

Base.metadata.create_all(bind=engine)

def seed_admin_user():
    try:
        import bcrypt
        from database import SessionLocal
        with SessionLocal() as db:
            admin_user = db.query(User).filter(User.role == "ADMIN").first()
            if not admin_user:
                hashed = bcrypt.hashpw("Admin@12345".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
                new_admin = User(
                    name="ShareBite Admin",
                    email="admin@sharebite.com",
                    password_hash=hashed,
                    phone="9998887776",
                    role="ADMIN"
                )
                db.add(new_admin)
                db.commit()
                print("Default admin created: admin@sharebite.com / Admin@12345")
    except Exception as e:
        print("Admin seed error:", e)

seed_admin_user()

app = FastAPI(
    title="Food Rescue Platform API",
    description="Backend API for connecting food donors, NGOs and volunteers.",
    version="1.0.0"
)

# Allow React frontend to communicate with backend
# IMPORTANT: Middleware must be added BEFORE routers are included
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(donations_router)
app.include_router(ngo_router)
app.include_router(volunteer_router)
app.include_router(admin_router)


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


@app.get("/api/stats")
def global_stats():
    try:
        from database import SessionLocal
        with SessionLocal() as db:
            donations = db.query(Donation).all()
            meals_rescued = sum(d.quantity for d in donations if d.quantity)
            
            donors_count = db.query(User).filter(User.role == "DONOR").count()
            ngos_count = db.query(User).filter(User.role == "NGO").count()
            volunteers_count = db.query(User).filter(User.role == "VOLUNTEER").count()
            
            return {
                "meals_rescued": meals_rescued,
                "donors": donors_count,
                "ngos": ngos_count,
                "volunteers": volunteers_count
            }
    except Exception as error:
        return {
            "meals_rescued": 0,
            "donors": 0,
            "ngos": 0,
            "volunteers": 0
        }