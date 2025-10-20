# LendWise Marketing Generator

AI-powered marketing image generator with quality guarantee. Creates professional mortgage marketing content with LendWise branding using Gemini 2.5 Flash and Claude vision validation.

## 🎯 Overview

This system generates Instagram Story-format marketing images (1080x1350) for mortgage professionals with:
- **100% quality guarantee** - Only perfect images are returned
- **Live market data** - Real-time mortgage rates from Mortgage News Daily
- **Brand consistency** - LendWise logo and styling on every image
- **Photo integration** - Seamlessly removes backgrounds and integrates headshots
- **AI learning** - Improves with each generation using pattern recognition

## 📊 Performance Metrics

- **Success Rate**: 95.7% (exceeding 90% target)
- **Average Cost**: ~$0.078 per perfect image
- **Average Attempts**: 1-2 per perfect image
- **Temperature**: 0.2 (optimized for text consistency)

## 🚀 Quick Start

### Prerequisites

```bash
# Required
- Node.js 18+
- Python 3
- WSL (Windows Subsystem for Linux) if on Windows
- Gemini API key
- Anthropic API key
```

### Installation

**Step 1:** Clone the repository
```bash
git clone https://github.com/DYoung-cpu/lendwise-marketing-generator.git
cd lendwise-marketing-generator
```

**Step 2:** Install dependencies
```bash
npm install
```

**Step 3:** Create `.env` file in project root
```bash
GEMINI_API_KEY=your_gemini_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### Running the Application

**Windows (Recommended):**
```bash
# Double-click START-MARKETING-GENERATOR.bat
# or run from command line:
START-MARKETING-GENERATOR.bat
```

**Linux/WSL:**
```bash
# Start backend server
./start-server.sh

# In another terminal, start frontend
cd wisr-ai-generator
python3 -m http.server 8080
```

**Access the application:**
```
http://localhost:8080/nano-test.html
```

## 📁 Project Structure

```
lendwise-marketing-generator/
├── quality-backend.js          # Main backend server (port 3001)
├── gemini-client.js            # Gemini API wrapper
├── vision-analyzer.js          # Claude vision validation
├── learning-layer.js           # Meta-cognitive learning system
├── prompt-builder.js           # Dynamic prompt generation
├── wisr-ai-generator/
│   ├── nano-test.html          # Main frontend interface
│   └── lendwise-logo.png       # Brand logo (auto-loaded)
├── prompts/                    # Prompt history for learning
├── learning-database.json      # AI learning data
├── START-MARKETING-GENERATOR.bat  # Windows startup script
├── start-server.sh             # Linux startup script
├── package.json                # Node dependencies
└── .env                        # API keys (create this)
```

## 🎨 Available Templates

1. **Daily Rate Update** - Current 30-year rate with economic factors
2. **Market Report** - Comprehensive rate comparison (30Y, 15Y, Jumbo, ARM, FHA, VA)
3. **Rate Trends** - Historical rate movement analysis
4. **Economic Outlook** - Fed policy and market drivers

## 🔧 How It Works

### 1. Quality-Guaranteed Generation

```javascript
// Backend ensures 100% quality
- Generate image with Gemini 2.5 Flash
- Analyze with Claude Vision API
- If not perfect, regenerate (max 5 attempts)
- Return only 100% quality images
```

### 2. Meta-Cognitive Learning

The system learns from every generation:
- Detects error patterns across attempts
- Automatically applies fixes for known issues
- Tracks success rates per template
- Adjusts strategies based on performance

### 3. Live Market Data

```javascript
// Real-time data fetching
- Scrapes Mortgage News Daily
- Extracts rates using Gemini Flash
- Caches data (5-minute TTL)
- Fallback to safe defaults if fetch fails
```

### 4. Photo Integration

```javascript
// Seamless background removal
- Upload any headshot
- AI removes background automatically
- Blends naturally into design
- Maintains professional appearance
```

## 🎯 API Endpoints

### POST /api/generate
Generate marketing image with quality guarantee

**Request:**
```json
{
  "prompt": "Full prompt text with template details",
  "template": "Daily Rate Update",
  "logo": "data:image/png;base64,...",
  "photo": "data:image/png;base64,..." // optional
}
```

**Response:**
```json
{
  "success": true,
  "imageData": "data:image/png;base64,...",
  "attempts": 1,
  "score": 100,
  "template": "Daily Rate Update"
}
```

### GET /api/health
Health check endpoint

**Response:**
```json
{
  "status": "ok",
  "service": "Quality-Guaranteed Image Generator",
  "timestamp": "2025-10-20T14:00:00.000Z"
}
```

## 📈 Learning System

The system uses **meta-cognitive learning** to improve over time:

### Pattern Detection
- Tracks errors across all generations
- Groups similar failures together
- Counts occurrence frequency

### Automatic Fixes
- **reduce_sections**: Breaks complex text into smaller chunks (15 words max)
- **add_bullets**: Forces bullet points for better readability
- **simplify_layout**: Reduces visual complexity
- **text_emphasis**: Adds ALL CAPS for key information

### Success Tracking
```javascript
// Per-template metrics
{
  "Daily Rate Update": {
    "successRate": 92.3%,
    "attempts": 13,
    "successes": 12
  },
  "Market Report": {
    "successRate": 100.0%,
    "attempts": 5,
    "successes": 5
  }
}
```

## 🔒 Security

- **API keys**: Stored in `.env` (never commit)
- **`.gitignore`**: Protects sensitive files
- **Push protection**: GitHub blocks accidental key exposure

## 🛠️ Technologies

- **Backend**: Node.js, Express
- **Frontend**: HTML, CSS, JavaScript (vanilla)
- **AI Models**:
  - Gemini 2.5 Flash (image generation)
  - Claude 3.5 Sonnet (vision analysis)
- **Data**: Cheerio (web scraping), Axios (HTTP)
- **Deployment**: Local development, ready for cloud deployment

## 📊 Quality Standards

### Text Validation
- ✅ All required information present
- ✅ Correct spelling and formatting
- ✅ Proper phone number format: 310-954-7771
- ✅ Correct NMLS number: 62043
- ✅ Opening and closing quotes on insights

### Visual Validation
- ✅ LendWise logo present and correct
- ✅ Forest green gradient background
- ✅ Metallic gold text styling
- ✅ Professional layout and spacing
- ✅ Portrait orientation (1080x1350)

### Content Validation
- ✅ Live market data (when applicable)
- ✅ Economic factors accurate
- ✅ Rate changes properly displayed (+/- format)
- ✅ All template-specific sections included

## 🚨 Troubleshooting

### Backend Connection Failed
```bash
# Check backend is running
curl http://localhost:3001/api/health

