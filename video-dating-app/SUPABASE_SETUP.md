# Supabase Setup Guide for VideoConnect

## 🚀 Quick Start (5 Minutes)

### Step 1: Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email
4. **It's FREE** - no credit card required

### Step 2: Create New Project
1. Click "New Project"
2. Fill in details:
   - **Name:** `videoconnect` or any name you prefer
   - **Database Password:** Create a strong password (save it!)
   - **Region:** Choose closest to your users
   - **Pricing Plan:** Free (stays selected)
3. Click "Create new project"
4. **Wait 2-3 minutes** for database to set up

### Step 3: Get API Keys
1. In your project dashboard, click **Settings** (gear icon) in sidebar
2. Click **API** under Project Settings
3. Copy these values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)

### Step 4: Add Keys to Your App
1. In your video-dating-app folder, create `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and paste your keys:
   ```env
   VITE_SUPABASE_URL=https://YOUR_PROJECT_URL.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

3. **Restart your dev server:**
   ```bash
   npm run dev
   ```

---

## 📊 Database Schema Setup

### Step 5: Create Tables

Go to **SQL Editor** in Supabase dashboard and run this script:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  age INTEGER,
  bio TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_video_url TEXT,
  daily_matches_viewed INTEGER DEFAULT 0,
  last_match_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Videos table
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  prompt_category TEXT NOT NULL,
  duration_seconds INTEGER,
  file_size_bytes BIGINT,
  order_index INTEGER NOT NULL,
  personality_tags TEXT[], -- Array of personality traits
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matches table
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES users(id) ON DELETE CASCADE,
  matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  compatibility_score INTEGER, -- 0-100
  UNIQUE(user1_id, user2_id)
);

-- Likes table (for matching logic)
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(from_user_id, to_user_id)
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_videos_user_id ON videos(user_id);
CREATE INDEX idx_matches_users ON matches(user1_id, user2_id);
CREATE INDEX idx_likes_users ON likes(from_user_id, to_user_id);
CREATE INDEX idx_messages_match ON messages(match_id);
```

### Step 6: Set Up Row Level Security (RLS)

**Important:** This prevents users from accessing each other's private data.

Run this in SQL Editor:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Users can view their own videos
CREATE POLICY "Users can view own videos"
ON videos FOR SELECT
USING (auth.uid() = user_id);

-- Users can view videos of people they match with
CREATE POLICY "Users can view matched videos"
ON videos FOR SELECT
USING (
  user_id IN (
    SELECT user1_id FROM matches WHERE user2_id = auth.uid() AND is_active = TRUE
    UNION
    SELECT user2_id FROM matches WHERE user1_id = auth.uid() AND is_active = TRUE
  )
);

-- Users can insert their own videos
CREATE POLICY "Users can insert own videos"
ON videos FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their matches
CREATE POLICY "Users can view own matches"
ON matches FOR SELECT
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Users can create likes
CREATE POLICY "Users can create likes"
ON likes FOR INSERT
WITH CHECK (auth.uid() = from_user_id);

-- Users can view messages in their matches
CREATE POLICY "Users can view match messages"
ON messages FOR SELECT
USING (
  match_id IN (
    SELECT id FROM matches WHERE user1_id = auth.uid() OR user2_id = auth.uid()
  )
);

-- Users can send messages in their matches
CREATE POLICY "Users can send messages"
ON messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);
```

---

## 📁 Storage Setup for Videos

### Step 7: Create Storage Bucket

1. In Supabase dashboard, go to **Storage** in sidebar
2. Click "Create a new bucket"
3. Name it: `videos`
4. **Make it PUBLIC** (so videos can be played)
5. Click "Create bucket"

### Step 8: Set Storage Policies

Go to **Storage** → **Policies** → **videos bucket** → "New Policy":

```sql
-- Allow authenticated users to upload videos
CREATE POLICY "Users can upload videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'videos' AND
  auth.role() = 'authenticated'
);

-- Allow public read access to videos
CREATE POLICY "Public can view videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

-- Users can update their own videos
CREATE POLICY "Users can update own videos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'videos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own videos
CREATE POLICY "Users can delete own videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'videos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## 🔐 Authentication Setup

### Step 9: Configure Auth Settings

1. Go to **Authentication** → **Settings** in sidebar
2. Under **Auth Providers**, enable:
   - ✅ Email (already enabled)
   - ✅ Google (optional - for "Sign in with Google")
   - ✅ GitHub (optional)

3. **Email Templates** (optional customization):
   - Go to **Email Templates**
   - Customize confirmation email with your branding

---

## ✅ Testing Your Setup

### Step 10: Verify Everything Works

Run this test in SQL Editor:

```sql
-- Check if tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- Should return: users, videos, matches, likes, messages
```

### Step 11: Test in Your App

1. Restart your dev server
2. Open browser console (F12)
3. You should NOT see any Supabase errors
4. Try creating a profile - videos should save

---

## 🎯 Free Tier Limits

Your Supabase free tier includes:
- ✅ 500MB database storage
- ✅ 1GB file storage (for videos)
- ✅ 2GB bandwidth/month
- ✅ 50,000 monthly active users
- ✅ Unlimited API requests

**Realistically supports:** ~100-200 active users before needing upgrade

---

## 🚨 Troubleshooting

### "Invalid API key" error
- Check `.env` file has correct keys
- Restart dev server after changing `.env`
- Make sure no quotes around values in `.env`

### "Row Level Security" errors
- Make sure you ran all RLS policies in Step 6
- Check user is authenticated before accessing data

### Videos not uploading
- Verify storage bucket is created and public
- Check storage policies are set correctly
- Ensure file size < 50MB (free tier limit)

### Can't see other users' profiles
- This is expected! RLS blocks unauthorized access
- Profiles only visible after matching

---

## 📚 Next Steps

After Supabase is set up:

1. **Implement Authentication**: Add sign-up/login flow
2. **Video Upload**: Connect VideoRecorder to Supabase Storage
3. **Matching Logic**: Create daily match algorithm
4. **Real-time**: Add subscriptions for live messaging

See `IMPLEMENTATION.md` for detailed code examples!

---

## 💰 When to Upgrade?

Upgrade to **Pro ($25/month)** when you hit:
- 100+ daily active users
- 1GB storage used (about 200 video profiles)
- 2GB bandwidth/month exceeded

**Pro tier includes:**
- 8GB database
- 100GB file storage
- 250GB bandwidth/month
- Better performance

---

**Setup complete!** 🎉 Your Supabase backend is ready to power VideoConnect.
