# Marketing Agent Rules

## ⛔ NEVER DO AGAIN

1. **NEVER trust 100% quality scores without verification**
   - Vision analyzer gives false positives
   - Always manually check generated images
   - Verify ALL required data fields are present

2. **NEVER assume 1 of 3 data fields is acceptable**
   - Example: Economic factors should show ALL 3 (Inflation Data, Purchase Demand, Refinance Activity)
   - Vision analyzer currently misses data completeness issues
   - Must enhance analyzer to check field counts

3. **NEVER accept spelling errors in professional terms**
   - PERSONALIZED not PERSONAIIZED
   - Add explicit spelling checks to prompts for critical terms

4. **NEVER generate without autonomous quality monitoring**
   - Playwright MCP must watch generations in real-time
   - Agent must review each generation
   - Agent must trigger regeneration with specific feedback until truly 100%

5. **NEVER batch cleanup without function dependency analysis**
   - Removing test functions broke page (red X screen)
   - Must check all function calls before deleting
   - Conservative approach (comments only) safer than aggressive

## ✅ ALWAYS DO THIS

1. **ALWAYS verify data completeness**
   - Count economic factors (should be 3)
   - Count all dynamic fields vs template requirements
   - Check for duplicate text sections

2. **ALWAYS use Playwright MCP for real-time monitoring**
   - Navigate to localhost:8080
   - Watch for generation completion
   - Screenshot and analyze immediately
   - Provide structured feedback for regeneration

3. **ALWAYS check actual rendered text, not just backend logs**
   - Backend may say 100%, image may have errors
   - Manual verification required
   - Screenshot comparison essential

4. **ALWAYS persist learnings after each session**
   - Update agent-memory.json with new patterns
   - Update rules.md with new NEVER/ALWAYS items
   - Save session logs with full context

5. **ALWAYS use conservative cleanup approach first**
   - Remove comments and whitespace only
   - Test functionality before removing code
   - Keep backups before aggressive changes

6. **ALWAYS include specific error context in regeneration prompts**
   - Don't just say "fix errors"
   - Say "You spelled PERSONALIZED as PERSONAIIZED - fix it"
   - Say "You only showed 1 of 3 economic factors - show all 3"

## 🎯 Quality Standards

- **100% means 100%**: No spelling errors, no missing data, no layout issues
- **All required fields present**: Not 1 of 3, but 3 of 3
- **Quotes formatted correctly**: Opening and closing quotes both present
- **Logo correct**: LendWise owl logo, not generic owl
- **Data accuracy**: Rates match market data source exactly

## 📊 Performance Targets

- Global success rate: 90%+ (currently 80.3%)
- Average attempts to success: <1.5 (currently 1.2)
- Generation time: <30 seconds (currently 35-40s, bottleneck: 35MB photo)

## 🔧 Known Issues to Fix

1. vision-analyzer.js needs enhancement:
   - Add data completeness checks
   - Add field count validation
   - Add layout duplicate detection
   - More strict 100% criteria

2. Photo optimization needed:
   - 35MB Mohamed Hassan portrait causing slow generations
   - Should compress to <5MB
   - Maintain visual quality

3. Orchestrator + Memory System (IMPLEMENTED 2025-10-29):
   - ✅ Wizard v2 orchestrator active (.claude/CLAUDE.md)
   - ✅ Specialized agents: coder, tester, stuck
   - ✅ Playwright MCP automatic visual verification
   - ✅ TodoWrite integration for task tracking
   - ⏳ Neo4j perpetual learning (requires Docker installation)
   - Agent intercepts EVERY generation via tester agent
   - clickable-verifier.js runs automatically for signatures
   - Stuck agent escalates failures with memory-guided solutions

## 🤖 Orchestrator Workflow Rules

### Main Claude (Orchestrator) MUST:
1. **Create TodoWrite list** at start of ANY task
2. **Delegate to subagents** - NEVER implement code directly
3. **Mark todos in_progress** before invoking agents
4. **Mark todos completed** immediately after success
5. **Test EVERY implementation** with tester agent
6. **Check memory before retry** (when Neo4j active)
7. **Store learning** after success/failure

### Coder Agent MUST:
1. **Read files before editing** - Never edit blindly
2. **NO fallbacks** - Error → invoke stuck agent immediately
3. **Return complete results** - All-or-nothing approach

### Tester Agent MUST:
1. **Use Playwright MCP** - Visual verification, not assumptions
2. **Take screenshots** as evidence
3. **Run clickable-verifier.js** for signatures
4. **Invoke stuck on visual issues** - Never pass if wrong

### Stuck Agent (Human Escalation):
1. **ONLY agent with AskUserQuestion** - All escalations go through stuck
2. **Search memory first** - Check if problem solved before
3. **Present 2-4 options** to user
4. **Block all work** until user responds
5. **NO fallbacks, NO exceptions**

### Memory Learning (When Neo4j Active):
1. Store **EFFECTIVE_FOR** relationships on success
2. Store **INEFFECTIVE_FOR** relationships on failure
3. Store **CAUSES** relationships for problems
4. Search memory before retry to prevent repeated failures
5. Track effectiveness ratings (high/medium/low)