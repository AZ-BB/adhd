alter table users
  add column if not exists inattention_score int,
  add column if not exists hyperactivity_score int,
  add column if not exists impulsivity_score int
