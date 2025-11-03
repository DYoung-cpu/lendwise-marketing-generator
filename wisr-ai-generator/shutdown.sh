#!/bin/bash

# WISR AI Generator - System Shutdown Script
# Created: 2025-10-29
# Purpose: Stop all running services gracefully

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

echo "============================================"
echo "WISR AI Generator - Shutdown"
echo "============================================"
echo ""

# Stop HTTP server (port 8080)
if [ -f .http-server.pid ]; then
    PID=$(cat .http-server.pid)
    if kill -0 $PID 2>/dev/null; then
        kill $PID
        print_success "Stopped marketing interface (port 8080)"
    fi
    rm .http-server.pid
elif lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
    lsof -Pi :8080 -sTCP:LISTEN -t | xargs kill
    print_success "Stopped process on port 8080"
fi

# Stop quality backend (port 3001)
if [ -f .quality-backend.pid ]; then
    PID=$(cat .quality-backend.pid)
    if kill -0 $PID 2>/dev/null; then
        kill $PID
        print_success "Stopped quality backend (port 3001)"
    fi
    rm .quality-backend.pid
elif lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    lsof -Pi :3001 -sTCP:LISTEN -t | xargs kill
    print_success "Stopped process on port 3001"
fi

# Stop Neo4j container (optional - leave running)
print_info "Neo4j container left running (to stop: docker stop neo4j-claude-memory)"

echo ""
print_success "All services stopped"
echo ""
