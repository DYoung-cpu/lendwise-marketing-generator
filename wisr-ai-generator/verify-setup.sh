#!/bin/bash

# WISR AI Generator - Setup Verification Script
# Created: 2025-10-29
# Purpose: Verify all components are properly installed and configured

PROJECT_DIR="/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator"
cd "$PROJECT_DIR"

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_header() { echo -e "\n${BLUE}=== $1 ===${NC}"; }

ERRORS=0
WARNINGS=0

echo "============================================"
echo "WISR AI Generator - Setup Verification"
echo "============================================"

# 1. Check agent files
print_header "Agent Files"

if [ -f ".claude/CLAUDE.md" ]; then
    SIZE=$(wc -c < ".claude/CLAUDE.md")
    if [ $SIZE -gt 5000 ]; then
        print_success "CLAUDE.md exists (${SIZE} bytes)"
    else
        print_warning "CLAUDE.md is too small (${SIZE} bytes)"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    print_error "CLAUDE.md not found"
    ERRORS=$((ERRORS + 1))
fi

for AGENT in coder tester stuck; do
    if [ -f ".claude/agents/${AGENT}.md" ]; then
        SIZE=$(wc -c < ".claude/agents/${AGENT}.md")
        if [ $SIZE -gt 4000 ]; then
            print_success "${AGENT}.md exists (${SIZE} bytes)"
        else
            print_warning "${AGENT}.md is too small (${SIZE} bytes)"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        print_error ".claude/agents/${AGENT}.md not found"
        ERRORS=$((ERRORS + 1))
    fi
done

# 2. Check Python and memory server
print_header "Python & Memory Server"

if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    print_success "Python installed: $PYTHON_VERSION"
else
    print_error "Python3 not found"
    ERRORS=$((ERRORS + 1))
fi

if [ -d "claude-code-memory/venv" ]; then
    print_success "Python virtual environment exists"
else
    print_error "Virtual environment not found"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "claude-code-memory/.env" ]; then
    print_success ".env configuration exists"
else
    print_error ".env file not found"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "claude-code-memory/venv/bin/python" ] || [ -f "claude-code-memory/venv/Scripts/python.exe" ]; then
    print_success "Memory server dependencies installed"
else
    print_error "Memory server not installed"
    ERRORS=$((ERRORS + 1))
fi

# 3. Check Docker and Neo4j
print_header "Docker & Neo4j"

if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    print_success "Docker installed: $DOCKER_VERSION"

    if docker ps &> /dev/null; then
        print_success "Docker daemon is running"

        if docker ps | grep -q "neo4j-claude-memory"; then
            print_success "Neo4j container is running"

            if curl -s http://localhost:7474 > /dev/null 2>&1; then
                print_success "Neo4j Browser accessible (http://localhost:7474)"
            else
                print_warning "Neo4j Browser not accessible yet (may be starting up)"
                WARNINGS=$((WARNINGS + 1))
            fi
        else
            if docker ps -a | grep -q "neo4j-claude-memory"; then
                print_warning "Neo4j container exists but not running (run: docker start neo4j-claude-memory)"
                WARNINGS=$((WARNINGS + 1))
            else
                print_error "Neo4j container not found (run: ./setup-docker-neo4j.sh)"
                ERRORS=$((ERRORS + 1))
            fi
        fi
    else
        print_error "Docker daemon not running (start Docker Desktop)"
        ERRORS=$((ERRORS + 1))
    fi
else
    print_error "Docker not installed (run: ./setup-docker-neo4j.sh for instructions)"
    ERRORS=$((ERRORS + 1))
fi

# 4. Check Claude desktop config
print_header "Claude Desktop Configuration"

CONFIG_FILE="/mnt/c/Users/dyoun/AppData/Roaming/Claude/claude_desktop_config.json"
if [ -f "$CONFIG_FILE" ]; then
    print_success "claude_desktop_config.json exists"

    if grep -q "neo4j-memory" "$CONFIG_FILE"; then
        print_success "Neo4j memory server configured"
    else
        print_warning "Neo4j memory server not found in config"
        WARNINGS=$((WARNINGS + 1))
    fi

    if grep -q "playwright" "$CONFIG_FILE"; then
        print_success "Playwright MCP configured"
    else
        print_warning "Playwright MCP not configured"
        WARNINGS=$((WARNINGS + 1))
    fi

    if grep -q "firecrawl" "$CONFIG_FILE"; then
        print_success "Firecrawl MCP configured"
    else
        print_warning "Firecrawl MCP not configured"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    print_error "claude_desktop_config.json not found"
    ERRORS=$((ERRORS + 1))
fi

# 5. Check project files
print_header "Project Files"

for FILE in nano-test.html signature-templates.js clickable-verifier.js quality-backend.js; do
    if [ -f "$FILE" ]; then
        print_success "$FILE exists"
    else
        print_error "$FILE not found"
        ERRORS=$((ERRORS + 1))
    fi
done

# 6. Check scripts
print_header "Startup Scripts"

for SCRIPT in setup-docker-neo4j.sh startup.sh shutdown.sh verify-setup.sh; do
    if [ -f "$SCRIPT" ]; then
        if [ -x "$SCRIPT" ]; then
            print_success "$SCRIPT exists and is executable"
        else
            print_warning "$SCRIPT exists but not executable (run: chmod +x $SCRIPT)"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        print_error "$SCRIPT not found"
        ERRORS=$((ERRORS + 1))
    fi
done

# Summary
print_header "Verification Summary"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    print_success "All checks passed!"
    echo ""
    echo "System is ready. Next steps:"
    echo "1. If Neo4j is not running: ./setup-docker-neo4j.sh"
    echo "2. Start all services: ./startup.sh"
    echo "3. Restart Claude Code to load orchestrator"
    echo "4. Test with: 'Generate signature for John Smith'"
elif [ $ERRORS -eq 0 ]; then
    print_warning "Setup complete with $WARNINGS warnings"
    echo ""
    echo "System should work, but review warnings above"
else
    print_error "Found $ERRORS errors and $WARNINGS warnings"
    echo ""
    echo "Please fix errors before proceeding"
    exit 1
fi

echo ""
