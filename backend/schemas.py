from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    phone: str = Field(min_length=10, max_length=20)
    role: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    role: str

    class Config:
        from_attributes = True

class DonationCreate(BaseModel):
    food_name: str
    food_type: str
    quantity: int
    prepared_at: datetime
    available_until: datetime
    latitude: float | None = None
    longitude: float | None = None


class DonationResponse(BaseModel):
    id: int
    donor_id: int
    food_name: str
    food_type: str
    quantity: int
    prepared_at: datetime
    available_until: datetime
    latitude: float | None = None
    longitude: float | None = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class RescueMissionResponse(BaseModel):
    id: int
    donation_id: int
    ngo_id: int
    volunteer_id: int | None = None
    status: str
    created_at: datetime
    completed_at: datetime | None = None

    class Config:
        from_attributes = True