CREATE TABLE owners (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE
);

CREATE TABLE sessions (
  token TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  email TEXT NOT NULL
);

CREATE TABLE surveys (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  branding TEXT,
  questions TEXT,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE responses (
  id TEXT PRIMARY KEY,
  survey_id TEXT NOT NULL,
  answers TEXT,
  submitted_at TEXT
);