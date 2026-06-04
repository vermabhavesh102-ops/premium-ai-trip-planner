from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.core.config import settings, Settings
from app.core.jwt import create_access_token, decode_token
from app.repositories.user_repo import UserRecord, user_repo
from app.schemas.auth import UserInDB

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


class AuthService:
    def __init__(self, *, settings: Settings = settings):
        self.settings = settings

    async def signup(self, payload) -> UserRecord:
        # payload is expected to be a Pydantic UserCreate model (validated at route)
        try:
            # Create user; repository will hash password
            return await user_repo.create_user(
                email=payload.email,
                password=payload.password,
                full_name=payload.full_name,
            )
        except ValueError as e:
            if str(e) == "email_exists":
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Email already registered",
                )
            # Unexpected repository error
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Could not create user",
            )

    async def login(self, email: str, password: str) -> str:
        # Verify credentials using repository (handles hashing)
        user = await user_repo.verify_credentials(email=email, password=password)
        if not user:
            # Do not reveal whether email or password was incorrect
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )

        return create_access_token(
            subject=user.id,
            settings=self.settings,
            additional_claims={"email": user.email},
        )

    async def get_current_user(self, token: str = Depends(oauth2_scheme)) -> UserInDB:
        try:
            decoded = decode_token(token, settings=self.settings)
            sub = decoded.get("sub")
            email = decoded.get("email")
            if not sub or not email:
                raise ValueError("invalid_token")
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
            )

        user = await user_repo.get_by_email(email)
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

        return UserInDB(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            password_hash=user.password_hash,
            created_at=user.created_at,
        )