-- Make preferred_time nullable for solo session requests
-- Children can no longer request a specific time; admin will set scheduled_time

ALTER TABLE solo_session_requests 
  ALTER COLUMN preferred_time DROP NOT NULL;




