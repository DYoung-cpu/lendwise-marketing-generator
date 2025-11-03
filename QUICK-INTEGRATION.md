# 🚀 Quick Integration Guide
## Get Your System Running in 10 Minutes

---

## ✅ What You Already Have
- Gemini API Key ✓
- Anthropic API Key ✓
- Firecrawl API Key ✓

---

## 🔴 What You Need (Critical)

### 1. REPLICATE API TOKEN (5 minutes)

**Step-by-step:**

1. Go to: https://replicate.com
2. Click "Sign up" (or "Log in" if you have an account)
3. Sign up with GitHub or email
4. After login, click your profile picture (top right)
5. Click "API tokens"
6. Click "Create token"
7. Copy the token (starts with `r8_`)
8. **SAVE THIS TOKEN - You'll paste it in .env**

**What it enables:**
- imagen-3 (best for NMLS text)
- flux-1.1-pro (photorealistic)
- flux-schnell (4x faster)
- Video generation
- LoRA training
- 15+ models total

---

### 2. SUPABASE (10 minutes)

**Step-by-step:**

1. Go to: https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub (easiest)
4. Click "New project"
5. Fill in:
   - **Name:** mortgage-ai-system
   - **Database Password:** (generate strong password - SAVE THIS!)
   - **Region:** Choose closest to you
   - **Pricing Plan:** Free tier is fine
6. Click "Create new project"
7. Wait 2-3 minutes for database to provision (you'll see progress)
8. Once ready, click "Project Settings" (gear icon, bottom left)
9. Click "API" in sidebar
10. Copy these TWO values:
    - **Project URL** (looks like: https://abcdefgh.supabase.co)
    - **anon public** key (long string under "Project API keys")
11. **SAVE THESE - You'll paste in .env**

**What it enables:**
- Perpetual memory (never forgets)
- Learning patterns storage
- Quality metrics tracking
- Historical data

---

## 🟢 Optional But Recommended

### 3. REDIS (2 minutes)

**Option A: Docker (easiest)**
```bash
docker run -d --name redis-mortgage-ai -p 6379:6379 redis:latest
```

**Option B: WSL/Ubuntu**
```bash
sudo apt-get update
sudo apt-get install redis-server
sudo service redis-server start
```

**What it enables:**
- 10x faster cache retrieval
- Semantic caching
- Reduced API costs

---

## 📝 UPDATE YOUR .ENV

Open your `.env` file in:
```
/mnt/c/Users/dyoun/Active Projects/.env
```

Add these lines:

```bash
# === NEW: REPLICATE (Critical) ===
REPLICATE_API_TOKEN=r8_paste_your_token_here
REPLICATE_USERNAME=your_replicate_username

# === NEW: SUPABASE (Critical) ===
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=paste_your_anon_key_here

# === NEW: REDIS (Optional) ===
REDIS_HOST=localhost
REDIS_PORT=6379

# === EXISTING (Keep these) ===
GEMINI_API_KEY=your_existing_key
ANTHROPIC_API_KEY=your_existing_key
# ... rest of your existing keys
```

**Save the file!**

---

## 🗄️ SETUP SUPABASE DATABASE

1. Go to your Supabase project dashboard
2. Click "SQL Editor" in left sidebar
3. Click "New query"
4. Open the file: `/mnt/c/Users/dyoun/Active Projects/database-schema.sql`
5. Copy EVERYTHING in that file
6. Paste into Supabase SQL Editor
7. Click "Run" (or press Ctrl+Enter)
8. You should see: "Database schema created successfully!"
9. Click "Table Editor" to verify tables were created

---

## ✅ VERIFY INTEGRATION

Run this:
```bash
cd "/mnt/c/Users/dyoun/Active Projects"
node check-requirements.js
```

You should see:
```
✅ Working: 5 services
   • Gemini
   • Anthropic
   • Firecrawl
   • Replicate
   • Supabase
```

---

## 🧪 TEST THE COMPLETE SYSTEM

Once check-requirements passes, run:
```bash
node test-system.js
```

Should see:
```
✅ ALL TESTS PASSED! System is ready to use.
```

---

## 🎯 REPLY TO THIS MESSAGE WITH:

1. "I got my Replicate token" - and I'll help you add it
2. "Supabase is set up" - and I'll verify the database
3. "Redis is running" - and I'll test caching
4. "All done, let's test!" - and I'll run full validation

**Let's get you integrated! Which service should we tackle first?**
