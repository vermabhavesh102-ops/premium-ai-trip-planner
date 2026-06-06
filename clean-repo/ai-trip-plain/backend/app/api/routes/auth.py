from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.schemas.auth import TokenResponse, UserCreate, UserInDB, UserPublic
from app.services.auth_service import AuthService

router = APIRouter()
auth_service = AuthService()


@router.post("/signup", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
async def signup(payload: UserCreate):
    user = await auth_service.signup(payload)
    # user is a dataclass (UserRecord), not a Pydantic model
    return UserPublic(
        id=user.id,
        email=user.email,
        created_at=user.created_at,
    )


@router.post("/login", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    token = await auth_service.login(form_data.username, form_data.password)
    return TokenResponse(access_token=token, token_type="bearer")


@router.get("/me", response_model=UserPublic)
async def me(current_user: UserInDB = Depends(auth_service.get_current_user)):
    # current_user is already Pydantic (UserInDB)
    return UserPublic(
        id=current_user.id,
        email=current_user.email,
        created_at=current_user.created_at,
    )
