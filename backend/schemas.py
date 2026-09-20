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