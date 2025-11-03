# Firecrawl API Key Setup

## What is Firecrawl?
Firecrawl is a professional web scraping service that the Help Desk agent will use to research new tools, check GitHub releases, and monitor AI innovations.

---

## Setup Instructions (5 minutes)

### Step 1: Sign Up for Free Account
1. Go to: https://firecrawl.dev
2. Click "Sign Up" or "Get Started"
3. Create account (GitHub login recommended)
4. Free tier includes: **500 requests/month** (~16/day)

### Step 2: Get Your API Key
1. Log into Firecrawl dashboard
2. Go to "API Keys" or "Settings"
3. Copy your API key (starts with `fc-`)

### Step 3: Add API Key to Claude Config
```bash
# Option A: Using nano editor
nano ~/.claude.json

# Option B: Using code editor
code ~/.claude.json
```

### Step 4: Find Firecrawl Section
Search for: `"@mendable/firecrawl-mcp-server"`

You'll see:
```json
{
  "type": "stdio",
  "command": "npx",
  "args": [
    "@mendable/firecrawl-mcp-server"
  ],
  "env": {}
}
```

### Step 5: Add Your API Key
Change the empty `"env": {}` to:
```json
{
  "type": "stdio",
  "command": "npx",
  "args": [
    "@mendable/firecrawl-mcp-server"
  ],
  "env": {
    "FIRECRAWL_API_KEY": "fc-YOUR_API_KEY_HERE"
  }
}
```

**Replace `fc-YOUR_API_KEY_HERE` with your actual API key!**

### Step 6: Save and Restart
- Save the file
- Restart Claude Code
- Firecrawl tools will now be available

---

## Verify Installation

After restart, check available tools:
```bash
/mcp
```

You should see:
- `mcp__firecrawl__scrape` - Scrape a single URL
- `mcp__firecrawl__crawl` - Crawl multiple pages
- `mcp__firecrawl__map` - Get sitemap
- `mcp__firecrawl__search` - Search the web

---

## Usage Limits

**Free Tier:**
- 500 requests/month
- ~16 requests/day
- Perfect for daily Help Desk research

**If you need more:**
- Paid plan: $20/month for 5,000 requests
- Only upgrade if needed (unlikely)

---

## What Happens Without API Key?

Without the API key, Firecrawl tools won't work. The Help Desk agent will:
- ❌ Cannot scrape GitHub releases
- ❌ Cannot search for new AI tools
- ❌ Cannot crawl documentation sites

**Solution:** Add the API key following steps above.

---

## Security Note

The API key is stored locally in `~/.claude.json` on your machine only. It's not uploaded anywhere except when making Firecrawl API requests.

---

**Status:** Firecrawl MCP Server is installed ✅
**Next Step:** Add API key following steps above, then restart Claude Code.
