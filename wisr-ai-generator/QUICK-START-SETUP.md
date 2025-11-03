# Quick Start Setup Guide
## WISR AI Marketing Generator - Orchestrator + Memory System

**Status**: ✅ Agent files created | ⏳ Docker/Neo4j setup required

---

## What's Already Complete

✅ **Agent files created** (.claude/CLAUDE.md, coder.md, tester.md, stuck.md)
✅ **Existing MCP servers registered**:
- Playwright MCP (browser automation)
- Memory MCP (standard)
- Firecrawl MCP (web scraping)
- Marketing coordinator

---

## What You Need to Do

### Option 1: Quick Test (Without Neo4j Perpetual Learning)

**Start using the orchestrator NOW with existing memory**:

1. **Restart Claude Code** to load the new agent files
2. **Test orchestrator** with a simple request:
   ```
   Generate an email signature for John Smith, NMLS 123456,
   phone 555-1234, email john@lendwise.com using Classic template
   ```
3. **Verify TodoWrite** - Orchestrator should create a todo list
4. **Watch delegation** - Should invoke coder → tester → verification

**What works**:
- ✅ Orchestrator delegation (coder, tester, stuck agents)
- ✅ Visual verification with Playwright MCP
- ✅ Automatic testing with clickable-verifier.js
- ⚠️ Memory (uses standard MCP, not perpetual Neo4j learning)

**Limitation**: Memory won't persist across sessions or learn from failures with relationships.

---

### Option 2: Full Setup (With Neo4j Perpetual Learning)

**For complete perpetual learning system, install Docker + Neo4j**:

#### Step 1: Install Docker Desktop (Windows)

1. Download Docker Desktop: https://www.docker.com/products/docker-desktop/
2. Install and restart your computer
3. Enable WSL2 integration:
   - Open Docker Desktop → Settings → Resources → WSL Integration
   - Enable "Ubuntu" (or your WSL2 distro)
   - Click "Apply & Restart"

4. Verify in WSL2:
   ```bash
   docker --version
   # Expected: Docker version 24.x.x or higher
   ```

#### Step 2: Install Neo4j Database

```bash
# Run Neo4j in Docker container
docker run \
    --name neo4j-claude-memory \
    -p 7474:7474 -p 7687:7687 \
    -e NEO4J_AUTH=neo4j/claudecode123 \
    -v $HOME/neo4j/data:/data \
    -v $HOME/neo4j/logs:/logs \
    -d \
    neo4j:latest

# Verify it's running
docker ps | grep neo4j
# Expected: Container running

# Open Neo4j Browser
# Navigate to: http://localhost:7474
# Login: neo4j / claudecode123
```

#### Step 3: Install Claude Code Memory Server

```bash
cd "/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator"

# Clone memory server repository
git clone https://github.com/ViralV00d00/claude-code-memory.git temp-memory-server
cp -r temp-memory-server/memory-mcp-server ./memory-mcp-server
rm -rf temp-memory-server

# Install dependencies
cd memory-mcp-server
npm install

# Create environment file
cat > .env << 'EOF'
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=claudecode123
PORT=3333
EOF

# Test connection
node src/index.js

# Expected output:
# ✅ Neo4j connected
# 🚀 MCP Server running on port 3333
```

#### Step 4: Update Claude Desktop Config

**File location**: `/mnt/c/Users/dyoun/AppData/Roaming/Claude/claude_desktop_config.json`

Replace the `memory` section with:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest", "--browser", "chromium"],
      "env": {}
    },
    "neo4j-memory": {
      "command": "node",
      "args": [
        "C:\\Users\\dyoun\\Active Projects\\wisr-ai-generator\\memory-mcp-server\\src\\index.js"
      ],
      "env": {
        "NEO4J_URI": "bolt://localhost:7687",
        "NEO4J_USER": "neo4j",
        "NEO4J_PASSWORD": "claudecode123"
      }
    },
    "firecrawl": {
      "command": "npx",
      "args": ["-y", "firecrawl-mcp"],
      "env": {
        "FIRECRAWL_API_KEY": "fc-d57b91b39eb34cedb86d6b9ab3cc67a9"
      }
    },
    "marketing-coordinator": {
      "command": "node",
      "args": [
        "C:\\Users\\dyoun\\Active Projects\\wisr-ai-generator\\marketing-agent-coordinator.js"
      ],
      "env": {}
    }
  }
}
```

#### Step 5: Restart Claude Code

Close and reopen Claude Code to load new config.

#### Step 6: Verify Everything Works

```bash
# 1. Neo4j running?
docker ps | grep neo4j
# Expected: Container running

# 2. Memory server accessible?
curl http://localhost:7474
# Expected: Neo4j Browser loads

