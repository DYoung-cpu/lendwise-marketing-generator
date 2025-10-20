#!/bin/bash

# Start Quality-Guaranteed Backend Server
# Load environment variables from .env file
set -a
source .env
set +a

cd "/mnt/c/Users/dyoun/Active Projects"

echo "🚀 Starting Quality-Guaranteed Backend Server..."
node quality-backend.js
