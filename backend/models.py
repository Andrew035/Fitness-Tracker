"""
This is where we translate the SQL schema into Python classes.
"""

import enum
import uuid

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class WorkoutFocus(enum.Enum):
    upper_body = "upper_body"
    lower_body = "lower_body"
    full_body = "fullbody"
    running_cardio = "running_cardio"
    mixed = "mixed"


class Profile(Base):
    # This must match the exact table name from schema.sql
    __tablename__ = "profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)

    # func.now() tells the database to automatically set the current time
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Link to the new Sesssion table
    sessions = relationship("Session", back_populates="profile", cascade="all, delete")


class Session(Base):
    __tablename__ = "sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profile_id = Column(
        UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE")
    )

    # Map the Ptyhon Enum to the PostgreSQL Enum
    focus = Column(Enum(WorkoutFocus, name="workout_focus"), nullable=False)

    start_time = Column(DateTime(timezone=True), server_default=func.now())
    end_time = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)

    profile = relationship("Profile", back_populates="sessions")
    logs = relationship("ExerciseLog", back_populates="session", cascade="all, delete")


class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # e.g., "Bench Press", "Squat", or "Neighborhood 5K"
    name = Column(String, nullable=False)
    is_cardio = Column(Boolean, default=False)

    logs = relationship("ExerciseLog", back_populates="exercise")


class ExerciseLog(Base):
    # This table holds the actual workout data
    __tablename__ = "exercise_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(
        UUID(as_uuid=True), ForeignKey("sessions.id", ondelete="CASCADE")
    )
    exercise_id = Column(UUID(as_uuid=True), ForeignKey("exercises.id"))

    # Strength
    set_number = Column(Integer, nullable=True)
    weight_lbs = Column(Numeric(5, 2), nullable=True)
    reps = Column(Integer, nullable=True)

    # Cardio
    distance_miles = Column(Numeric(5, 2), nullable=True)
    duration_seconds = Column(Integer, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Enforce the same data validation logic as the SQL Check Constraint
    __table_args__ = (
        CheckConstraint(
            "(weight_lbs IS NOT NULL AND reps IS NOT NULL) OR (distance_miles IS NOT NULL OR duration_seconds IS NOT NULL)",
            name="valid_log",
        ),
    )

    session = relationship("Session", back_populates="logs")
    exercise = relationship("Exercise", back_populates="logs")
