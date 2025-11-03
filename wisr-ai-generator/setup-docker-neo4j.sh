#!/bin/bash

# WISR AI Generator - Docker + Neo4j Setup Script
# Created: 2025-10-29
# Purpose: Install Docker Desktop and set up Neo4j database for perpetual learning

set -e  # Exit on error

echo "============================================"
echo "WISR AI Generator - Full Setup"
echo "Docker + Neo4j + Memory Server"
echo "============================================"
echo ""

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "ℹ️  $1"
}

# Step 1: Check if Docker is installed
echo "Step 1: Checking Docker installation..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    print_success "Docker is installed: $DOCKER_VERSION"
else
    print_warning "Docker is not installed"
    echo ""
    echo "To install Docker Desktop for Windows:"
    echo "1. Download from: https://www.docker.com/products/docker-desktop/"
    echo "2. Run the installer and restart your computer"
    echo "3. Open Docker Desktop → Settings → Resources → WSL Integration"
    echo "4. Enable 'Ubuntu' (or your WSL2 distro)"
    echo "5. Click 'Apply & Restart'"
    echo ""
    echo "After Docker is installed, run this script again."
    exit 1
fi

# Step 2: Check if Docker daemon is running
echo ""
echo "Step 2: Checking if Docker daemon is running..."
if docker ps &> /dev/null; then
    print_success "Docker daemon is running"
else
    print_error "Docker daemon is not running"
    echo "Please start Docker Desktop and try again"
    exit 1
fi

# Step 3: Check if Neo4j container already exists
echo ""
echo "Step 3: Checking for existing Neo4j container..."
if docker ps -a | grep -q "neo4j-claude-memory"; then
    print_warning "Neo4j container 'neo4j-claude-memory' already exists"

    # Check if it's running
    if docker ps | grep -q "neo4j-claude-memory"; then
        print_success "Container is already running"
        NEO4J_RUNNING=true
    else
        print_info "Starting existing container..."
        docker start neo4j-claude-memory
        print_success "Container started"
        NEO4J_RUNNING=true
    fi
else
    print_info "No existing container found. Creating new Neo4j container..."

    # Step 4: Pull Neo4j image
    echo ""
    echo "Step 4: Pulling Neo4j Docker image (this may take a few minutes)..."
    docker pull neo4j:latest
    print_success "Neo4j image downloaded"

    # Step 5: Create and start Neo4j container
    echo ""
    echo "Step 5: Creating Neo4j container..."
    docker run \
        --name neo4j-claude-memory \
        -p 7474:7474 -p 7687:7687 \
        -e NEO4J_AUTH=neo4j/claudecode123 \
        -v "$HOME/neo4j/data:/data" \
        -v "$HOME/neo4j/logs:/logs" \
        -d \
        neo4j:latest

    print_success "Neo4j container created and started"
    NEO4J_RUNNING=true
fi

# Step 6: Wait for Neo4j to be ready
if [ "$NEO4J_RUNNING" = true ]; then
    echo ""
    echo "Step 6: Waiting for Neo4j to be ready (this may take 30-60 seconds)..."
    sleep 10  # Initial wait

    MAX_ATTEMPTS=30
    ATTEMPT=0
    while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
        if curl -s http://localhost:7474 > /dev/null; then
            print_success "Neo4j is ready!"
            break
        fi

        ATTEMPT=$((ATTEMPT + 1))
        echo -n "."
        sleep 2
    done
    echo ""

    if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
        print_error "Neo4j did not become ready in time"
        print_info "Check Docker logs: docker logs neo4j-claude-memory"
        exit 1
    fi
fi

# Step 7: Verify Neo4j connection
echo ""
echo "Step 7: Verifying Neo4j connection..."
print_success "Neo4j Browser available at: http://localhost:7474"
print_info "Username: neo4j"
print_info "Password: claudecode123"

# Step 8: Display summary
echo ""
echo "============================================"
echo "Installation Complete!"
echo "============================================"
echo ""
print_success "Neo4j database is running"
print_info "Container name: neo4j-claude-memory"
print_info "Bolt URI: bolt://localhost:7687"
print_info "Browser URL: http://localhost:7474"
echo ""
echo "Next steps:"
echo "1. Open Neo4j Browser: http://localhost:7474"
echo "2. Login with: neo4j / claudecode123"
echo "3. Run: ./startup.sh to start the complete system"
echo ""
echo "To stop Neo4j:"
echo "  docker stop neo4j-claude-memory"
echo ""
echo "To start Neo4j again:"
echo "  docker start neo4j-claude-memory"
echo ""
echo "To view Neo4j logs:"
echo "  docker logs neo4j-claude-memory"
echo ""
