#!/bin/bash

# Aider Startup Script for Active Projects
# Run this to start Aider with your projects

echo "🚀 Starting Aider for Active Projects..."
echo "📁 Current directory: $(pwd)"
echo ""

# Check if we're in a specific project or the root
if [ -d ".git" ]; then
    echo "✅ Git repository detected in current directory"
else
    echo "📂 You're in the Active Projects root"
    echo "💡 Tip: cd into a specific project for focused work"
    echo ""
fi

# List available projects
echo "Available projects:"
for dir in */; do
    if [ -d "$dir/.git" ]; then
        echo "  • $dir (git repo)"
    else
        echo "  • $dir"
    fi
done
echo ""

# Start Aider with Python module
echo "Starting Aider..."
echo "================================"
echo "Quick tips:"
echo "  • Type your request naturally"
echo "  • Aider will edit files automatically"
echo "  • Type 'exit' to quit"
echo "  • Type '/help' for commands"
echo "================================"
echo ""

# Use the configuration file we created
python3 -m aider --config /mnt/c/Users/dyoun/Active\ Projects/.aider.conf.yml "$@"