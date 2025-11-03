# MCP Server Implementation Plan
**Goal:** Replace custom memory/research system with official MCP servers

**Timeline:** 3 days
**Status:** Ready to execute

---

## 📋 Phase 1: Cleanup (30 minutes)

### Files to DELETE (Custom system we're scrapping):
```bash
# Custom memory system (replaced by MCP Memory Server)
wisr-ai-generator/memory-updater.js
wisr-ai-generator/validate-memory.js
wisr-ai-generator/.claude/agent-memory.json
wisr-ai-generator/.claude/session-logs/

# Custom rules system (will use MCP Memory instead)
wisr-ai-generator/.claude/rules.md

# Learning system instructions (outdated)
wisr-ai-generator/LEARNING-SYSTEM-README.md
```

### Files to KEEP:
```bash
# Agent definitions (will update to use MCP)
.claude/agents/helpdesk.md
.claude/agents/marketing-agent.md

# Slash commands (will update)
.claude/commands/helpdesk.md
.claude/commands/marketing.md

# Documentation
wisr-ai-generator/QUICK-START-GUIDE.md (update later)
wisr-ai-generator/GEMINI-NANO-RESEARCH-FINDINGS.md
wisr-ai-generator/LEARNING-SESSION-FINDINGS-2025-10-26.md
```

---

## 🚀 Phase 2: Install MCP Memory Server (1 hour)

### Step 1: Install Package
```bash
cd ~/.claude
claude mcp add memory npx @modelcontextprotocol/server-memory
```

This adds to `~/.claude.json`:
```json
{
  "mcpServers": {
    "memory": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-memory"
      ]
    }
  }
}
```

### Step 2: Verify Installation
```bash
# Restart Claude Code
# Check available tools
/mcp
```

**Expected output:** Should show memory tools:
- `create_entities` - Create entities in knowledge graph
- `create_relations` - Create relationships between entities
- `add_observations` - Add observations about entities
- `delete_observations` - Remove observations
- `delete_entities` - Remove entities
- `delete_relations` - Remove relationships
- `read_graph` - Query the knowledge graph
- `open_nodes` - Search for nodes
- `search_nodes` - Full-text search

### Step 3: Test Memory Server
```bash
# In any Claude terminal, test:
Create entity: name="David Young", entityType="Person", observations=["Founder of LendWise", "NMLS 62043", "Prefers concise communication"]

Create entity: name="LendWise", entityType="Company", observations=["Mortgage lending company", "Uses AI for marketing"]

Create relation: from="David Young", to="LendWise", relationType="owns"

Read graph to verify
```

**Success criteria:** Entities and relations are created and persisted

---

## 🌐 Phase 3: Install Firecrawl MCP Server (1 hour)

### Step 1: Get Firecrawl API Key (FREE)
1. Go to https://firecrawl.dev
2. Sign up for free account
3. Get API key from dashboard
4. Free tier: 500 requests/month

### Step 2: Install Firecrawl MCP
```bash
npm install -g @mendable/firecrawl-mcp-server

# Or use npx (no install needed):
claude mcp add firecrawl npx @mendable/firecrawl-mcp-server
```

### Step 3: Configure with API Key

Edit `~/.claude.json`:
```json
{
  "mcpServers": {
    "firecrawl": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@mendable/firecrawl-mcp-server"
      ],
      "env": {
        "FIRECRAWL_API_KEY": "fc-YOUR_API_KEY_HERE"
      }
    }
  }
}
```

### Step 4: Verify Installation
```bash
# Restart Claude Code
/mcp
```

**Expected tools:**
- `firecrawl_scrape` - Scrape a single URL
- `firecrawl_crawl` - Crawl multiple pages from a site
- `firecrawl_map` - Get sitemap of a website
- `firecrawl_search` - Search the web

### Step 5: Test Firecrawl
```bash
# Test scraping GitHub releases
Use firecrawl_scrape on: https://github.com/modelcontextprotocol/servers/releases

# Should return latest release info
```

**Success criteria:** Successfully scrapes and returns structured data

---

## 🤖 Phase 4: Update Help Desk Agent (2 hours)

### Step 1: Update Agent Definition

**File:** `.claude/agents/helpdesk.md`

**Add to top (after Mission):**
```markdown
## 🛠️ Your MCP Tools

### Memory Tools (Persistent Learning)
You have access to MCP Memory Server with knowledge graph:

**Creating Knowledge:**
- `create_entities` - Store: People, Companies, Tools, Projects, Concepts
- `create_relations` - Connect: "David owns LendWise", "Marketing Generator uses Gemini"
- `add_observations` - Learn: "David prefers short messages", "Gemini 2.5 costs $0.001/image"

**Querying Knowledge:**
- `read_graph` - View entire knowledge graph
- `search_nodes` - Find entities by name/type
- `open_nodes` - Get entity details and relationships

**Example Usage:**
When David says "I like this tool" → Create observation: "David rates [tool] as useful"
When you discover new info → Create entity for the tool + relations

### Research Tools (Web Scraping)
You have access to Firecrawl MCP for web research:

**Scraping:**
- `firecrawl_scrape` - Get content from any URL (GitHub, blogs, docs)
- `firecrawl_crawl` - Scrape multiple pages from a site
- `firecrawl_search` - Search the web for latest info

**Example Usage:**
Research Playwright updates → `firecrawl_scrape("https://github.com/microsoft/playwright/releases")`
Find AI tools → `firecrawl_search("AI agent frameworks 2025")`
```

