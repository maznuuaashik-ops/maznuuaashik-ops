/*
# Admin Panel Schema: User Bans, Announcements, AI Settings

## Overview
Adds the database infrastructure required for the YORNAM admin panel.

## Changes to existing tables
### profiles
- `banned` (boolean, default false) — whether the user is banned from the platform
- `banned_at` (timestamptz, nullable) — when the ban was applied
- `banned_reason` (text, nullable) — admin-provided reason for the ban

## New Tables
### announcements
- Platform-wide announcements managed by admins.
- `id` (uuid, PK)
- `title` (text, not null)
- `content` (text, not null)
- `type` (text: 'info' | 'warning' | 'success' | 'maintenance', default 'info')
- `active` (boolean, default true)
- `created_by` (uuid, FK to auth.users)
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

### ai_settings
- AI prompt and model configuration managed by admins.
- `id` (uuid, PK)
- `key` (text, unique, not null) — setting key (e.g. 'analysis_prompt', 'model_version')
- `value` (text, not null) — setting value
- `description` (text, nullable)
- `updated_by` (uuid, FK to auth.users)
- `updated_at` (timestamptz, default now())

## Security
- RLS enabled on all new tables.
- profiles: admins can read all profiles and update ban status; users can read their own profile.
- announcements: anyone (anon + authenticated) can read active announcements; only admins can insert/update/delete.
- ai_settings: only admins can read and update settings.
*/

-- ─── Add ban columns to profiles ───
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banned boolean NOT NULL DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banned_at timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banned_reason text;

-- ─── Create announcements table ───
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  type text NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'maintenance')),
  active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements (active, created_at DESC);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Anyone can read active announcements
DROP POLICY IF EXISTS "read_announcements" ON announcements;
CREATE POLICY "read_announcements" ON announcements FOR SELECT
  TO anon, authenticated USING (true);

-- Only admins can insert announcements
DROP POLICY IF EXISTS "admin_insert_announcements" ON announcements;
CREATE POLICY "admin_insert_announcements" ON announcements FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Only admins can update announcements
DROP POLICY IF EXISTS "admin_update_announcements" ON announcements;
CREATE POLICY "admin_update_announcements" ON announcements FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Only admins can delete announcements
DROP POLICY IF EXISTS "admin_delete_announcements" ON announcements;
CREATE POLICY "admin_delete_announcements" ON announcements FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- ─── Create ai_settings table ───
CREATE TABLE IF NOT EXISTS ai_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  description text,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can read AI settings
DROP POLICY IF EXISTS "admin_read_ai_settings" ON ai_settings;
CREATE POLICY "admin_read_ai_settings" ON ai_settings FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Only admins can insert AI settings
DROP POLICY IF EXISTS "admin_insert_ai_settings" ON ai_settings;
CREATE POLICY "admin_insert_ai_settings" ON ai_settings FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Only admins can update AI settings
DROP POLICY IF EXISTS "admin_update_ai_settings" ON ai_settings;
CREATE POLICY "admin_update_ai_settings" ON ai_settings FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Only admins can delete AI settings
DROP POLICY IF EXISTS "admin_delete_ai_settings" ON ai_settings;
CREATE POLICY "admin_delete_ai_settings" ON ai_settings FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- ─── Update profiles RLS: allow admins to read all profiles ───
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
DROP POLICY IF EXISTS "select_profiles" ON profiles;

CREATE POLICY "select_profiles" ON profiles FOR SELECT
  TO authenticated USING (
    auth.uid() = id
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Allow admins to update any profile (for banning)
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
DROP POLICY IF EXISTS "update_profiles" ON profiles;

CREATE POLICY "update_profiles" ON profiles FOR UPDATE
  TO authenticated USING (
    auth.uid() = id
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  ) WITH CHECK (
    auth.uid() = id
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ─── Seed default AI settings ───
INSERT INTO ai_settings (key, value, description) VALUES
  ('analysis_prompt', 'Analyze this Instagram reel for viral potential. Evaluate hook strength, caption quality, visual quality, audio sync, and trend alignment.', 'Main AI analysis prompt template'),
  ('model_version', 'neural-v4', 'AI model version identifier'),
  ('confidence_threshold', '0.85', 'Minimum confidence threshold for predictions'),
  ('max_daily_analyses', '50', 'Maximum analyses per user per day')
ON CONFLICT (key) DO NOTHING;
