#!/usr/bin/env python3
"""
15-Word Formula Bulletproof Test Suite
Executes 20 systematic tests to validate text rendering accuracy
"""

import json
import base64
import time
import os
from datetime import datetime
from typing import Dict, List, Optional
import requests

# Test definitions from bulletproof-test.html
TEST_DEFINITIONS = [
    # BATCH 1: Thin Lines Method (5 tests)
    {
        "batch": 1,
        "batchName": "BATCH 1: Thin Lines Method",
        "name": "Market Update, 3x15 words, with photo",
        "method": "thin horizontal gold lines",
        "template": "Market Update",
        "withPhoto": True,
        "prompt": """Create a professional mortgage market update showing current rates. Seamlessly integrate my photo into the design - remove the background and blend me naturally into the composition. Include LendWise logo. Forest green gradient background with metallic gold accents. Use thin horizontal gold lines to separate sections.

SECTION 1 (15 words): Current thirty year rate six point three eight percent up two basis points from yesterday strong market conditions.
SECTION 2 (15 words): Contact David Young NMLS 62043 Phone 310-954-7771 for quick response call now or visit our office today.
SECTION 3 (15 words): We help you find the right loan program that fits your needs and budget goals available now.

Portrait 1080x1350.""",
        "expectedWords": ["Current", "thirty", "year", "rate", "six", "point", "three", "eight", "percent", "up", "two", "basis", "points", "from", "yesterday", "Contact", "David", "Young", "NMLS", "62043", "Phone", "310-954-7771", "for", "quick", "response", "call", "now", "or", "visit", "our", "office", "today", "We", "help", "you", "find", "the", "right", "loan", "program", "that", "fits", "your", "needs", "and", "budget", "goals", "available"]
    },
    {
        "batch": 1,
        "batchName": "BATCH 1: Thin Lines Method",
        "name": "Market Update, 3x15 words, no photo",
        "method": "thin horizontal gold lines",
        "template": "Market Update",
        "withPhoto": False,
        "prompt": """Create a professional mortgage market update showing current rates. Include LendWise logo. Forest green gradient background with metallic gold accents. Use thin horizontal gold lines to separate sections.

SECTION 1 (15 words): Current thirty year rate six point three eight percent up two basis points from yesterday strong market conditions.
SECTION 2 (15 words): Fifteen year rate five point eight eight percent showing minimal change from prior session holding firm today stable.
SECTION 3 (15 words): Contact David Young NMLS 62043 Phone 310-954-7771 for quick response call now or visit our office today.

Portrait 1080x1350.""",
        "expectedWords": ["Current", "thirty", "year", "rate", "six", "point", "three", "eight", "percent", "up", "two", "basis", "points", "from", "yesterday", "Fifteen", "five", "showing", "minimal", "change", "prior", "session", "holding", "firm", "stable", "Contact", "David", "Young", "NMLS", "62043", "Phone", "310-954-7771", "for", "quick", "response", "call", "now", "or", "visit", "our", "office", "today"]
    },
    {
        "batch": 1,
        "batchName": "BATCH 1: Thin Lines Method",
        "name": "Rate Trends, 3x15 words, with photo",
        "method": "thin horizontal gold lines",
        "template": "Rate Trends",
        "withPhoto": True,
        "prompt": """Create a professional mortgage rate trends chart. Seamlessly integrate my photo into the design - remove the background and blend me naturally into the composition. Include LendWise logo. Forest green gradient background with metallic gold accents. Use thin horizontal gold lines to separate sections.

SECTION 1 (15 words): Mortgage rates showing minimal movement over past three weeks holding within narrow range consistent stable market performance overall.
SECTION 2 (15 words): Include simple rate trend chart with arrows showing direction for thirty year fifteen year and jumbo loan programs.
SECTION 3 (15 words): Contact David Young NMLS 62043 Phone 310-954-7771 for quick response call now or visit our office today.

Portrait 1080x1350.""",
        "expectedWords": ["Mortgage", "rates", "showing", "minimal", "movement", "over", "past", "three", "weeks", "holding", "within", "narrow", "range", "consistent", "stable", "Include", "simple", "trend", "chart", "with", "arrows", "direction", "for", "thirty", "year", "fifteen", "and", "jumbo", "loan", "programs", "Contact", "David", "Young", "NMLS", "62043", "Phone", "310-954-7771", "quick", "response", "call", "now", "or", "visit", "our", "office", "today"]
    },
    {
        "batch": 1,
        "batchName": "BATCH 1: Thin Lines Method",
        "name": "Economic Outlook, 3x15 words, with photo",
        "method": "thin horizontal gold lines",
        "template": "Economic Outlook",
        "withPhoto": True,
        "prompt": """Create a professional economic outlook. Seamlessly integrate my photo into the design - remove the background and blend me naturally into the composition. Include LendWise logo. Forest green gradient background with metallic gold accents. Use thin horizontal gold lines to separate sections.

SECTION 1 (15 words): Current thirty year fixed rate six point three eight percent reflecting recent Federal Reserve policy decisions and inflation data.
SECTION 2 (15 words): Key factors include employment strength housing inventory levels consumer spending patterns and ongoing economic indicators monitoring inflation trends closely.
SECTION 3 (15 words): Contact David Young NMLS 62043 Phone 310-954-7771 for quick response call now or visit our office today.

Portrait 1080x1350.""",
        "expectedWords": ["Current", "thirty", "year", "fixed", "rate", "six", "point", "three", "eight", "percent", "reflecting", "recent", "Federal", "Reserve", "policy", "Key", "factors", "include", "employment", "strength", "housing", "inventory", "levels", "consumer", "spending", "patterns", "ongoing", "economic", "indicators", "monitoring", "inflation", "trends", "closely", "Contact", "David", "Young", "NMLS", "62043", "Phone", "310-954-7771", "for", "quick", "response", "call", "now", "or", "visit", "our", "office", "today"]
    },
    {
        "batch": 1,
        "batchName": "BATCH 1: Thin Lines Method",
        "name": "Custom content, 3x15 words, with photo",
        "method": "thin horizontal gold lines",
        "template": "Custom",
        "withPhoto": True,
        "prompt": """Create a professional mortgage marketing image. Seamlessly integrate my photo into the design - remove the background and blend me naturally into the composition. Include LendWise logo. Forest green gradient background with metallic gold accents. Use thin horizontal gold lines to separate sections.

SECTION 1 (15 words): Looking for better rates on your home loan refinance purchase programs available through our team expert guidance provided.
SECTION 2 (15 words): We offer conventional FHA VA jumbo and ARM loan programs tailored to your specific financial situation and goals.
SECTION 3 (15 words): Contact David Young NMLS 62043 Phone 310-954-7771 for quick response call now or visit our office today.

Portrait 1080x1350.""",
        "expectedWords": ["Looking", "for", "better", "rates", "on", "your", "home", "loan", "refinance", "purchase", "programs", "available", "through", "our", "team", "We", "offer", "conventional", "FHA", "VA", "jumbo", "and", "ARM", "tailored", "to", "specific", "financial", "situation", "goals", "Contact", "David", "Young", "NMLS", "62043", "Phone", "310-954-7771", "quick", "response", "call", "now", "or", "visit", "office", "today"]
    },
    # BATCH 2: Shadow Method (5 tests)
    {
        "batch": 2,
        "batchName": "BATCH 2: Shadow Method",
        "name": "Market Update, 3x15 words, with photo",
        "method": "floating shadow effect",
        "template": "Market Update",
        "withPhoto": True,
        "prompt": """Create a professional mortgage market update showing current rates. Seamlessly integrate my photo into the design - remove the background and blend me naturally into the composition. Include LendWise logo. Forest green gradient background with metallic gold accents. Use subtle dark shadow beneath each section and offset to right to create floating effect.

SECTION 1 (15 words): Current thirty year rate six point three eight percent up two basis points from yesterday strong market conditions.
SECTION 2 (15 words): Contact David Young NMLS 62043 Phone 310-954-7771 for quick response call now or visit our office today.
SECTION 3 (15 words): We help you find the right loan program that fits your needs and budget goals available now.

Portrait 1080x1350.""",
        "expectedWords": ["Current", "thirty", "year", "rate", "six", "point", "three", "eight", "percent", "up", "two", "basis", "points", "from", "yesterday", "Contact", "David", "Young", "NMLS", "62043", "Phone", "310-954-7771", "for", "quick", "response", "call", "now", "or", "visit", "our", "office", "today", "We", "help", "you", "find", "the", "right", "loan", "program", "that", "fits", "your", "needs", "and", "budget", "goals", "available"]
    },
    {
        "batch": 2,
        "batchName": "BATCH 2: Shadow Method",
        "name": "Market Update, 3x15 words, no photo",
        "method": "floating shadow effect",
        "template": "Market Update",
        "withPhoto": False,
        "prompt": """Create a professional mortgage market update showing current rates. Include LendWise logo. Forest green gradient background with metallic gold accents. Use subtle dark shadow beneath each section and offset to right to create floating effect.

SECTION 1 (15 words): Current thirty year rate six point three eight percent up two basis points from yesterday strong market conditions.
SECTION 2 (15 words): Fifteen year rate five point eight eight percent showing minimal change from prior session holding firm today stable.
SECTION 3 (15 words): Contact David Young NMLS 62043 Phone 310-954-7771 for quick response call now or visit our office today.

Portrait 1080x1350.""",
        "expectedWords": ["Current", "thirty", "year", "rate", "six", "point", "three", "eight", "percent", "up", "two", "basis", "points", "from", "yesterday", "Fifteen", "five", "showing", "minimal", "change", "prior", "session", "holding", "firm", "stable", "Contact", "David", "Young", "NMLS", "62043", "Phone", "310-954-7771", "for", "quick", "response", "call", "now", "or", "visit", "our", "office", "today"]
    },
    {
        "batch": 2,
        "batchName": "BATCH 2: Shadow Method",
        "name": "Rate Trends, 3x15 words, with photo",
        "method": "floating shadow effect",
        "template": "Rate Trends",
        "withPhoto": True,
        "prompt": """Create a professional mortgage rate trends chart. Seamlessly integrate my photo into the design - remove the background and blend me naturally into the composition. Include LendWise logo. Forest green gradient background with metallic gold accents. Use subtle dark shadow beneath each section and offset to right to create floating effect.

SECTION 1 (15 words): Mortgage rates showing minimal movement over past three weeks holding within narrow range consistent stable market performance overall.
SECTION 2 (15 words): Include simple rate trend chart with arrows showing direction for thirty year fifteen year and jumbo loan programs.
SECTION 3 (15 words): Contact David Young NMLS 62043 Phone 310-954-7771 for quick response call now or visit our office today.

Portrait 1080x1350.""",
        "expectedWords": ["Mortgage", "rates", "showing", "minimal", "movement", "over", "past", "three", "weeks", "holding", "within", "narrow", "range", "consistent", "stable", "Include", "simple", "trend", "chart", "with", "arrows", "direction", "for", "thirty", "year", "fifteen", "and", "jumbo", "loan", "programs", "Contact", "David", "Young", "NMLS", "62043", "Phone", "310-954-7771", "quick", "response", "call", "now", "or", "visit", "our", "office", "today"]
    },
    {
        "batch": 2,
        "batchName": "BATCH 2: Shadow Method",
        "name": "Economic Outlook, 3x15 words, with photo",
        "method": "floating shadow effect",
        "template": "Economic Outlook",
        "withPhoto": True,
        "prompt": """Create a professional economic outlook. Seamlessly integrate my photo into the design - remove the background and blend me naturally into the composition. Include LendWise logo. Forest green gradient background with metallic gold accents. Use subtle dark shadow beneath each section and offset to right to create floating effect.

SECTION 1 (15 words): Current thirty year fixed rate six point three eight percent reflecting recent Federal Reserve policy decisions and inflation data.
SECTION 2 (15 words): Key factors include employment strength housing inventory levels consumer spending patterns and ongoing economic indicators monitoring inflation trends closely.
SECTION 3 (15 words): Contact David Young NMLS 62043 Phone 310-954-7771 for quick response call now or visit our office today.

Portrait 1080x1350.""",
        "expectedWords": ["Current", "thirty", "year", "fixed", "rate", "six", "point", "three", "eight", "percent", "reflecting", "recent", "Federal", "Reserve", "policy", "Key", "factors", "include", "employment", "strength", "housing", "inventory", "levels", "consumer", "spending", "patterns", "ongoing", "economic", "indicators", "monitoring", "inflation", "trends", "closely", "Contact", "David", "Young", "NMLS", "62043", "Phone", "310-954-7771", "for", "quick", "response", "call", "now", "or", "visit", "our", "office", "today"]
    },
    {
        "batch": 2,
        "batchName": "BATCH 2: Shadow Method",
        "name": "Custom content, 3x15 words, with photo",
        "method": "floating shadow effect",
        "template": "Custom",
        "withPhoto": True,
        "prompt": """Create a professional mortgage marketing image. Seamlessly integrate my photo into the design - remove the background and blend me naturally into the composition. Include LendWise logo. Forest green gradient background with metallic gold accents. Use subtle dark shadow beneath each section and offset to right to create floating effect.

SECTION 1 (15 words): Looking for better rates on your home loan refinance purchase programs available through our team expert guidance provided.
SECTION 2 (15 words): We offer conventional FHA VA jumbo and ARM loan programs tailored to your specific financial situation and goals.
SECTION 3 (15 words): Contact David Young NMLS 62043 Phone 310-954-7771 for quick response call now or visit our office today.

Portrait 1080x1350.""",
        "expectedWords": ["Looking", "for", "better", "rates", "on", "your", "home", "loan", "refinance", "purchase", "programs", "available", "through", "our", "team", "We", "offer", "conventional", "FHA", "VA", "jumbo", "and", "ARM", "tailored", "to", "specific", "financial", "situation", "goals", "Contact", "David", "Young", "NMLS", "62043", "Phone", "310-954-7771", "quick", "response", "call", "now", "or", "visit", "office", "today"]
    },
    # BATCH 3: Gradient Glow Method (5 tests)
    {
        "batch": 3,
        "batchName": "BATCH 3: Gradient Glow Method",
        "name": "Market Update, 3x15 words, with photo",
        "method": "gradient glow edges",
        "template": "Market Update",
        "withPhoto": True,
        "prompt": """Create a professional mortgage market update showing current rates. Seamlessly integrate my photo into the design - remove the background and blend me naturally into the composition. Include LendWise logo. Forest green gradient background with metallic gold accents. Use soft metallic gold gradient glow around edges of each section.

SECTION 1 (15 words): Current thirty year rate six point three eight percent up two basis points from yesterday strong market conditions.
SECTION 2 (15 words): Contact David Young NMLS 62043 Phone 310-954-7771 for quick response call now or visit our office today.
SECTION 3 (15 words): We help you find the right loan program that fits your needs and budget goals available now.

Portrait 1080x1350.""",
        "expectedWords": ["Current", "thirty", "year", "rate", "six", "point", "three", "eight", "percent", "up", "two", "basis", "points", "from", "yesterday", "Contact", "David", "Young", "NMLS", "62043", "Phone", "310-954-7771", "for", "quick", "response", "call", "now", "or", "visit", "our", "office", "today", "We", "help", "you", "find", "the", "right", "loan", "program", "that", "fits", "your", "needs", "and", "budget", "goals", "available"]
    },
    {
        "batch": 3,
        "batchName": "BATCH 3: Gradient Glow Method",
        "name": "Market Update, 3x15 words, no photo",
        "method": "gradient glow edges",
        "template": "Market Update",
        "withPhoto": False,
        "prompt": """Create a professional mortgage market update showing current rates. Include LendWise logo. Forest green gradient background with metallic gold accents. Use soft metallic gold gradient glow around edges of each section.

SECTION 1 (15 words): Current thirty year rate six point three eight percent up two basis points from yesterday strong market conditions.
SECTION 2 (15 words): Fifteen year rate five point eight eight percent showing minimal change from prior session holding firm today stable.
SECTION 3 (15 words): Contact David Young NMLS 62043 Phone 310-954-7771 for quick response call now or visit our office today.

Portrait 1080x1350.""",
        "expectedWords": ["Current", "thirty", "year", "rate", "six", "point", "three", "eight", "percent", "up", "two", "basis", "points", "from", "yesterday", "Fifteen", "five", "showing", "minimal", "change", "prior", "session", "holding", "firm", "stable", "Contact", "David", "Young", "NMLS", "62043", "Phone", "310-954-7771", "for", "quick", "response", "call", "now", "or", "visit", "our", "office", "today"]
    },
    {
        "batch": 3,
        "batchName": "BATCH 3: Gradient Glow Method",
        "name": "Rate Trends, 3x15 words, with photo",
        "method": "gradient glow edges",
        "template": "Rate Trends",
        "withPhoto": True,
        "prompt": """Create a professional mortgage rate trends chart. Seamlessly integrate my photo into the design - remove the background and blend me naturally into the composition. Include LendWise logo. Forest green gradient background with metallic gold accents. Use soft metallic gold gradient glow around edges of each section.

SECTION 1 (15 words): Mortgage rates showing minimal movement over past three weeks holding within narrow range consistent stable market performance overall.
SECTION 2 (15 words): Include simple rate trend chart with arrows showing direction for thirty year fifteen year and jumbo loan programs.
SECTION 3 (15 words): Contact David Young NMLS 62043 Phone 310-954-7771 for quick response call now or visit our office today.

Portrait 1080x1350.""",
        "expectedWords": ["Mortgage", "rates", "showing", "minimal", "movement", "over", "past", "three", "weeks", "holding", "within", "narrow", "range", "consistent", "stable", "Include", "simple", "trend", "chart", "with", "arrows", "direction", "for", "thirty", "year", "fifteen", "and", "jumbo", "loan", "programs", "Contact", "David", "Young", "NMLS", "62043", "Phone", "310-954-7771", "quick", "response", "call", "now", "or", "visit", "our", "office", "today"]
    },
    {
        "batch": 3,
        "batchName": "BATCH 3: Gradient Glow Method",
        "name": "Economic Outlook, 3x15 words, with photo",
        "method": "gradient glow edges",
        "template": "Economic Outlook",
        "withPhoto": True,
        "prompt": """Create a professional economic outlook. Seamlessly integrate my photo into the design - remove the background and blend me naturally into the composition. Include LendWise logo. Forest green gradient background with metallic gold accents. Use soft metallic gold gradient glow around edges of each section.

SECTION 1 (15 words): Current thirty year fixed rate six point three eight percent reflecting recent Federal Reserve policy decisions and inflation data.
SECTION 2 (15 words): Key factors include employment strength housing inventory levels consumer spending patterns and ongoing economic indicators monitoring inflation trends closely.
SECTION 3 (15 words): Contact David Young NMLS 62043 Phone 310-954-7771 for quick response call now or visit our office today.

Portrait 1080x1350.""",
        "expectedWords": ["Current", "thirty", "year", "fixed", "rate", "six", "point", "three", "eight", "percent", "reflecting", "recent", "Federal", "Reserve", "policy", "Key", "factors", "include", "employment", "strength", "housing", "inventory", "levels", "consumer", "spending", "patterns", "ongoing", "economic", "indicators", "monitoring", "inflation", "trends", "closely", "Contact", "David", "Young", "NMLS", "62043", "Phone", "310-954-7771", "for", "quick", "response", "call", "now", "or", "visit", "our", "office", "today"]
    },
    {
        "batch": 3,
        "batchName": "BATCH 3: Gradient Glow Method",
        "name": "Custom content, 3x15 words, with photo",
        "method": "gradient glow edges",
        "template": "Custom",
        "withPhoto": True,
        "prompt": """Create a professional mortgage marketing image. Seamlessly integrate my photo into the design - remove the background and blend me naturally into the composition. Include LendWise logo. Forest green gradient background with metallic gold accents. Use soft metallic gold gradient glow around edges of each section.

SECTION 1 (15 words): Looking for better rates on your home loan refinance purchase programs available through our team expert guidance provided.
SECTION 2 (15 words): We offer conventional FHA VA jumbo and ARM loan programs tailored to your specific financial situation and goals.
SECTION 3 (15 words): Contact David Young NMLS 62043 Phone 310-954-7771 for quick response call now or visit our office today.

Portrait 1080x1350.""",
        "expectedWords": ["Looking", "for", "better", "rates", "on", "your", "home", "loan", "refinance", "purchase", "programs", "available", "through", "our", "team", "We", "offer", "conventional", "FHA", "VA", "jumbo", "and", "ARM", "tailored", "to", "specific", "financial", "situation", "goals", "Contact", "David", "Young", "NMLS", "62043", "Phone", "310-954-7771", "quick", "response", "call", "now", "or", "visit", "office", "today"]
    },
    # BATCH 4: Top Border Method (5 tests)
    {
        "batch": 4,
        "batchName": "BATCH 4: Top Border Method",
        "name": "Market Update, 3x15 words, with photo",
        "method": "top border only",
        "template": "Market Update",
        "withPhoto": True,
        "prompt": """Create a professional mortgage market update showing current rates. Seamlessly integrate my photo into the design - remove the background and blend me naturally into the composition. Include LendWise logo. Forest green gradient background with metallic gold accents. Use thick metallic gold horizontal lines ABOVE each section only.

SECTION 1 (15 words): Current thirty year rate six point three eight percent up two basis points from yesterday strong market conditions.
SECTION 2 (15 words): Contact David Young NMLS 62043 Phone 310-954-7771 for quick response call now or visit our office today.
SECTION 3 (15 words): We help you find the right loan program that fits your needs and budget goals available now.

Portrait 1080x1350.""",
        "expectedWords": ["Current", "thirty", "year", "rate", "six", "point", "three", "eight", "percent", "up", "two", "basis", "points", "from", "yesterday", "Contact", "David", "Young", "NMLS", "62043", "Phone", "310-954-7771", "for", "quick", "response", "call", "now", "or", "visit", "our", "office", "today", "We", "help", "you", "find", "the", "right", "loan", "program", "that", "fits", "your", "needs", "and", "budget", "goals", "available"]
    },
    {
        "batch": 4,
        "batchName": "BATCH 4: Top Border Method",
        "name": "Market Update, 3x15 words, no photo",
        "method": "top border only",
        "template": "Market Update",
        "withPhoto": False,
        "prompt": """Create a professional mortgage market update showing current rates. Include LendWise logo. Forest green gradient background with metallic gold accents. Use thick metallic gold horizontal lines ABOVE each section only.

SECTION 1 (15 words): Current thirty year rate six point three eight percent up two basis points from yesterday strong market conditions.
SECTION 2 (15 words): Fifteen year rate five point eight eight percent showing minimal change from prior session holding firm today stable.
SECTION 3 (15 words): Contact David Young NMLS 62043 Phone 310-954-7771 for quick response call now or visit our office today.

Portrait 1080x1350.""",
        "expectedWords": ["Current", "thirty", "year", "rate", "six", "point", "three", "eight", "percent", "up", "two", "basis", "points", "from", "yesterday", "Fifteen", "five", "showing", "minimal", "change", "prior", "session", "holding", "firm", "stable", "Contact", "David", "Young", "NMLS", "62043", "Phone", "310-954-7771", "for", "quick", "response", "call", "now", "or", "visit", "our", "office", "today"]
    },
    {
        "batch": 4,
        "batchName": "BATCH 4: Top Border Method",
        "name": "Rate Trends, 3x15 words, with photo",
        "method": "top border only",
        "template": "Rate Trends",
        "withPhoto": True,
        "prompt": """Create a professional mortgage rate trends chart. Seamlessly integrate my photo into the design - remove the background and blend me naturally into the composition. Include LendWise logo. Forest green gradient background with metallic gold accents. Use thick metallic gold horizontal lines ABOVE each section only.

SECTION 1 (15 words): Mortgage rates showing minimal movement over past three weeks holding within narrow range consistent stable market performance overall.
SECTION 2 (15 words): Include simple rate trend chart with arrows showing direction for thirty year fifteen year and jumbo loan programs.
SECTION 3 (15 words): Contact David Young NMLS 62043 Phone 310-954-7771 for quick response call now or visit our office today.

Portrait 1080x1350.""",
        "expectedWords": ["Mortgage", "rates", "showing", "minimal", "movement", "over", "past", "three", "weeks", "holding", "within", "narrow", "range", "consistent", "stable", "Include", "simple", "trend", "chart", "with", "arrows", "direction", "for", "thirty", "year", "fifteen", "and", "jumbo", "loan", "programs", "Contact", "David", "Young", "NMLS", "62043", "Phone", "310-954-7771", "quick", "response", "call", "now", "or", "visit", "our", "office", "today"]
    },
    {
        "batch": 4,
        "batchName": "BATCH 4: Top Border Method",
        "name": "Economic Outlook, 3x15 words, with photo",
        "method": "top border only",
        "template": "Economic Outlook",
        "withPhoto": True,
        "prompt": """Create a professional economic outlook. Seamlessly integrate my photo into the design - remove the background and blend me naturally into the composition. Include LendWise logo. Forest green gradient background with metallic gold accents. Use thick metallic gold horizontal lines ABOVE each section only.

SECTION 1 (15 words): Current thirty year fixed rate six point three eight percent reflecting recent Federal Reserve policy decisions and inflation data.
SECTION 2 (15 words): Key factors include employment strength housing inventory levels consumer spending patterns and ongoing economic indicators monitoring inflation trends closely.
SECTION 3 (15 words): Contact David Young NMLS 62043 Phone 310-954-7771 for quick response call now or visit our office today.

Portrait 1080x1350.""",
        "expectedWords": ["Current", "thirty", "year", "fixed", "rate", "six", "point", "three", "eight", "percent", "reflecting", "recent", "Federal", "Reserve", "policy", "Key", "factors", "include", "employment", "strength", "housing", "inventory", "levels", "consumer", "spending", "patterns", "ongoing", "economic", "indicators", "monitoring", "inflation", "trends", "closely", "Contact", "David", "Young", "NMLS", "62043", "Phone", "310-954-7771", "for", "quick", "response", "call", "now", "or", "visit", "our", "office", "today"]
    },
    {
        "batch": 4,
        "batchName": "BATCH 4: Top Border Method",
        "name": "Custom content, 3x15 words, with photo",
        "method": "top border only",
        "template": "Custom",
        "withPhoto": True,
        "prompt": """Create a professional mortgage marketing image. Seamlessly integrate my photo into the design - remove the background and blend me naturally into the composition. Include LendWise logo. Forest green gradient background with metallic gold accents. Use thick metallic gold horizontal lines ABOVE each section only.

SECTION 1 (15 words): Looking for better rates on your home loan refinance purchase programs available through our team expert guidance provided.
SECTION 2 (15 words): We offer conventional FHA VA jumbo and ARM loan programs tailored to your specific financial situation and goals.
SECTION 3 (15 words): Contact David Young NMLS 62043 Phone 310-954-7771 for quick response call now or visit our office today.

Portrait 1080x1350.""",
        "expectedWords": ["Looking", "for", "better", "rates", "on", "your", "home", "loan", "refinance", "purchase", "programs", "available", "through", "our", "team", "We", "offer", "conventional", "FHA", "VA", "jumbo", "and", "ARM", "tailored", "to", "specific", "financial", "situation", "goals", "Contact", "David", "Young", "NMLS", "62043", "Phone", "310-954-7771", "quick", "response", "call", "now", "or", "visit", "office", "today"]
    }
]


