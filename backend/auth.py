from datetime import datetime, timedelta, timezone
import os

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from database import get_db
from models import User


SECRET_KEY = os.getenv("JWT_SECRET_KEY", "super-secret-dev-key")

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60

# This tells FastAPI where clients obtain the token.
# It also automatically reads the Authorization: Bearer <token> header.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def create_access_token(user_id: int, role: str):
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(user_id),
        "role": role,
        "exp": expire
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    FastAPI dependency that:
    1. Reads the JWT from the Authorization: Bearer <token> header
    2. Decodes and validates the token
    3. Extracts the user ID from the "sub" claim
    4. Looks up the user in PostgreSQL
    5. Returns the authenticated User object

    Raises HTTP 401 if the token is missing, invalid,
    expired, or the user no longer exists.
    """

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Decode the JWT (python-jose checks expiry automatically)
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        # Read the user ID from the "sub" claim
        user_id_str: str = payload.get("sub")

        if user_id_str is None:
            raise credentials_exception

        user_id = int(user_id_str)

    except JWTError:
        raise credentials_exception

    # Look up the user in the database
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if user is None:
        raise credentials_exception

    return user