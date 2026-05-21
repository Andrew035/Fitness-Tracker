"""
Handles hashing passwords and returning JWT tokens.
"""

from datetime import datetime, timedelta, timezone

import jwt
from passlib.context import CryptContext

SECRET_KEY = "supersecretpassword123"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Initialize the bcrypt hasher
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- 3 Core Security Functions ---


# Hashing (Used when a user REGISTERS)
def get_password_hash(password: str) -> str:
    """Takes a plain text password and returns a scrambled bcrypt hash."""
    return pwd_context.hash(password)


# Verifying (Used when a user LOGS IN)
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Checks if the plain text password matches the scrambled hash in the db."""
    return pwd_context.verify(plain_password, hashed_password)


# VIP Wristbands (Used when a user successfully LOGS IN)
def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Generates a JSON Web Token (JWT) that acts as the user's temporary ID card."""
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)

    to_encode.update({"exp": expire})

    # This phsyically signs the token with SECRET_KEY so users can't forge one
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt
