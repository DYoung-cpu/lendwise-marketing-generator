#!/bin/bash

# WISR AI Generator - Complete System Startup Script
# Created: 2025-10-29
# Purpose: Start all services for the WISR AI Marketing Generator with perpetual learning

set -e  # Exit on error

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
print_header() { echo -e "${BLUE}$1${NC}"; }

clear
echo "============================================"
echo "WISR AI Marketing Generator"
echo "Complete System Startup"
echo "============================================"
echo ""

# Step 1: Check and start Neo4j
print_header "Step 1: Neo4j Database"
echo ""

if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed"
    print_info "Run: ./setup-docker-neo4j.sh to install Docker and Neo4j"
    exit 1
fi

if ! docker ps &> /dev/null; then
    print_error "Docker daemon is not running"
    print_info "Please start Docker Desktop"
    exit 1
fi

if docker ps | grep -q "neo4j-claude-memory"; then
    print_success "Neo4j is already running"
elif docker ps -a | grep -q "neo4j-claude-memory"; then
    print_info "Starting Neo4j container..."
    docker start neo4j-claude-memory
    sleep 5
    print_success "Neo4j started"
else
    print_error "Neo4j container not found"
    print_info "Run: ./setup-docker-neo4j.sh to install Neo4j"
    exit 1
fi

# Wait for Neo4j to be ready
print_info "Waiting for Neo4j to be ready..."
MAX_ATTEMPTS=15
ATTEMPT=0
while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if curl -s http://localhost:7474 > /dev/null 2>&1; then
        print_success "Neo4j is ready (http://localhost:7474)"
        break
    fi
    ATTEMPT=$((ATTEMPT + 1))
    echo -n "."
    sleep 2
done
echo ""

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    print_error "Neo4j did not become ready"
    exit 1
fi

# Step 2: Start nano-test interface (static files)
print_header "Step 2: Marketing Generator Interface"
echo ""

# Check if port 8080 is already in use
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_warning "Port 8080 is already in use"
    print_info "Interface may already be running at http://localhost:8080"
else
    print_info "Starting marketing generator interface on port 8080..."
    python3 -m http.server 8080 > /dev/null 2>&1 &
    HTTP_SERVER_PID=$!
    sleep 2
    print_success "Interface running at http://localhost:8080/nano-test.html"
    echo $HTTP_SERVER_PID > .http-server.pid
fi

# Step 3: Start quality backend (OCR validation)
print_header "Step 3: Quality Backend (OCR Validation)"
echo ""

# Check if port 3001 is already in use
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_warning "Port 3001 is already in use"
    print_info "Quality backend may already be running"
else
    print_info "Starting quality backend on port 3001..."
    node quality-backend.js > quality-backend.log 2>&1 &
    QUALITY_PID=$!
    sleep 3
    print_success "Quality backend running on port 3001"
    echo $QUALITY_PID > .quality-backend.pid
fi

# Step 4: Display status summary
echo ""
print_header "============================================"
print_header "System Status"
print_header "============================================"
echo ""

print_success "All services are running!"
echo ""

echo "Services:"
echo "  • Neo4j Database:         http://localhost:7474  (neo4j/claudecode123)"
echo "  • Marketing Interface:    http://localhost:8080/nano-test.html"
echo "  • Quality Backend:        http://localhost:3001"
echo ""

echo "Agent Files:"
echo "  • Orchestrator:           .claude/CLAUDE.md"
echo "  • Coder Agent:            .claude/agents/coder.md"
echo "  • Tester Agent:           .claude/agents/tester.md"
echo "  • Stuck Agent:            .claude/agents/stuck.md"
echo ""

echo "Memory System:"
echo "  • Neo4j Memory Server:    claude-code-memory/venv/bin/python -m claude_memory.server"
echo "  • Config:                 ~/.../Claude/claude_desktop_config.json"
echo "  • Environment:            claude-code-memory/.env"
echo ""

print_info "Restart Claude Code to load the Neo4j memory server"
echo ""

echo "To stop all services:"
echo "  ./shutdown.sh"
echo ""

echo "To view logs:"
echo "  • Quality backend: tail -f quality-backend.log"
echo "  • Neo4j: docker logs neo4j-claude-memory"
echo ""

print_header "============================================"
print_info "System ready for perpetual learning!"
print_header "============================================"
echo ""
