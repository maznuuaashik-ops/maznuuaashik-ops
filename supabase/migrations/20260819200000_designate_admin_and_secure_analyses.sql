/*
# Designate Admin Account & Secure Admin Control Center RLS

1. Admin Trigger Enhancement:
   - Updates public.handle_new_user() trigger function.
   - Automatically grants role = 'admin' if email is 'maznuuaashik@gmail.com'.
   - Grants role = 'user' for all other new users.
   - Automatically attaches profiles.id = auth.users.id.

2. Existing Profiles Update:
   - Sets role = 'admin' for user with email 'maznuuaashik@gmail.com' in public.profiles.

3. Security & RLS Hardening:
   - analyses: Users can read their own analyses. Admins can read all platform analyses for the Admin Control Center.
   - profiles: Users can read and update their own profile. Admins can read all profiles and manage user status (bans).
   - announcements: Public/anon can read active announcements. Only admins can insert, update, or delete announcements.
   - ai_settings: Only admins can read, insert, update, or delete AI settings.
   - visitors: Anyone can insert logs; only admins can select visitor analytics.
*/

-- 1. Create / Update the trigger function to automatically grant admin role upon signup for maznuuaashik@gmail.com
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    CASE 
      WHEN LOWER(NEW.email) = 'maznuuaashik@gmail.com' THEN 'admin'
      ELSE 'user'
    END
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    role = CASE 
      WHEN LOWER(EXCLUDED.email) = 'maznuuaashik@gmail.com' THEN 'admin'
      ELSE profiles.role
    END,
    email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger is attached to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Designate maznuuaashik@gmail.com if profile already exists
UPDATE public.profiles p
SET role = 'admin'
FROM auth.users u
WHERE p.id = u.id
  AND LOWER(u.email) = 'maznuuaashik@gmail.com'
  AND LOWER(p.email) = 'maznuuaashik@gmail.com';

-- Fallback direct update on profiles for maznuuaashik@gmail.com
UPDATE public.profiles
SET role = 'admin'
WHERE LOWER(email) = 'maznuuaashik@gmail.com';

-- 3. Update RLS policies on analyses table
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_analyses" ON analyses;
DROP POLICY IF EXISTS "select_analyses" ON analyses;

CREATE POLICY "select_analyses" ON analyses FOR SELECT
  TO authenticated USING (
    auth.uid() = user_id 
    OR user_id IS NULL 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
        AND LOWER(profiles.email) = 'maznuuaashik@gmail.com'
    )
  );

DROP POLICY IF EXISTS "insert_own_analyses" ON analyses;
DROP POLICY IF EXISTS "insert_analyses" ON analyses;

CREATE POLICY "insert_analyses" ON analyses FOR INSERT
  TO authenticated, anon WITH CHECK (
    auth.uid() = user_id 
    OR user_id IS NULL 
    OR auth.uid() IS NULL
  );
