#!/bin/bash

# Start Quality-Guaranteed Backend Server
export GEMINI_API_KEY="AIzaSyD7cwQ3dv2BScr9y0GM4lk0sYaVV0Uw1Os"
export ANTHROPIC_API_KEY="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"

cd "/mnt/c/Users/dyoun/Active Projects"

echo "🚀 Starting Quality-Guaranteed Backend Server..."
node quality-backend.js
