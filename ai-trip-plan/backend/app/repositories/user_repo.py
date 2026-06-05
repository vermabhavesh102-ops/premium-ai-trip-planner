from __future__ import annotations

import uuid
from dataclasses import dataclass
from typing import Dict, Optional

from app.core.security import hash_password, verify_password


@dataclass
class UserRecord:
    id: str
    email: str
    password_hash: str
    created_at: str


class InMemoryUserRepository:
    """
    Temp repository for scaffolding.
    Replace with Mongo/Postgres implementation in Milestone A later.
    """

    def __init__(self):
        self._users_by_email: Dict[str, UserRecord] = {}

    async def create_user(self, *, email: str, password: str) -> UserRecord:
        # Normalize email to lower-case to prevent duplicates by case
        norm_email = email.strip().lower()
        if norm_email in self._users_by_email:
            raise ValueError("email_exists")

        rec = UserRecord(
            id=str(uuid.uuid4()),
            email=norm_email,
            password_hash=hash_password(password),
            created_at="1970-01-01T00:00:00Z",
        )
        self._users_by_email[norm_email] = rec
        return rec

    async def get_by_email(self, email: str) -> Optional[UserRecord]:
        return self._users_by_email.get(email.strip().lower())

    async def verify_credentials(self, *, email: str, password: str) -> Optional[UserRecord]:
        user = self._users_by_email.get(email.strip().lower())
        if not user:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user


# Singleton instance for now
user_repo = InMemoryUserRepository()
