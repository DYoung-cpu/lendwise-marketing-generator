# VideoConnect - The Anti-Swipe Dating App

> **"Stop swiping. Start connecting."**

A revolutionary dating app that uses **100% video-only** profiles to fight swipe fatigue and create authentic connections. No photos, no text bios, no endless scrolling - just real people showing their real personalities.

## 🎯 The Problem We're Solving

- 📉 Dating app downloads down 6% (swipe fatigue is real)
- 😫 48% of users report dating app burnout
- 🗑️ Users delete/redownload apps 6 times per year
- 💔 77% believe apps promote shallow behavior
- 📊 88% of people prefer meeting in person

**VideoConnect's Solution:** 100% video-based profiles with daily match limits, personality-driven matching, and story-based prompts that reveal who you really are.

## 🚀 Key Differentiators

### 1. **100% Video-Only Profiles**
- No photos allowed - impossible to catfish
- 5 creative video prompts that reveal personality
- Live verification to prove you're real

### 2. **Anti-Swipe Philosophy**
- Daily limit: 5-10 curated matches per day
- No infinite scrolling, no wasted time
- Quality over quantity, always

### 3. **Story-Based Prompts**
- Not "What's your favorite color?"
- Instead: "Show me your happy dance" or "Give a tour of your happy place"
- 25+ creative prompts across 5 categories (Intro, Personality, Lifestyle, Fun, Connection)

### 4. **Personality Matching**
- AI analyzes your video energy and tone
- Compatibility scores based on vibes, not just looks
- Match with people who share your energy

## ✨ Features

### 1. Video Profile Creation
- **5 Video Prompts**: Users record 15-60 second videos answering personality prompts
- **Live Camera Feed**: Real-time camera preview with mirrored display
- **3-Second Countdown**: Gives users time to prepare before recording
- **Recording Timer**: Shows time remaining (max 60 seconds)
- **Retake Option**: Can re-record any video before saving
- **Progress Tracking**: Visual progress bar shows completion status

### 2. Discover Feed (Swipe Interface)
- **Video Profile Browsing**: Watch users' video profiles
- **Multi-Video Profiles**: Swipe through multiple videos per person
- **Tinder-Style Actions**:
  - ❌ Pass (X button)
  - 💬 Send Video Message
  - ❤️ Like/Match
- **Match Notifications**: Instant notification when mutual likes occur
- **Auto-Play Videos**: Seamless video playback experience

### 3. Video Messaging
- **Video-Only Messages**: All communication through recorded video messages
- **Conversation Thread**: Timeline view of video message exchanges
- **Record & Send**: Quick video message recording interface
- **Message Timestamps**: Shows when messages were sent
- **Video Playback Controls**: Full control over message playback

## 🛠️ Technology Stack

### Frontend
- **React 18**: Component-based UI framework
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Modern icon library

### Video Technology
- **MediaRecorder API**: Records video from webcam
- **getUserMedia API**: Accesses camera and microphone
- **WebRTC**: For future real-time video calls (not yet implemented)
- **Blob Storage**: Client-side video storage (dev mode)

### Backend (Production-Ready)
- **Supabase**: PostgreSQL database + Authentication + File Storage
- **Row Level Security**: Secure data access
- **Real-time subscriptions**: Live messaging
- **Free tier**: Supports 100-200 active users

## 🚀 Getting Started

### Quick Start (Development)

### Prerequisites
- Node.js 16+ and npm
- Modern browser with webcam support
- Camera and microphone permissions

### Installation

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

The app will open at `http://localhost:5173`

### First Run
1. Click "Get Started" on the welcome screen
2. Allow camera and microphone permissions when prompted
3. Enter your name
4. Record 5 video responses to prompts
5. Start discovering other profiles

## 📁 Project Structure

```
video-dating-app/
├── src/
│   ├── components/
│   │   ├── VideoRecorder.jsx      # Core video recording component
│   │   ├── ProfileCreation.jsx    # Multi-step profile creation flow
│   │   ├── DiscoverFeed.jsx       # Swipe interface for browsing
│   │   └── VideoMessaging.jsx     # Video message conversations
│   ├── App.jsx                    # Main app with routing logic
│   ├── index.css                  # Global styles + Tailwind
│   └── main.jsx                   # React entry point
├── tailwind.config.js             # Tailwind configuration
└── package.json                   # Dependencies
```

## 🎨 Key Components

### VideoRecorder Component
Handles all video recording functionality:
- Camera stream management
- MediaRecorder setup and control
- Recording timer (max 60 seconds)
- Preview and retake options
- Blob creation for storage

### ProfileCreation Component
Multi-step profile creation flow:
- Name input screen
- 5 sequential video recording prompts
- Progress tracking
- Completed videos preview

### DiscoverFeed Component
Tinder-style swipe interface:
- Video profile playback
- Tap navigation between videos
- Like/Pass/Message actions
- Match handling

### VideoMessaging Component
Video message conversation interface:
- Message thread display
- Video message recording
- Timestamp formatting

## 🚧 Current Limitations (Dev Mode)

1. **No Backend**: All data is stored in browser memory (profiles lost on refresh)
2. **No Real Matching**: 50% random match probability
3. **Local Video Storage**: Videos stored as Blobs in memory (not production-ready)
4. **No User Authentication**: Single user session
5. **No Live Video Calls**: Only recorded video messages

## 📱 Browser Compatibility

**Supported Browsers**:
- ✅ Chrome 47+
- ✅ Firefox 25+
- ✅ Edge 79+
- ✅ Safari 14.1+
- ❌ Internet Explorer (not supported)

## 🎬 Demo Tips

1. **Test with Good Lighting**: Video quality depends on camera and lighting
2. **Use Chrome/Firefox**: Best browser support for MediaRecorder API
3. **Allow Permissions**: Camera/mic access required for all features
4. **Create Full Profile**: Complete all 5 videos to see full experience
5. **Test Messaging**: Like profiles to create matches and test video messaging

---

**Built with ❤️ using React + Video APIs**
