"""
This file acts as the bridge between Python and PostgreSQL. It uses DATABSE_URL we set in our
Docker compose file.
"""

import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Fetch the database URL from the environment (set in docker-compose.yml
# If it can't find it, it defaults to a local string just in case)
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://fitness_user:2673@db:5432/fitness_db"
)

# The engine is the actual connection to PostgreSQL
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# A session is an ongoing conversation with the db
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# This is the base class that all database models will inherit from
Base = declarative_base()


# Using this function for FastAPI routes to open and close DB connections
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
