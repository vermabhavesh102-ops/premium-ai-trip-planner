from datetime import datetime
from typing import Optional
 
from pydantic import BaseModel, EmailStr, Field, constr, validator
 
# Password must be at least 8 chars and include uppercase, lowercase, number, special char
PasswordStr = constr(min_length=8, max_length=128, regex=r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$')
 
class UserCreate(BaseModel):
    email: EmailStr
    password: PasswordStr
    full_name: constr(min_length=1, max_length=100)
 
    @validator('full_name')
    def strip_full_name(cls, v: str) -> str:
        return v.strip()
 
 
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