# 3. WISR interface running?
cd "/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator"
python3 -m http.server 8080 &
# Expected: Serving at http://localhost:8080

# 4. Quality backend running?
node quality-backend.js &
# Expected: Quality backend on port 3001
```

---

## Testing the Complete System

### Test 1: Orchestrator Delegation

**Your request**:
```
Generate email signature for Jane Doe, NMLS 987654,
phone 555-5678, email jane@lendwise.com, Classic template
```

**Expected behavior**:
1. ✅ Orchestrator creates TodoWrite list (5 steps)
2. ✅ Marks "Generate signature" as in_progress
3. ✅ Invokes coder agent
4. ✅ Coder generates signature with Gemini API
5. ✅ Marks "Generate signature" as completed
6. ✅ Marks "Verify signature" as in_progress
7. ✅ Invokes tester agent
8. ✅ Tester uses Playwright to navigate to localhost:8080
9. ✅ Tester takes screenshot
10. ✅ Tester runs clickable-verifier.js
11. ✅ Reports verification results
12. ✅ Stores learning in Neo4j memory (if Option 2)

### Test 2: Failure Recovery (Stuck Agent)

**Simulate failure**:
1. Break signature generation (edit nano-test.html CSS temporarily)
2. Request signature generation
3. ✅ Tester detects issue
4. ✅ Tester invokes stuck agent
5. ✅ Stuck agent searches Neo4j memory
6. ✅ Stuck agent presents options via AskUserQuestion
7. ✅ You select option
8. ✅ Stuck agent relays to orchestrator
9. ✅ Orchestrator applies fix
10. ✅ Stores EFFECTIVE_FOR in memory

### Test 3: Perpetual Learning (Option 2 Only)

**After several generations**:
1. Query Neo4j memory:
   ```cypher
   MATCH (s:Solution)-[:EFFECTIVE_FOR]->(template)
   RETURN s.name, template.name, s.effectiveness
   ```
2. ✅ Should see stored solutions with effectiveness ratings
3. ✅ Next failure should reference past solutions

---

## Current Status Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Agent files (4) | ✅ Complete | CLAUDE.md, coder.md, tester.md, stuck.md created |
| Playwright MCP | ✅ Active | Already registered in config |
| Firecrawl MCP | ✅ Active | Already registered in config |
| Marketing coordinator | ✅ Active | Already registered in config |
| Docker | ⏳ Required | Install Docker Desktop for Windows |
| Neo4j | ⏳ Required | Needs Docker installation first |
| Memory Server | ⏳ Required | Clone and install after Neo4j |
| Config update | ⏳ Required | Update after memory server install |

---

## Quick Decision Matrix

**Want to test orchestrator immediately?**
→ Choose **Option 1** (restart Claude Code, test now)

**Want full perpetual learning?**
→ Choose **Option 2** (install Docker + Neo4j, 30-45 min setup)

**Not sure?**
→ Start with **Option 1**, upgrade to **Option 2** later

---

## Troubleshooting

### Orchestrator not creating todos?
- Verify `.claude/CLAUDE.md` exists: `ls -la /mnt/c/Users/dyoun/Active\ Projects/wisr-ai-generator/.claude/CLAUDE.md`
- Restart Claude Code
- File should be 5KB+ in size

### Agents not being invoked?
- Check agent files exist: `ls -la /mnt/c/Users/dyoun/Active\ Projects/wisr-ai-generator/.claude/agents/`
- Should see: coder.md, tester.md, stuck.md
- Each should be 4-6 KB

### Playwright not working?
- Verify in Claude Code MCP panel: Playwright server should show "connected"
- If not, run: `npx playwright install`

### Memory not persisting (Option 2)?
- Check Neo4j running: `docker ps | grep neo4j`
- Check memory server running: `curl http://localhost:3333/health`
- Verify config points to correct memory server

---

## Next Steps After Setup

Once everything is running:

1. **Generate several signatures** to populate memory
2. **Introduce a failure** to test stuck agent escalation
3. **Check Neo4j Browser** (http://localhost:7474) to see knowledge graph
4. **Query memory** to see what system has learned
5. **Repeat same failure** - stuck agent should reference past solution

---

## Support Documentation

**Full implementation plan**: `COMPLETE-ORCHESTRATOR-MEMORY-IMPLEMENTATION.md`
**Visual audit report**: `WORKFLOW-ORCHESTRATOR-REPORT.md`
**MCP setup guide**: `MCP-AND-TEXT-OVERLAY-SETUP.md`

---

**Quick Start created**: 2025-10-29
**Choose your path**: Option 1 (immediate test) or Option 2 (full setup)
