#!/bin/bash
# Massive cleanup script for nano-test.html
# Reduces 7,891 lines to ~2,000 lines by removing all test/debug code

cd "/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator"

echo "🚀 Starting massive cleanup of nano-test.html"
echo "📊 Original: $(wc -l < nano-test.html) lines"

# Step 1: Remove Auto-Learn system (lines 4184-4450)
echo "🗑️  Removing Auto-Learn system..."
sed -i '4184,4450d' nano-test.html

# Step 2: Remove Vision Mode system (lines 5200-5480 - adjusted after previous deletion)
NEW_LINE=$((5200 - 266))
echo "🗑️  Removing Vision Mode system..."
sed -i "${NEW_LINE},$((NEW_LINE + 280))d" nano-test.html

# Step 3: Remove Ideogram test functions (lines 6770-6960 - adjusted)
NEW_LINE=$((6770 - 266 - 280))
echo "🗑️  Removing Ideogram API integration..."
sed -i "${NEW_LINE},$((NEW_LINE + 190))d" nano-test.html

# Step 4: Remove agent memory/learning functions (lines 3747-4150)
NEW_LINE=$((3747 - 266 - 280 - 190))
echo "🗑️  Removing agent memory system..."
sed -i "${NEW_LINE},$((NEW_LINE + 400))d" nano-test.html

# Step 5: Remove verification functions (lines 3283-3640)
NEW_LINE=$((3283 - 266 - 280 - 190 - 400))
echo "🗑️  Removing vision verification system..."
sed -i "${NEW_LINE},$((NEW_LINE + 357))d" nano-test.html

# Step 6: Remove 90% of console.log statements (keep only essential 3)
echo "🗑️  Removing excessive console logs..."
# Keep only: Starting generation, Success, and Error logs
sed -i '/console\.log.*DEBUG/d' nano-test.html
sed -i '/console\.log.*🔍/d' nano-test.html
sed -i '/console\.log.*📊/d' nano-test.html
sed -i '/console\.log.*📝/d' nano-test.html
sed -i '/console\.log.*⏱️/d' nano-test.html
sed -i '/console\.log.*📦/d' nano-test.html
sed -i '/console\.log.*📤/d' nano-test.html
sed-i '/console\.log.*📡/d' nano-test.html
sed -i '/console\.log.*🎯/d' nano-test.html
sed -i '/console\.log.*🔄/d' nano-test.html
sed -i '/console\.log.*💾/d' nano-test.html
sed -i '/console\.log.*🤖/d' nano-test.html
sed -i '/console\.log.*🦉/d' nano-test.html
sed -i '/console\.log.*✨/d' nano-test.html

# Step 7: Remove Auto-Learn button from HTML
echo "🗑️  Removing Auto-Learn UI elements..."
sed -i '/autoLearnBtn/,+3d' nano-test.html
sed -i '/learningStatus/d' nano-test.html

# Step 8: Remove commented code blocks
echo "🗑️  Removing commented code..."
sed -i '/\/\/ OLD CODE:/,/\/\/ END OLD CODE/d' nano-test.html
sed -i '/\/\* COMMENTED OUT/,/\*\//d' nano-test.html

# Step 9: Remove backend API URL references
echo "🗑️  Removing backend API calls..."
sed -i 's|http://localhost:3001/api/generate|// REMOVED: backend API|g' nano-test.html
sed -i 's|http://localhost:3001/generate|// REMOVED: backend API|g' nano-test.html

echo "✅ Cleanup complete!"
echo "📊 Final: $(wc -l < nano-test.html) lines"
echo "📉 Reduction: $(($(wc -l < nano-test.backup.html) - $(wc -l < nano-test.html))) lines removed"
