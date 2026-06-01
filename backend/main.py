import jwt
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

# Import local files
from auth import (
    ALGORITHM,
    SECRET_KEY,
    create_access_token,
    get_password_hash,
    verify_password,
)
from database import Base, engine, get_db
from models import Exercise, ExerciseLog, Profile
from models import Session as WorkoutSession
from schemas import (
    SessionCreate,
    SessionResponse,
    Token,
    UserCreate,
    UserLogin,
    UserResponse,
)

Base.metadata.create_all(bind=engine)

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


# The VIP Door Checker
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    # Try to decode the token
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Token expired or invalid")

    user = db.query(Profile).filter(Profile.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")

    return user


# The Protected Route
@app.get("/users/me", response_model=UserResponse)
def get_user_profile(current_user: Profile = Depends(get_current_user)):
    # If the user makes it past the get_current_user dependency, they are golden.
    return current_user


# Workout Routes
@app.post(
    "/workouts", response_model=SessionResponse, status_code=status.HTTP_201_CREATED
)
def log_workout(
    session_data: SessionCreate,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    # Create the main Workout record
    new_session = WorkoutSession(
        id=current_user.id,
        focus=session_data.focus,
        notes=session_data.notes,
    )

    # Save the workout to the db first so PostgreSQL genereates an ID for it
    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    # Loop through the incoming exercises and link them to the new workout
    if session_data.logs:
        for log in session_data.logs:
            # Check if a brand new exercise, add it to the dictionary
            existing_exercise = (
                db.query(Exercise).filter(Exercise.name.ilike(log.name)).first()
            )

            # If it is a brand new exercise, add it to the dictionary
            if not existing_exercise:
                is_cardio = (
                    True if (log.distance_miles or log.duration_seconds) else False
                )
                existing_exercise = Exercise(name=log.name, is_cardio=is_cardio)
                db.add(existing_exercise)
                db.commit()
                db.refresh(existing_exercise)

            # Create the actual log linking the session and the exercise
            new_log = ExerciseLog(
                session_id=new_session.id,
                exercise_id=existing_exercise.id,
                set_number=log.set_number,
                reps=log.reps,
                weight_lbs=log.weight_lbs,
                distance_miles=log.distance_miles,
                duration_seconds=log.duration_seconds,
            )
            db.add(new_log)

        # Save all the newly created exercises
        db.commit()
        db.refresh(
            new_session
        )  # Refresh the workout so it grabs the attached exercises

    return new_session
