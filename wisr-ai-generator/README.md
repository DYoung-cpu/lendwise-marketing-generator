# Marketing Generator

AI-powered marketing material generator for mortgage loan officers. Creates professional, on-brand marketing images with guaranteed text accuracy.

## Quick Start

### Option 1: Use the Startup Script (Recommended)
From the project root, double-click:
```
START-MARKETING-GENERATOR.bat
```

This will automatically:
- Start the backend server (port 3001)
- Start the frontend server (port 8080)
- Open your browser to the Marketing Generator

### Option 2: Manual Start
1. Start backend (from project root):
   ```bash
   node quality-backend.js
   ```

2. Start frontend (from this directory):
   ```bash
   python3 -m http.server 8080
   ```

3. Open browser to:
   ```
   http://localhost:8080/nano-test.html
   ```

## How to Use

1. **Logo Auto-Loads** - Brand logo loads automatically on page load
2. **Select Template** - Choose from 21 professionally crafted templates
3. **Upload Photo** (Optional) - Add your headshot if desired
4. **Click Initialize** - Generate your marketing material in seconds
5. **Download** - Save your perfect, ready-to-post image

## Project Structure

```
wisr-ai-generator/           ← Marketing Generator Frontend
├── nano-test.html           ← Main application (7,882 lines)
├── lendwise-logo.png        ← Brand logo (auto-loaded)
├── wisr-owl.mp4             ← Animated mascot
├── .claude/                 ← Project memory & agent configs
│   └── project-memory.md    ← Complete project documentation
└── archive/                 ← Old iterations (archived for reference)
```

## Features

- **21 Marketing Templates** - Pre-crafted prompts for every scenario
- **Vision AI Verification** - Ensures text accuracy
- **Learning Agent** - Improves with each generation
- **Auto-Retry System** - Fixes common issues automatically
- **90%+ Success Rate** - Professional quality guaranteed

## Tech Stack

- **Frontend**: HTML5 + Fabric.js 5.3.0 + JavaScript
- **Backend**: Node.js + Gemini 2.5 Flash Image API
- **Vision**: Gemini 2.0 Flash (text verification)
- **Learning**: Browser localStorage + agent memory

## Performance Metrics

- Success Rate: 90.9%
- Average Time: 5 seconds per image
- Cost: ~$0.078 per perfect image
- Template Coverage: 21 scenarios

## Documentation

For complete technical documentation, architecture details, and troubleshooting:
- See `.claude/project-memory.md`
- See main `README-MARKETING-GENERATOR.md` in project root

## For Your Partner

This is the production version - all test files, old iterations, and experimental code have been moved to the `archive/` folder. The main file (`nano-test.html`) is fully self-contained and production-ready.

---

**Created**: October 2025
**Last Cleaned**: October 20, 2025
**Repository**: https://github.com/DYoung-cpu/lendwise-marketing-generator