### Step 2: Update Startup Routine

**Replace current startup with:**
```markdown
## 🚀 STARTUP ROUTINE (ALWAYS RUN FIRST)

### Step 1: Load Existing Knowledge
```
Use read_graph to load David's knowledge graph:
- What companies/projects exist
- What tools we're tracking
- What David likes/dislikes
- Recent discoveries
```

### Step 2: Daily Research
```
Use firecrawl to check:
1. GitHub releases for tools we track
   - Playwright, Gemini API, Claude, etc.
2. Search for "MCP servers released this week"
3. Search for "AI agent frameworks 2025 updates"
4. Check Product Hunt top products
```

### Step 3: Update Knowledge Graph
```
For each new discovery:
- Create entity for the tool
- Create observations (what it does, cost, features)
- Create relations (replaces what? helps which project?)
- Tag with priority (high/medium/low)
```

### Step 4: Present Strategic Brief
```
Query knowledge graph for:
- High-priority discoveries from last 7 days
- Tools David showed interest in
- Projects needing attention
- Recommendations based on past feedback
```

### Step 5: Ready for Questions
Report: "Knowledge loaded: X entities, Y recent discoveries, Z recommendations"
```

---

## 📊 Phase 5: Update Marketing Agent (1 hour)

### File: `.claude/agents/marketing-agent.md`

**Update Memory Section:**
```markdown
## 🧠 MANDATORY STARTUP - Load Memory First

**BEFORE ANY ACTION, YOU MUST:**

### Step 1: Load Project Knowledge
```
Use read_graph to load:
- Marketing templates and their success rates
- Quality patterns (what text lengths work best)
- User preferences
- Known issues and solutions
```

### Step 2: Search for Relevant Learnings
```
Use search_nodes to find:
- Template: [the template being used]
- Quality patterns
- Past successes/failures
```

### Step 3: Acknowledge Memory
```
Report: "Loaded knowledge: X templates tracked, Y quality rules, Z past generations"
```

## 💾 MANDATORY AFTER EACH GENERATION - Save Learning

**AFTER EVERY GENERATION, YOU MUST:**

### Step 1: Create/Update Template Entity
```
If template entity doesn't exist:
  create_entities(
    name="Rate Alert Template",
    entityType="MarketingTemplate",
    observations=["Used for rate announcements", "1080x1350 format"]
  )

Add new observation:
  add_observations(
    entityName="Rate Alert Template",
    contents=["Generated on [date]: 100% text accuracy, 6s generation time"]
  )
```

### Step 2: Record Quality Patterns
```
If pattern discovered (e.g., "short text works best"):
  create_entities(
    name="Short Text Pattern",
    entityType="QualityPattern",
    observations=["10-30 words = 100% accuracy", "50+ words = 60% accuracy"]
  )

  create_relations(
    from="Short Text Pattern",
    to="Rate Alert Template",
    relationType="appliesTo"
  )
```

### Step 3: Ask for Feedback
```
Ask David: "Was this perfect or does it need changes?"

If "perfect":
  add_observations(entityName="David Young", contents=["Approves short-form content approach"])

If "wrong":
  create_entities(name="Avoid Long Testimonials", entityType="Rule", observations=["Causes 60% errors"])
  create_relations(from="Avoid Long Testimonials", to="Marketing Generator", relationType="ruleFor")
```
```

---

## 🧹 Phase 6: Knowledge Graph Structure (Design)

### Entities to Create:

**People:**
- David Young (User, LendWise owner)

**Companies:**
- LendWise (Mortgage company David owns)

**Projects:**
- wisr-ai-generator (Marketing generator)
- LendWise-Onboarding (Employee onboarding)
- 90210lovecare (Healthcare project)
- [All other projects]

**Tools:**
- Gemini 2.5 Flash (Image generation)
- Playwright MCP (Browser automation)
- MCP Memory Server (Knowledge graph)
- Firecrawl MCP (Web scraping)
- [Tools we discover]

**Concepts:**
- Short Text Pattern (Quality rule)
- 25-Character Limit (Gemini recommendation)
- [Quality patterns]

**Rules:**
- ALWAYS use short messages
- NEVER use long testimonials
- [Rules learned from David]

### Relations to Create:

```
David Young --owns--> LendWise
David Young --created--> wisr-ai-generator
David Young --prefers--> Short Text Pattern

wisr-ai-generator --uses--> Gemini 2.5 Flash
wisr-ai-generator --uses--> Playwright MCP
wisr-ai-generator --hasRule--> 25-Character Limit

Short Text Pattern --appliesTo--> Rate Alert Template
Gemini 2.5 Flash --costs--> $0.001/image
```

---

