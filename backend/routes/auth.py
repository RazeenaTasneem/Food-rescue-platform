import os

from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)

from fastapi.security import (
    OAuth2PasswordBearer,
    OAuth2PasswordRequestForm
)

from jose import jwt, JWTError

from sqlalchemy.orm import Session

import bcrypt

from database import get_db
from models import User
from schemas import UserCreate, UserResponse


from auth import create_access_token

# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# ============================================================
# REGISTER USER
# ============================================================

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=201
)
def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):

    # Check whether email already exists

    existing_user = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )


    # Validate role

    allowed_roles = [
        "DONOR",
        "NGO",
        "VOLUNTEER",
        "ADMIN"
    ]

    if user_data.role not in allowed_roles:

        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid role. "
                "Use DONOR, NGO, VOLUNTEER or ADMIN."
            )
        )


    # Hash password

    hashed_password = bcrypt.hashpw(
        user_data.password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")


    # Create user

    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hashed_password,
        phone=user_data.phone,
        role=user_data.role
    )

    db.add(new_user)

    db.commit()

    db.refresh(new_user)

    return new_user


# ============================================================
# LOGIN USER
# ============================================================

@router.post(
    "/login"
)
def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    # Find user using email

    user = (
        db.query(User)
        .filter(
            User.email == form_data.username
        )
        .first()
    )


    # User doesn't exist

    if user is None:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )


    # Verify password

    password_valid = bcrypt.checkpw(
        form_data.password.encode("utf-8"),
        user.password_hash.encode("utf-8")
    )


    if not password_valid:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )


    # Create JWT

    access_token = create_access_token(
        user_id=user.id,
        role=user.role
    )


    # Return token + user information

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }