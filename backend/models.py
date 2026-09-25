from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    Float
)

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(100),
        nullable=False
    )

    email = Column(
        String(255),
        unique=True,
        index=True,
        nullable=False
    )

    password_hash = Column(
        String(255),
        nullable=False
    )

    phone = Column(
        String(20),
        nullable=False
    )

    role = Column(
        String(20),
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )


class Donation(Base):
    __tablename__ = "donations"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    donor_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    food_name = Column(
        String(150),
        nullable=False
    )

    food_type = Column(
        String(50),
        nullable=False
    )

    quantity = Column(
        Integer,
        nullable=False
    )

    prepared_at = Column(
        DateTime,
        nullable=False
    )

    available_until = Column(
        DateTime,
        nullable=False
    )

    latitude = Column(
        Float,
        nullable=True
    )

    longitude = Column(
        Float,
        nullable=True
    )

    status = Column(
        String(30),
        default="AVAILABLE",
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

class RescueMission(Base):
    __tablename__ = "rescue_missions"

    id = Column(Integer, primary_key=True, index=True)

    donation_id = Column(
        Integer,
        ForeignKey("donations.id"),
        nullable=False
    )

    ngo_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    volunteer_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    status = Column(
        String(30),
        default="REQUESTED",
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    completed_at = Column(
        DateTime,
        nullable=True
    )