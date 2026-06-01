"""
Uses Pydantic to enforce rules on the data coming in from the frontend, and also shapes the data
we send back out.
"""

import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel

from models import WorkoutFocus


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


# Exercise Schemas
class ExerciseLogCreate(BaseModel):
    name: str
    set_number: Optional[int] = None
    reps: Optional[int] = None
    weight_lbs: Optional[float] = None
    distance_miles: Optional[float] = None
    duration_seconds: Optional[float] = None


class ExerciseLogResponse(ExerciseLogCreate):
    id: uuid.UUID
    exercise_id: uuid.UUID

    class Config:
        from_attributes = True


# Workout Schemas
class SessionCreate(BaseModel):
    focus: str
    notes: Optional[str] = None
    # A workout can receive a list of exercises all at once
    logs: List[ExerciseLogCreate] = []


class SessionResponse(BaseModel):
    id: uuid.UUID
    profile_id: uuid.UUID
    focus: WorkoutFocus
    start_time: datetime
    end_time: Optional[str] = None
    notes: Optional[str] = None
    logs: List[ExerciseLogResponse] = []

    class Config:
        from_attributes = True
