from auth import get_password_hash

# Import local files
from database import get_db
from fastapi import Depends, FastAPI, HTTPException, status
from models import Profile
from schemas import UserCreate, UserResponse
from sqlalchemy.orm import Session

app = FastAPI()


@app.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check if username or email exists
    existing_user = (
        db.query(Profile)
        .filter((Profile.username == user.username) | (Profile.email == user.email))
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered",
        )

    # Hash the plaintext password
    hashed_password = get_password_hash(user.password)

    # Create the SQLAlchemy user object
    new_user = Profile(
        username=user.username, email=user.email, passowrd_hass=hashed_password
    )

    # Save to the DB
    db.add(new_user)
    db.commit()
    db.refresh(new_user)  # This grabs the newly generated UUID and created_at timestamp

    return new_user