class BulletproofTestRunner:
    def __init__(self, api_key: str, base_dir: str):
        self.api_key = api_key
        self.base_dir = base_dir
        self.logo_data = None
        self.results = []
        self.output_dir = os.path.join(base_dir, "bulletproof_test_results")

        # Create output directory
        os.makedirs(self.output_dir, exist_ok=True)

    def load_logo(self):
        """Load and encode the logo file"""
        logo_path = os.path.join(self.base_dir, "lendwise-logo.png")
        try:
            with open(logo_path, 'rb') as f:
                logo_bytes = f.read()
                self.logo_data = base64.b64encode(logo_bytes).decode('utf-8')
            print(f"✅ Logo loaded from {logo_path}")
            return True
        except Exception as e:
            print(f"❌ Failed to load logo: {e}")
            return False

    def call_gemini_api(self, test: Dict, test_number: int) -> Optional[Dict]:
        """Call Gemini API for a single test"""
        print(f"\n🧪 Test {test_number}: {test['name']}")
        print(f"   Method: {test['method']}")
        print(f"   Template: {test['template']}")
        print(f"   With Photo: {test['withPhoto']}")

        # Build request parts
        parts = []

        # Add logo
        if self.logo_data:
            parts.append({
                "inline_data": {
                    "mime_type": "image/png",
                    "data": self.logo_data
                }
            })

        # Add prompt
        parts.append({"text": test['prompt']})

        # Build request payload
        payload = {
            "contents": [{"parts": parts}],
            "generationConfig": {
                "temperature": 0.9,
                "topK": 40,
                "topP": 0.95,
                "responseModalities": ["image"]
            }
        }

        # Call API
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key={self.api_key}"
            response = requests.post(url, json=payload, timeout=60)

            if response.status_code != 200:
                print(f"   ❌ API Error: {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                return None

            data = response.json()

            # Extract image
            candidates = data.get('candidates', [])
            if not candidates:
                print(f"   ❌ No candidates in response")
                return None

            parts_response = candidates[0].get('content', {}).get('parts', [])
            image_part = None

            for part in parts_response:
                if 'inline_data' in part or 'inlineData' in part:
                    image_part = part
                    break

            if not image_part:
                print(f"   ❌ No image in response")
                return None

            # Get image data
            if 'inline_data' in image_part:
                image_data = image_part['inline_data'].get('data')
                mime_type = image_part['inline_data'].get('mimeType', 'image/png')
            else:
                image_data = image_part['inlineData'].get('data')
                mime_type = image_part['inlineData'].get('mimeType', 'image/png')

            if not image_data:
                print(f"   ❌ No image data in response")
                return None

            # Save image
            filename = f"test_{test_number:02d}_{test['template'].replace(' ', '_')}_{test['method'].replace(' ', '_')[:20]}.png"
            filepath = os.path.join(self.output_dir, filename)

            image_bytes = base64.b64decode(image_data)
            with open(filepath, 'wb') as f:
                f.write(image_bytes)

            print(f"   ✅ Image saved: {filename}")

            return {
                "filepath": filepath,
                "filename": filename,
                "image_data": image_data,
                "mime_type": mime_type
            }

        except Exception as e:
            print(f"   ❌ Exception: {e}")
            return None

    def run_all_tests(self):
        """Execute all 20 tests"""
        print("=" * 80)
        print("BULLETPROOF TEST SUITE - 20 SYSTEMATIC TESTS")
        print("=" * 80)

        if not self.load_logo():
            print("❌ Cannot proceed without logo")
            return

        for i, test in enumerate(TEST_DEFINITIONS, 1):
            # Check for batch divider
            if i == 1 or TEST_DEFINITIONS[i-2]['batch'] != test['batch']:
                print(f"\n{'='*80}")
                print(f"  {test['batchName']}")
                print(f"{'='*80}")

            # Run test
            result = self.call_gemini_api(test, i)

            # Store result
            test_result = {
                "testNumber": i,
                "testName": test['name'],
                "template": test['template'],
                "method": test['method'],
                "withPhoto": test['withPhoto'],
                "batch": test['batch'],
                "batchName": test['batchName'],
                "expectedWords": test['expectedWords'],
                "status": "generated" if result else "failed",
                "filepath": result['filepath'] if result else None,
                "filename": result['filename'] if result else None,
                "errors": [],  # To be filled manually
                "manualVerification": "REQUIRED"
            }

            self.results.append(test_result)

            # Wait between tests to avoid rate limiting
            if i < len(TEST_DEFINITIONS):
                print("   ⏱️  Waiting 3 seconds...")
                time.sleep(3)

        # Generate report
        self.generate_report()

    def generate_report(self):
        """Generate comprehensive test report"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        total_tests = len(self.results)
        generated = len([r for r in self.results if r['status'] == 'generated'])
        failed = len([r for r in self.results if r['status'] == 'failed'])

        report = f"""
BULLETPROOF TEST RESULTS
========================
Date: {timestamp}
Total Tests: {total_tests}
Successfully Generated: {generated}/{total_tests}
Failed Generations: {failed}/{total_tests}
Success Rate: {(generated/total_tests*100):.1f}%

⚠️  MANUAL VERIFICATION REQUIRED ⚠️
====================================
All images have been generated and saved to:
{self.output_dir}

Please review EACH image carefully and verify:
1. All words are spelled correctly (no missing/extra letters)
2. No word repetition (like "for for" or "through through")
3. Numbers are accurate (310-954-7771, NMLS 62043, etc.)
4. No truncated words
5. All expected words are present

BATCH RESULTS:
--------------
"""

        # Batch breakdown
        for batch_num in range(1, 5):
            batch_tests = [r for r in self.results if r['batch'] == batch_num]
            batch_name = batch_tests[0]['batchName'] if batch_tests else f"Batch {batch_num}"
            generated_in_batch = len([r for r in batch_tests if r['status'] == 'generated'])

            report += f"\n{batch_name}:\n"
            for test_result in batch_tests:
                status_symbol = "✅" if test_result['status'] == 'generated' else "❌"
                report += f"  {status_symbol} Test {test_result['testNumber']}: {test_result['testName']}\n"
                if test_result['filename']:
                    report += f"     File: {test_result['filename']}\n"
            report += f"  Generated: {generated_in_batch}/5\n"

        # Template coverage
        report += f"""

TEMPLATE COVERAGE:
==================
"""
        templates = {}
        for r in self.results:
            template = r['template']
            if template not in templates:
                templates[template] = {'total': 0, 'generated': 0}
            templates[template]['total'] += 1
            if r['status'] == 'generated':
                templates[template]['generated'] += 1

        for template, stats in templates.items():
            report += f"- {template}: {stats['generated']}/{stats['total']} generated\n"

        # Photo usage
        with_photo = [r for r in self.results if r['withPhoto']]
        without_photo = [r for r in self.results if not r['withPhoto']]

        report += f"""
PHOTO USAGE:
============
- With Photo: {len([r for r in with_photo if r['status'] == 'generated'])}/{len(with_photo)} generated
- Without Photo: {len([r for r in without_photo if r['status'] == 'generated'])}/{len(without_photo)} generated

SEPARATION METHOD COVERAGE:
===========================
"""
        methods = {}
        for r in self.results:
            method = r['method']
            if method not in methods:
                methods[method] = {'total': 0, 'generated': 0}
            methods[method]['total'] += 1
            if r['status'] == 'generated':
                methods[method]['generated'] += 1

        for method, stats in methods.items():
            report += f"- {method}: {stats['generated']}/{stats['total']} generated\n"

        report += f"""

DETAILED TEST LOG:
==================
"""

        for result in self.results:
            report += f"\nTest #{result['testNumber']}: {result['testName']}\n"
            report += f"  Batch: {result['batchName']}\n"
            report += f"  Template: {result['template']}\n"
            report += f"  Method: {result['method']}\n"
            report += f"  With Photo: {'Yes' if result['withPhoto'] else 'No'}\n"
            report += f"  Status: {result['status'].upper()}\n"
            if result['filename']:
                report += f"  File: {result['filename']}\n"
            report += f"  Expected Words ({len(result['expectedWords'])}): {', '.join(result['expectedWords'][:10])}...\n"
            report += f"  ⚠️  MANUAL VERIFICATION REQUIRED - Check spelling in image\n"

        report += f"""

NEXT STEPS:
===========
1. Open all {generated} generated images in: {self.output_dir}
2. For EACH image, carefully verify every word
3. Document any errors found:
   - Which test number
   - Which word(s) are incorrect
   - What the error is (misspelling, missing, extra, etc.)
4. Calculate final success rate: (perfect images / 20) × 100%
5. Update this report with error findings

EXPECTED OUTCOME:
=================
If 15-word formula is bulletproof: 19-20 perfect renders (95-100% success)
If 18-20 perfect: ✅ BULLETPROOF - Deploy to production
If 17-19 perfect: ⚠️  GOOD - Minor adjustments may be needed
If 15-16 perfect: ⚠️  ACCEPTABLE - Review error patterns
If <15 perfect: ❌ NEEDS WORK - Investigate systematic issues

RECOMMENDATIONS:
================
[To be filled after manual verification]

SUCCESS CRITERIA:
=================
✅ Pass: 95%+ perfect renders (19-20/20)
⚠️  Review: 85-94% perfect renders (17-18/20)
❌ Fail: <85% perfect renders (<17/20)

"""

        # Save report
        report_path = os.path.join(self.output_dir, f"BULLETPROOF_TEST_REPORT_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt")
        with open(report_path, 'w') as f:
            f.write(report)

        print(f"\n{'='*80}")
        print("REPORT GENERATED")
        print(f"{'='*80}")
        print(report)
        print(f"\n📄 Full report saved to: {report_path}")

        # Save results JSON for further analysis
        json_path = os.path.join(self.output_dir, f"test_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
        with open(json_path, 'w') as f:
            json.dump(self.results, f, indent=2, default=str)

        print(f"📊 Results JSON saved to: {json_path}")


def main():
    print("BULLETPROOF TEST SUITE")
    print("=" * 80)
    print("This script will execute 20 systematic tests to validate the")
    print("15-word-per-section formula for Gemini 2.5 Flash Image.")
    print("=" * 80)

    # Get API key
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        api_key = input("\nEnter your Gemini API Key: ").strip()

    if not api_key:
        print("❌ API key required to run tests")
        return

    # Get base directory
    base_dir = os.path.dirname(os.path.abspath(__file__))

    # Initialize runner
    runner = BulletproofTestRunner(api_key, base_dir)

    # Run tests
    runner.run_all_tests()

    print("\n" + "="*80)
    print("✅ TEST EXECUTION COMPLETE")
    print("="*80)
    print(f"\nAll images saved to: {runner.output_dir}")
    print("\n⚠️  IMPORTANT: Manual verification required!")
    print("Please review each image carefully and document any text errors.")
    print("="*80)


if __name__ == "__main__":
    main()