## 🧪 Phase 7: Testing & Verification (1 hour)

### Test 1: Memory Persistence
```bash
# Terminal 1
Create entity: David's preference for concise output
Create observation: "David dislikes verbose explanations"

# Close terminal, open Terminal 2
Read graph - should still show the entity
```

### Test 2: Cross-Session Learning
```bash
# Session 1
/helpdesk
Tell Help Desk: "I'm interested in Playwright updates"
# Agent should create entity + observation

# Session 2 (next day)
/helpdesk
# Agent should load knowledge and prioritize Playwright info
```

### Test 3: Web Research
```bash
/helpdesk
"Research latest Playwright MCP updates"
# Should use firecrawl_scrape to check GitHub
# Should create entities for new features
# Should present findings with priority
```

### Test 4: Marketing Agent Memory
```bash
/marketing Generate a rate alert
# After generation, agent creates/updates template entity
# Add observation about quality/time
# Ask for feedback and store it

# Next generation
/marketing Generate another rate alert
# Should load previous learnings and apply them
```

---

## 📈 Phase 8: Migration (Optional - 30 minutes)

### Migrate Existing Data

**From:** `.claude/agent-memory.json`
**To:** MCP Memory Server

```bash
# Read old memory file
cat wisr-ai-generator/.claude/agent-memory.json

# Manually create entities for key learnings:
# - 4 generations → Observations on templates
# - Success patterns → Entities for patterns
# - Quality rules → Rule entities
```

**Script to help:**
```javascript
// migrate-to-mcp.js
// Reads agent-memory.json and creates MCP entities
// Can run once to migrate historical data
```

**Or:** Start fresh - the knowledge graph will populate naturally

---

## 📚 Documentation Updates (30 minutes)

### Update Files:

**1. QUICK-START-GUIDE.md**
- Replace memory system section with MCP instructions
- Update "How to verify memory" to use `read_graph`

**2. Create: MCP-MEMORY-GUIDE.md**
- How to query the knowledge graph
- Entity types and relations
- Best practices for creating entities
- Example queries

**3. Update: .claude/commands/helpdesk.md**
- Add MCP tool descriptions
- Update startup routine

**4. Update: .claude/commands/marketing.md**
- Add memory instructions using MCP tools
- Update save workflow

---

## ✅ Success Criteria

### Phase 2 Success:
- [ ] MCP Memory Server installed
- [ ] Can create entities and relations
- [ ] Data persists across sessions
- [ ] `read_graph` returns knowledge graph

### Phase 3 Success:
- [ ] Firecrawl MCP installed
- [ ] Can scrape GitHub releases
- [ ] Returns structured data
- [ ] Free tier working

### Phase 4 Success:
- [ ] Help Desk loads knowledge on startup
- [ ] Help Desk creates entities for discoveries
- [ ] Help Desk presents strategic brief
- [ ] Knowledge persists across sessions

### Phase 5 Success:
- [ ] Marketing Agent loads template knowledge
- [ ] Marketing Agent creates entities after generation
- [ ] Marketing Agent stores user feedback
- [ ] Quality patterns persist

### Overall Success:
- [ ] True persistent learning (not session-based)
- [ ] Knowledge graph shows relationships
- [ ] Agents get smarter over time
- [ ] No manual JSON file updates needed

---

## 🎯 Timeline Summary

**Day 1 (Today):**
- ✅ Cleanup old files (30 min)
- ✅ Install MCP Memory Server (1 hour)
- ✅ Install Firecrawl MCP (1 hour)
- ✅ Test both servers (30 min)

**Day 2:**
- ✅ Update Help Desk agent (2 hours)
- ✅ Update Marketing agent (1 hour)
- ✅ Design knowledge graph structure (1 hour)

**Day 3:**
- ✅ Testing & verification (1 hour)
- ✅ Migrate old data (30 min)
- ✅ Documentation updates (30 min)
- ✅ Final testing (1 hour)

**Total Time:** ~10 hours across 3 days

---

## 💰 Cost Analysis

**MCP Memory Server:**
- Cost: FREE (local knowledge graph)
- Storage: Local disk

**Firecrawl MCP:**
- Cost: FREE tier (500 requests/month)
- Upgrade: $20/month for 5,000 requests (if needed)

**Claude API:**
- Unchanged - same costs as before

**Total New Costs:** $0-$20/month (vs building custom = weeks of dev time)

---

## 🚨 Risks & Mitigation

### Risk 1: MCP Memory Server data loss
**Mitigation:** Memory stored locally in SQLite file, can backup regularly

### Risk 2: Firecrawl rate limits
**Mitigation:** Free tier 500/month = ~16/day, sufficient for daily research

### Risk 3: Learning curve
**Mitigation:** Start simple, add complexity as we learn

### Risk 4: MCP servers break/change
**Mitigation:** Official Anthropic servers, well-maintained

---

## 🎬 Next Steps

**Ready to execute?**

Say "Execute Phase 1" and I'll:
1. Delete old custom files
2. Install MCP Memory Server
3. Test it works
4. Move to Phase 2

Or we can go through each phase together step-by-step!
