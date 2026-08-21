/*
# Visitor Tracking Table

## Overview
Creates a table to track unique visitors and page views for admin analytics.

## New Tables
### visitors
- `id` (uuid, PK)
- `visitor_id` (text, not null) — anonymous browser fingerprint hash for unique counting
- `page` (text, nullable) — which page was visited
- `user_id` (uuid, nullable, FK to auth.users) — if the visitor is logged in
- `created_at` (timestamptz, default now())
- `session_date` (date, not null, default current_date) — for daily aggregation

## Security
- RLS enabled.
- Anyone (anon + authenticated) can INSERT their own visit (for tracking).
- Only admins can SELECT visitor data.
- No update or delete policies needed.
*/

CREATE TABLE IF NOT EXISTS visitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text NOT NULL,
  page text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  session_date date NOT NULL DEFAULT current_date
);

CREATE INDEX IF NOT EXISTS idx_visitors_visitor_id ON visitors (visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitors_session_date ON visitors (session_date DESC);
CREATE INDEX IF NOT EXISTS idx_visitors_created_at ON visitors (created_at DESC);

ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a visit record (for tracking)
DROP POLICY IF EXISTS "insert_visitors" ON visitors;
CREATE POLICY "insert_visitors" ON visitors FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Only admins can read visitor data
DROP POLICY IF EXISTS "admin_read_visitors" ON visitors;
CREATE POLICY "admin_read_visitors" ON visitors FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );
