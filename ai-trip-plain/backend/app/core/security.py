import bcrypt

# bcrypt has an internal 72-byte max for password length (UTF-8 bytes)
_BCRYPT_MAX_BYTES = 72
_DEFAULT_ROUNDS = 12


def _encode_password(password: str) -> bytes:
    if password is None:
        raise ValueError("Password is required")
    pwd_bytes = password.encode("utf-8")
    if len(pwd_bytes) > _BCRYPT_MAX_BYTES:
        raise ValueError(f"Password must be <= {_BCRYPT_MAX_BYTES} bytes when UTF-8 encoded")
    return pwd_bytes


def hash_password(password: str) -> str:
    """
    Returns bcrypt hash as utf-8 string.
    """
    pwd_bytes = _encode_password(password)
    salt = bcrypt.gensalt(rounds=_DEFAULT_ROUNDS)
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    """
    Returns True if password matches given bcrypt hash.
    """
    try:
        pwd_bytes = _encode_password(password)
    except ValueError:
        return False

    try:
        return bcrypt.checkpw(pwd_bytes, password_hash.encode("utf-8"))
    except Exception:
        # If the stored hash is malformed, treat as non-match
        return False
