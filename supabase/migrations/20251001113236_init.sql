CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    child_first_name VARCHAR(255) NOT NULL,
    child_last_name VARCHAR(255) NOT NULL,
    child_birthday DATE NOT NULL,
    child_gender VARCHAR(255) NOT NULL,
    child_profile_picture VARCHAR(255),
    parent_first_name VARCHAR(255),
    parent_last_name VARCHAR(255),
    parent_phone VARCHAR(255),
    parent_nationality VARCHAR(255),
    initial_quiz_score INT NOT NULL DEFAULT 0,
    auth_id UUID REFERENCES auth.users(id) NOT NULL
);


CREATE TABLE quizzes (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    type VARCHAR(255) NOT NULL, -- INITIAL, FOLLOW_UP
    name VARCHAR(255)
);

CREATE TABLE quiz_questions (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    quiz_id INT REFERENCES quizzes(id) NOT NULL,
    question TEXT NOT NULL,
    category VARCHAR(255) NOT NULL
);
