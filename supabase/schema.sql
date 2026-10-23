-- ========================================================
-- Waste to Resource (W2R) - Supabase Database Schema
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/gklvxmakdeossulitiim/sql
-- ========================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. LISTINGS TABLE
CREATE TABLE IF NOT EXISTS public.listings (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  locality TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'awaiting_recycler',
  materials JSONB NOT NULL DEFAULT '[]'::jsonb,
  estimated_value_min NUMERIC DEFAULT 0,
  estimated_value_max NUMERIC DEFAULT 0,
  photo_url TEXT,
  pickup_preference TEXT DEFAULT 'pickup',
  preferred_pickup_window TEXT,
  scheduled_pickup_date TEXT,
  collected_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  recycler_id TEXT,
  recycler_name TEXT,
  recycler_notes TEXT,
  contamination_notes TEXT,
  notes TEXT,
  verified_weight_kg NUMERIC,
  rejected_weight_kg NUMERIC,
  final_indicative_value NUMERIC,
  reward_points_earned NUMERIC,
  recovery_outcome TEXT,
  status_timeline JSONB DEFAULT '[]'::jsonb
);

-- 2. MATERIALS TABLE
CREATE TABLE IF NOT EXISTS public.materials (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  unit TEXT DEFAULT 'kg',
  rate_per_kg_min NUMERIC NOT NULL,
  rate_per_kg_max NUMERIC NOT NULL,
  emission_factor_per_kg NUMERIC NOT NULL,
  landfill_diversion_ratio NUMERIC NOT NULL,
  recovery_routes JSONB DEFAULT '[]'::jsonb,
  contamination_rules TEXT,
  active BOOLEAN DEFAULT true,
  color TEXT,
  bg_color TEXT,
  icon_name TEXT,
  minimum_quantity_kg NUMERIC DEFAULT 1
);

-- 3. RECYCLERS TABLE
CREATE TABLE IF NOT EXISTS public.recyclers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  rating NUMERIC DEFAULT 4.5,
  reviews_count INT DEFAULT 0,
  accepted_material_ids JSONB DEFAULT '[]'::jsonb,
  service_area TEXT,
  distance_km NUMERIC,
  min_quantity_kg NUMERIC DEFAULT 5,
  indicative_pricing_note TEXT,
  next_pickup_slot TEXT,
  available_windows JSONB DEFAULT '[]'::jsonb,
  active BOOLEAN DEFAULT true,
  facility_type TEXT,
  verified_recovery_count INT DEFAULT 0
);

-- 4. REWARD TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.reward_transactions (
  id TEXT PRIMARY KEY,
  customer_id TEXT,
  points INT NOT NULL,
  type TEXT,
  description TEXT NOT NULL,
  listing_id TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PROFILES / USERS TABLE (Stores all registered and logged in users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_sign_in_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enables anonymous / public read & write for prototype
-- ========================================================

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recyclers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow public access for all operations (ideal for hackathon demo with anon key)
DROP POLICY IF EXISTS "Public full access listings" ON public.listings;
CREATE POLICY "Public full access listings" ON public.listings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access materials" ON public.materials;
CREATE POLICY "Public full access materials" ON public.materials FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access recyclers" ON public.recyclers;
CREATE POLICY "Public full access recyclers" ON public.recyclers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access reward_transactions" ON public.reward_transactions;
CREATE POLICY "Public full access reward_transactions" ON public.reward_transactions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access profiles" ON public.profiles;
CREATE POLICY "Public full access profiles" ON public.profiles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Enable Realtime for listings and profiles tables safely (prevents duplicate error)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.listings;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
END $$;

-- Auto-sync from auth.users to public.profiles on new signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, created_at, last_sign_in_at)
  VALUES (
    new.id::text,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'customer'),
    NOW(),
    NOW()
  )
  ON CONFLICT (email) DO UPDATE SET
    id = EXCLUDED.id,
    last_sign_in_at = NOW(),
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    role = COALESCE(EXCLUDED.role, public.profiles.role);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
