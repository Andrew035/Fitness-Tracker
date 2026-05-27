from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

# Import local files
from auth import create_access_token, get_password_hash, verify_password
from database import get_db
from models import Profile
from schemas import Token, UserCreate, UserLogin, UserResponse

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Trust the React dev server
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)


def health_check():
    return {"status": "ok", "message": "The kitchen is open!"}


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
        username=user.username, email=user.email, password_hash=hashed_password
    )

    # Save to the DB
    db.add(new_user)
    db.commit()
    db.refresh(new_user)  # This grabs the newly generated UUID and created_at timestamp

    return new_user


@app.post("/login", response_model=Token)
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    # Look for the user in the db by email
    db_user = db.query(Profile).filter(Profile.email == user.email).first()

    # If the user doesn't exist, OR the password hash doesn't match, reject them
    if not db_user or not verify_password(user.password, db_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password"
        )

    # If they pass, create the JWT token
    # Stores their user ID inside the token so we know who they are on future requests
    access_token = create_access_token(data={"sub": str(db_user.id)})

    return {"access_token": access_token, "token_type": "bearer"}
