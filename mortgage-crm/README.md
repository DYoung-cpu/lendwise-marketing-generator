# Mortgage CRM - LendWise Marketing Platform

## Setup Instructions

1. **Clone and Install**
```bash
cd mortgage-crm
npm install
```

2. **Configure Environment**
```bash
cp .env.example .env
# Add your API keys to .env
```

3. **Run Pre-flight Checks**
```bash
npm run preflight
```

4. **Start Development Server**
```bash
npm run dev
```

5. **Open UI**
Navigate to: http://localhost:3001

## Features

- ✅ Intelligent prompt analysis
- ✅ Automatic model selection from Replicate catalog
- ✅ LendWise brand application
- ✅ Market data integration via Firecrawl
- ✅ Quality validation (OCR, spelling, compliance)
- ✅ Learning system with perpetual memory
- ✅ No hardcoded user data

## Architecture

- **Master Orchestrator**: Analyzes intent and coordinates agents
- **Data Agent**: Fetches market data via Firecrawl
- **Visual Agent**: Generates images/videos via Replicate
- **Personalization Agent**: Handles loan officer customization
- **Quality Agent**: Validates output quality
- **Learning System**: Records and learns from outcomes
- **Brand Generator**: Applies LendWise branding dynamically

## Testing
```bash
npm test        # Run tests
npm run lint    # Check code quality
npm run cleanup # Find old code
```

## API Endpoints

- `POST /api/generate` - Generate marketing content
- `GET /api/models` - List available models
- `GET /api/performance` - View learning metrics
- `GET /api/health` - System health check

## Project Structure

```
mortgage-crm/
├── package.json
├── .env.example
├── .eslintrc.json
├── .gitignore
├── jest.config.js
├── README.md
├── src/
│   ├── server.js
│   ├── orchestrator/
│   │   └── master-orchestrator.js
│   ├── agents/
│   │   ├── data-agent.js
│   │   ├── visual-agent.js
│   │   ├── personalization-agent.js
│   │   └── quality-agent.js
│   ├── models/
│   │   └── replicate-catalog.js
│   ├── validators/
│   │   ├── ocr-service.js
│   │   ├── spelling-validator.js
│   │   └── compliance-validator.js
│   ├── memory/
│   │   └── learning-system.js
│   ├── brand/
│   │   └── brand-generator.js
│   └── ui/
│       └── index.html
├── scripts/
│   ├── preflight.js
│   ├── cleanup.js
│   └── health-check.js
└── tests/
    └── orchestrator.test.js
```

## Quick Start

The system is designed to work out-of-the-box with minimal configuration:

1. Only `REPLICATE_API_TOKEN` is required
2. Supabase and Firecrawl are optional enhancements
3. No hardcoded user data anywhere in the system
4. Intelligent model selection happens automatically
5. Quality validation runs on all outputs

## Usage Examples

### Rate Update
```javascript
{
  "prompt": "Create daily rate update with NMLS 123456",
  "useMarketData": true
}
```

### Property Listing
```javascript
{
  "prompt": "Create property listing for 3bed/2bath suburban home",
  "includeLoanOfficer": true,
  "loanOfficer": {
    "name": "John Smith",
    "nmls": "123456",
    "phone": "555-0100"
  }
}
```

### Social Media Post
```javascript
{
  "prompt": "Create engaging social media post about refinancing",
  "useMarketData": true
}
```

## Development

The system includes:
- Hot reload with nodemon
- Pre-flight checks before starting
- Code linting and formatting
- Automated tests
- Health monitoring

## Quality Assurance

All generated content goes through:
1. OCR text extraction
2. Spelling validation
3. Compliance checking
4. Quality scoring

Results are recorded in the learning system for continuous improvement.

## Support

For issues or questions:
- Check the health endpoint: `GET /api/health`
- Run diagnostics: `npm run health`
- Review logs in the console
