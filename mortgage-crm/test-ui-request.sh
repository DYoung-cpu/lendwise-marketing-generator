#!/bin/bash

# Test the exact format the UI sends

curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "type": "rate-update",
    "message": "Great news! 30-year fixed rates dropped to 6.25%",
    "loanOfficer": {
      "name": "David Young",
      "nmls": "123456",
      "phone": "(555) 123-4567",
      "email": "david@lendwise.com"
    },
    "preferences": {
      "fastMode": true,
      "skipCache": false
    }
  }'
