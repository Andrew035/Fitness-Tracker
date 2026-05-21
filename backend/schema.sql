-- Enable the UUID extension first!
create extension if not exists "uuid-ossp";

-- Enforce Data Integrity
create type workout_focus as enum (
    'upper_body',
    'lower_body',
    'full_body',
    'running_cardio',
    'mixed'
);

-- User Profiles
create table profiles (
    id uuid primary key default uuid_generate_v4(),
    username varchar(50) unique not null,
    email varchar(255) unique not null,
    password_hash varchar(255) not null,
    created_at timestamp with time zone default now()
);

-- Core Sessions
create table sessions (
    id uuid primary key default uuid_generate_v4(),
    profile_id uuid references profiles(id) on delete cascade,
    focus workout_focus not null,
    start_time timestamp with time zone default now(),
    end_time timestamp with time zone,
    notes text
);

-- Exercises
create table exercises (
    id uuid primary key default uuid_generate_v4(),
    name varchar(100) not null,
    is_cardio boolean default false
);

-- The Logs
create table exercise_logs (
    id uuid primary key default uuid_generate_v4(),
    session_id uuid references sessions(id) on delete cascade,
    exercise_id uuid references exercises(id),

    -- Strength
    set_number int,
    weight_lbs decimal(5,2),
    reps int,

    -- Cardio
    distance_miles decimal(5,2),
    duration_seconds int,

    created_at timestamp with time zone default now(),

    -- Ensure valid data
    constraint valid_log check (
        (weight_lbs is not null and reps is not null) or
        (distance_miles is not null or duration_seconds is not null)
    )
);
