# Claude Configuration for Wisr AI Marketing Generator

## Quick Reference

### Project Memory Files
- **`.claude/project-memory.md`** - Main project memory (comprehensive context, issues, solutions)
- **`AGENT_DOCUMENTATION.md`** - Detailed agent behavior and learnings
- **`.claude/agents/prompt-architect.md`** - Prompt review agent configuration

### When Starting a New Session
1. Read `.claude/project-memory.md` first to get up to speed
2. Check "Active Issues" section for current problems
3. Review "Recent Changes" to see what's been fixed
4. Reference "Known Solutions" before trying new approaches

### Key Project Info
- **Main File:** `nano-test.html` (7000+ lines, self-contained web app)
- **Server:** Run on port 8081 (`python3 -m http.server 8081`)
- **API Model:** `gemini-2.5-flash-image` for generation
- **Agent Memory:** Browser localStorage key: `agent_learning_memory`

### Active Agents
1. **Learning Agent** (JavaScript, lines 2716-3008)
   - Learns spelling patterns from failures
   - 5 strategies: standard, simplified, bulletPoints, allCaps, minimal
   - Memory persists in localStorage

2. **Prompt Architect** (`.claude/agents/prompt-architect.md`)
   - Reviews prompts before sending to Gemini
   - Enforces brand consistency
   - Function: `reviewPrompt()` in nano-test.html

3. **Vision Mode** (Experimental, lines 4618-4998)
   - ⚠️ Currently has spatial awareness issues
   - See project-memory.md "Active Issues" section

### Common Commands

#### View Agent Stats (Browser Console)
```javascript
showAgentStats()  // Dashboard
localStorage.getItem('agent_learning_memory')  // Raw memory
```

#### Start Local Server
```bash
cd "/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator"
python3 -m http.server 8081
```

#### Access Application
```
http://localhost:8081/nano-test.html
```

### Don't Change
- localStorage key: `agent_learning_memory`
- Brand colors (forest green + gold)
- Logo specifications (see prompt-architect.md)
- Two-pass generation system (Phase 1 → Phase 2 → Phase 3)

### Current Priority
**Fix Vision Mode spatial awareness** - text overlays without considering background layout.
See `.claude/project-memory.md` → "Active Issues" for full details.

---

**Last Updated:** 2025-10-13