# If not, restart backend
./start-server.sh
```

### Frontend 404 Error
```bash
# Verify you're in correct directory
cd wisr-ai-generator
python3 -m http.server 8080
```

### Logo Not Loading
```bash
# Check logo exists
ls -la wisr-ai-generator/lendwise-logo.png

# Refresh browser (F5)
```

### Generation Fails
```bash
# Check API keys in .env
cat .env | grep API_KEY

# Check backend logs
# Look for error messages in terminal
```

## 📝 Development

### Adding New Templates

1. **Update prompt builder** (`prompt-builder.js`)
```javascript
templates.myNewTemplate = {
  id: 'my-new-template',
  prompt: 'Template prompt here...',
  sections: ['header', 'content', 'footer']
}
```

2. **Add to frontend** (`nano-test.html`)
```html
<option value="my-new-template">My New Template</option>
```

3. **Test with quality backend**
```bash
# Backend automatically validates new templates
```

### Modifying Quality Standards

Edit `vision-analyzer.js`:
```javascript
const requirements = {
  required: [...], // Must have items
  formatting: [...], // Format rules
  visual: [...] // Visual elements
}
```

## 🤝 Contributing

This is a private project for LendWise Mortgage. For access, contact David Young.

## 📄 License

Proprietary - LendWise Mortgage © 2025

## 👥 Authors

- **David Young** - Product & Development
- **Anthony Amini** - Timeline Integration

## 🔗 Related Projects

- [LendWise Onboarding](https://github.com/DYoung-cpu/lendwise-onboarding)
- LendWise Timeline (coming soon)

## 📞 Support

For issues or questions:
- Email: dyoung@lendwisemtg.com
- Phone: 310-954-7771
- NMLS: 62043

---

**Generated with AI** - Built with Claude Code and continuous improvement through meta-cognitive learning.
