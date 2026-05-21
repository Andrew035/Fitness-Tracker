"""
This is where we translate the SQL schema into Python classes.
"""

import uuid

from database import Base
from sqlalchemy import Column, DateTime, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func


class Profile(Base):
    # This must match the exact table name from schema.sql
    __tablename__ = "profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)

    # func.now() tells the database to automatically set the current time
    created_at = Column(DateTime(timezone=True), server_default=func.now())
