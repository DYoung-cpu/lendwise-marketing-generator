# Marketing Generator - Quick Start Guide

## After Restart

**Double-click:** `START-MARKETING-GENERATOR.bat`

This will:
1. ✅ Start backend server (port 3001)
2. ✅ Start frontend server (port 8080)
3. ✅ Open browser to http://localhost:8080/nano-test.html

## What You'll See

Two terminal windows will open:
- **"Marketing Generator Backend"** - Keep this open
- **"Marketing Generator Frontend"** - Keep this open

Your browser will open to the Marketing Generator.

## Using the Generator

1. **Logo**: Auto-loads on page load (✅ Brand logo loaded successfully!)
2. **Template**: Select from dropdown (Daily Rate Update, Market Report, etc)
3. **Photo** (optional): Click "Upload Photo" to add your headshot
4. **Generate**: Click button - owl particles spin while generating
5. **Result**: 100% quality-checked image appears

## Success Metrics

- **Success Rate**: 90.9% (exceeding 90% target)
- **Temperature**: 0.2 (optimized)
- **Average Attempts**: 2 per perfect image
- **Cost**: ~$0.078 per perfect image

## Troubleshooting

**"Failed to fetch" error:**
- Make sure both terminal windows are still open
- Backend should show: `✅ Server running on http://localhost:3001`
- Frontend should show: `Serving HTTP on :: port 8080`

**Logo doesn't load:**
- Check browser console (F12) for: `✅ Brand logo loaded successfully!`
- If missing, refresh page (F5)

**Generation fails:**
- Check backend terminal for errors
- Verify API keys are set (in .env file)
- Try again - system auto-fixes common issues

## Files in Repo

```
/mnt/c/Users/dyoun/Active Projects/
├── quality-backend.js        # Backend server (port 3001)
├── gemini-client.js          # Gemini API wrapper
├── vision-analyzer.js        # Claude vision validation
├── learning-layer.js         # Learning system
├── prompt-builder.js         # Prompt generation
├── package.json              # Dependencies
├── .env                      # API keys
├── start-server.sh           # Linux startup
├── START-MARKETING-GENERATOR.bat  # Windows startup ← USE THIS
└── wisr-ai-generator/
    ├── nano-test.html        # Main frontend
    ├── lendwise-logo.png     # Auto-loaded logo
    └── ...
```

## Server URLs

- **Frontend**: http://localhost:8080/nano-test.html
- **Backend**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## Next Session

Just double-click `START-MARKETING-GENERATOR.bat` and you're ready to go!
