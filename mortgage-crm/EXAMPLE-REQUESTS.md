# Mortgage CRM - Example API Requests

Complete collection of example requests for testing and using the Mortgage CRM system.

---

## Quick Start

**Server URL:** `http://localhost:3001`

**Authentication:** None required for local development

---

## Table of Contents

1. [Health & Status Checks](#health--status-checks)
2. [Model Discovery](#model-discovery)
3. [Rate Update Images](#rate-update-images)
4. [Open House Promotions](#open-house-promotions)
5. [Testimonials](#testimonials)
6. [Market Updates](#market-updates)
7. [Just Closed Celebrations](#just-closed-celebrations)
8. [Quick Tips](#quick-tips)
9. [Holiday Greetings](#holiday-greetings)
10. [Performance & Analytics](#performance--analytics)

---

## Health & Status Checks

### 1. Server Health Check
```bash
curl http://localhost:3001/api/health
```

**Expected Response:**
```json
{
  "status": "operational",
  "service": "Mortgage CRM",
  "timestamp": "2025-11-02T18:30:00.000Z"
}
```

---

## Model Discovery

### 2. Get Available Models
```bash
curl http://localhost:3001/api/models
```

**Returns:** Array of 329+ models with:
- Model ID
- Category (text-to-image, video, photo, utility)
- Capabilities (fast, artistic, nmls-friendly, etc.)
- Run count and last used time

**Sample Response:**
```json
[
  {
    "id": "ideogram-ai/ideogram-v3",
    "category": "text-to-image",
    "capabilities": ["nmls-friendly", "artistic", "text-rendering"],
    "runCount": 1250,
    "lastRunTime": "2025-11-02T15:20:00Z"
  }
]
```

---

## Rate Update Images

### 3. Simple Rate Update
```bash
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "type": "rate-update",
    "message": "Great news! 30-year fixed rates just dropped to 6.25%",
    "loanOfficer": {
      "name": "Sarah Johnson",
      "nmls": "234567",
      "phone": "(555) 123-4567",
      "email": "sarah@lendwise.com"
    }
  }'
```

### 4. Rate Update with Custom Styling
```bash
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type": application/json" \
  -d '{
    "type": "rate-update",
    "message": "15-year fixed rate now at 5.75% - Perfect time to refinance!",
    "loanOfficer": {
      "name": "Michael Chen",
      "nmls": "345678",
      "phone": "(555) 234-5678",
      "email": "michael@lendwise.com"
    },
    "preferences": {
      "style": "professional",
      "fastMode": false
    }
  }'
```

### 5. FHA Rate Special
```bash
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "type": "rate-update",
    "message": "FHA loans starting at 5.99% - First-time buyers welcome!",
    "loanOfficer": {
      "name": "Jessica Martinez",
      "nmls": "456789",
      "phone": "(555) 345-6789",
      "email": "jessica@lendwise.com"
    }
  }'
```

---

## Open House Promotions

### 6. Weekend Open House
```bash
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "type": "open-house",
    "message": "Open House This Saturday! Beautiful 4BR/3BA in Sunset Hills. 123 Maple Drive, 1-4 PM",
    "loanOfficer": {
      "name": "David Lee",
      "nmls": "567890",
      "phone": "(555) 456-7890",
      "email": "david@lendwise.com"
    }
  }'
```

### 7. Luxury Property Showing
```bash
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "type": "open-house",
    "message": "Exclusive Showing: Waterfront Estate - Sunday 2-5 PM. Pre-approval required.",
    "loanOfficer": {
      "name": "Amanda Foster",
      "nmls": "678901",
      "phone": "(555) 567-8901",
      "email": "amanda@lendwise.com"
    },
    "preferences": {
      "style": "luxury"
    }
  }'
```

---

## Testimonials

### 8. Happy Client Testimonial
```bash
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "type": "testimonial",
    "message": "Sarah made our dream home a reality! Her expertise and patience were amazing. - The Johnson Family",
    "loanOfficer": {
      "name": "Sarah Johnson",
      "nmls": "234567",
      "phone": "(555) 123-4567",
      "email": "sarah@lendwise.com"
    }
  }'
```

### 9. First-Time Buyer Success
```bash
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "type": "testimonial",
    "message": "As first-time buyers, we were nervous. Michael guided us every step and got us an amazing rate! - Alex & Jordan",
    "loanOfficer": {
      "name": "Michael Chen",
      "nmls": "345678",
      "phone": "(555) 234-5678",
      "email": "michael@lendwise.com"
    }
  }'
```

---

## Market Updates

### 10. Market Trend Report
```bash
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "type": "market-update",
    "message": "November Market Report: Inventory up 15%, rates stabilizing. Great time for buyers!",
    "loanOfficer": {
      "name": "Jessica Martinez",
      "nmls": "456789",
      "phone": "(555) 345-6789",
      "email": "jessica@lendwise.com"
    }
  }'
```

### 11. Fed Rate Announcement
```bash
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "type": "market-update",
    "message": "Fed holds rates steady - Mortgage rates expected to remain favorable through year-end",
    "loanOfficer": {
      "name": "David Lee",
      "nmls": "567890",
      "phone": "(555) 456-7890",
      "email": "david@lendwise.com"
    }
  }'
```

---

## Just Closed Celebrations

### 12. Celebrate New Homeowners
```bash
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "type": "just-closed",
    "message": "Congratulations to the Martinez family on their new home! Welcome to the neighborhood!",
    "loanOfficer": {
      "name": "Amanda Foster",
      "nmls": "678901",
      "phone": "(555) 567-8901",
      "email": "amanda@lendwise.com"
    }
  }'
```

---

## Quick Tips

### 13. Mortgage Tip
```bash
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "type": "tip",
    "message": "Tip of the Day: Boost your credit score by paying down credit cards to below 30% utilization!",
    "loanOfficer": {
      "name": "Sarah Johnson",
      "nmls": "234567",
      "phone": "(555) 123-4567",
      "email": "sarah@lendwise.com"
    }
  }'
```

### 14. Home Buying Advice
```bash
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "type": "tip",
    "message": "Did You Know? Getting pre-approved gives you negotiating power and speeds up closing!",
    "loanOfficer": {
      "name": "Michael Chen",
      "nmls": "345678",
      "phone": "(555) 234-5678",
      "email": "michael@lendwise.com"
    }
  }'
```

---

## Holiday Greetings

### 15. Thanksgiving Message
```bash
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "type": "holiday",
    "message": "Wishing you and your family a wonderful Thanksgiving filled with gratitude and joy!",
    "loanOfficer": {
      "name": "Jessica Martinez",
      "nmls": "456789",
      "phone": "(555) 345-6789",
      "email": "jessica@lendwise.com"
    },
    "preferences": {
      "style": "warm"
    }
  }'
```

---

## Performance & Analytics

### 16. Get Performance Metrics
```bash
curl http://localhost:3001/api/performance
```

**Returns:**
```json
{
  "topModels": [
    {
      "model": "ideogram-ai/ideogram-v3",
      "uses": 45,
      "quality": 0.92
    }
  ],
  "intentStats": {
    "rate-update": { "total": 120, "avgQuality": 0.88 },
    "open-house": { "total": 45, "avgQuality": 0.91 }
  },
  "totalGenerations": 245,
  "averageQuality": 0.89
}
```

---

## Advanced Features

### 17. Fast Mode (Quick Generation)
```bash
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "type": "rate-update",
    "message": "Rates update: 30-year at 6.5%",
    "loanOfficer": {
      "name": "Quick Test",
      "nmls": "123456"
    },
    "preferences": {
      "fastMode": true
    }
  }'
```
*Uses fastest available models (30-45 seconds vs 60-120 seconds)*

### 18. Skip Cache (Force New Generation)
```bash
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "type": "rate-update",
    "message": "Rates at 6.5%",
    "loanOfficer": {
      "name": "Test User",
      "nmls": "123456"
    },
    "preferences": {
      "skipCache": true
    }
  }'
```
*Bypasses cache to generate new image*

### 19. Test Mode (No Cost)
```bash
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "type": "rate-update",
    "message": "Test generation",
    "loanOfficer": {
      "name": "Test",
      "nmls": "000000"
    },
    "preferences": {
      "testMode": true,
      "testId": "test-' + Date.now() + '"
    }
  }'
```
*For testing without impacting production metrics*

---

## Response Format

All generation requests return:

```json
{
  "success": true,
  "output": "https://replicate.delivery/...",
  "model": "ideogram-ai/ideogram-v3",
  "cached": false,
  "hitCount": 1,
  "validation": {
    "overall": 0.92,
    "ocr": { "score": 0.95, "confidence": 0.95 },
    "spelling": { "score": 1.0, "errors": [] },
    "compliance": { "score": 0.88, "nmlsFound": true }
  },
  "generationTime": 45.2,
  "cost": 0.032
}
```

---

## Error Handling

### Common Errors

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Missing required field: loanOfficer.nmls"
}
```

**500 Server Error:**
```json
{
  "success": false,
  "error": "Generation failed: Model timeout"
}
```

---

## Testing Workflow

### 1. Quick Health Check
```bash
npm run test:quick
```

### 2. Full E2E Test
```bash
npm run test:e2e
```

### 3. Component Tests
```bash
npm run test:ocr          # Test OCR service
npm run test:firecrawl    # Test market data
npm run test:db           # Test database
```

---

## Tips for Best Results

1. **NMLS Number**: Always include a valid NMLS number for compliance
2. **Clear Messages**: Be specific about rates, dates, and locations
3. **Fast Mode**: Use for quick drafts and testing
4. **Quality Mode**: Disable fast mode for final production images
5. **Caching**: Let the system cache - identical requests return instantly
6. **Validation**: Check validation scores - aim for >0.85 for production

---

## Cost Optimization

### Estimated Costs (per generation)
- **Fast Models:** $0.01 - $0.03
- **Quality Models:** $0.03 - $0.08
- **Video Models:** $0.10 - $0.30

### Save Money:
1. Use caching (automatic)
2. Enable fast mode for drafts
3. Use test mode for development
4. Monitor performance metrics

---

## Postman Collection

Import this JSON to get started with Postman:

```json
{
  "info": {
    "name": "Mortgage CRM API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "http://localhost:3001/api/health"
      }
    },
    {
      "name": "Generate Rate Update",
      "request": {
        "method": "POST",
        "url": "http://localhost:3001/api/generate",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"type\":\"rate-update\",\"message\":\"30-year fixed at 6.25%\",\"loanOfficer\":{\"name\":\"Test User\",\"nmls\":\"123456\"}}"
        }
      }
    }
  ]
}
```

---

## Need Help?

- **Documentation:** `TESTING-SUMMARY.md`
- **Setup:** `DATABASE-SETUP.md`
- **Troubleshooting:** Check server logs with `npm run dev`
- **Issues:** Review validation scores and error messages

---

Last updated: November 2, 2025
