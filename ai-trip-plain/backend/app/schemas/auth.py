from datetime import datetime
from pydantic import BaseModel, EmailStr, constr
 
# Password must be at least 8 chars and include uppercase, lowercase, number, special char
PasswordStr = constr(min_length=8, max_length=128, regex=r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$')
 
class UserCreate(BaseModel):
    email: EmailStr
    password: PasswordStr
 
 
class UserPublic(BaseModel):
    id: str
    email: EmailStr
    created_at: datetime
 
 
class UserInDB(UserPublic):
    # Password hash stored server-side only
    password_hash: str
 
 
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
