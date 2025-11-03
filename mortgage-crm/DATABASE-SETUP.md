# Database Setup Instructions

## If you're getting "already exists" errors, use the clean schema!

### Steps to fix:

1. **Go to Supabase Dashboard**
   - Open: https://supabase.com/dashboard/project/bpobvnmzhaeqxflcedsm

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Paste the Clean Schema**
   - Open `database/schema-clean.sql` (NOT schema.sql)
   - Copy ALL the contents
   - Paste into the SQL Editor

4. **Run the Schema**
   - Click "Run" button (or press Ctrl+Enter)
   - Wait for it to complete (about 10 seconds)
   - Should see "Success" message at the bottom

5. **Verify It Worked**
   ```bash
   node scripts/test-supabase.js
   ```

You should see:
```
✅ model_performance: exists (0 rows)
✅ generation_history: exists (0 rows)
✅ Insert successful
```

---

## Alternative: Manual Table Creation

If the full schema fails, create just the essential tables:

```sql
-- Essential tables only
CREATE TABLE model_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id TEXT NOT NULL UNIQUE,
  total_uses INTEGER DEFAULT 0,
  successful_uses INTEGER DEFAULT 0,
  average_quality DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE generation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  intent_type TEXT NOT NULL,
  model TEXT NOT NULL,
  success BOOLEAN NOT NULL,
  quality DECIMAL(3,2),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

Then run the test again.
