from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=1, max_length=100)


class UserPublic(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    created_at: datetime


class UserInDB(UserPublic):
    # Password hash stored server-side only
    password_hash: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
