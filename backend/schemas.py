"""
Uses Pydantic to enforce rules on the data coming in from the frontend, and also shapes the data
we send back out.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel


# The data we EXPECT from the user when they sign up
class UserCreate(BaseModel):
    username: str
    email: str
    password: str


# The data we RETURN to the user after successful signup
class UserResponse(BaseModel):
    id: uuid.UUID
    username: str
    email: str
    created_at: datetime

    # This tells Pydantic to read data even if it's not a standard dictionary
    class Config:
        from_attributes = True


# The data we EXPECT when a user logs in
class UserLogin(BaseModel):
    email: str
    password: str


# The VIP wristband we RETURN after a successful login
class Token(BaseModel):
    access_token: str
    token_type: str
