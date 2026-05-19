CREATE TYPE workout_focus AS ENUM (
    'upper_body',
    'lower_body',
    'full_body',
    'running_cardio',
    'mixed'
);

CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    focus workout_focus NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    is_cardio BOOLEAN DEFAULT FALSE
);

-- The Flexible Logging Table
CREATE TABLE exercise_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises(id),

    -- Fields for Strength
    set_number INT,
    weight_lbs DECIMAL(5,2),
    reps INT

    -- Fields for Cardio
    distance_miles DECIMAL(5,2),
    duration_seconds INT,

    create_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure at least one type of tracking is provided
    CONSTRAINT valid_log CHECK (
        (weight_lbs IS NOT NULL AND reps IS NOT NULL) OR
        (distance_miles IS NOT NULL OR duration_seconds IS NOT NULL)
    )
);
