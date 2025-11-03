# VideoConnect - Implementation & Structure Guide

## 🎯 Core Concept Implementation

This dating app replaces traditional photo profiles and text messaging with **100% video-based interaction**. Here's how it works:

### User Journey

1. **Onboarding**: User enters name
2. **Profile Creation**: Record 5 videos (15-60 sec each) answering prompts
3. **Discovery**: Browse other users' video profiles (Tinder-style swipe)
4. **Matching**: Like profiles to create matches
5. **Communication**: Send video messages (no text chat)

---

## 📐 Architecture Overview

### State Management (Client-Side)

```javascript
App.jsx (Main State Container)
├── currentView: string         // Navigation state
├── currentUser: object         // User's profile
├── profiles: array             // All available profiles
├── matches: array              // Matched profiles
└── selectedMatch: object       // Current conversation
```

### Component Hierarchy

```
App.jsx
├── Welcome Screen (currentView === 'welcome')
├── ProfileCreation (currentView === 'createProfile')
│   └── VideoRecorder (per prompt)
├── DiscoverFeed (currentView === 'discover')
│   └── Video Playback + Actions
├── Matches List (currentView === 'matches')
└── VideoMessaging (currentView === 'messages')
    └── VideoRecorder (for messages)
```

---

## 🎬 Video Recording Flow

### VideoRecorder Component Architecture

**File**: `src/components/VideoRecorder.jsx`

#### State Variables
```javascript
isRecording: boolean         // Recording active
recordedChunks: array       // Video data chunks
previewUrl: string          // Blob URL for preview
countdown: number           // 3-2-1 countdown
recordingTime: number       // Current recording time
hasPermission: boolean      // Camera access granted
```

#### Refs
```javascript
videoRef                    // <video> element for live preview
mediaRecorderRef           // MediaRecorder instance
streamRef                  // MediaStream from getUserMedia
timerRef                   // setInterval for recording timer
```

#### Recording Process

1. **Camera Initialization**
```javascript
navigator.mediaDevices.getUserMedia({
  video: { width: 1280, height: 720 },
  audio: true
})
```

2. **Start Recording**
   - User clicks "Start Recording"
   - 3-second countdown appears
   - MediaRecorder starts capturing
   - Timer begins (max 60 seconds)

3. **During Recording**
   - Red dot indicator shows
   - Time remaining displays
   - Auto-stop at 60 seconds

4. **Stop Recording**
   - User clicks "Stop" OR timer expires
   - Chunks combined into Blob
   - Preview video shows
   - Camera stops

5. **Save/Retake**
   - Retake: Clear blob, restart camera
   - Save: Pass blob to parent component

### Video Data Format

```javascript
{
  blob: Blob,              // Raw video data
  url: string,            // URL.createObjectURL(blob)
  prompt: string,         // Question answered
  timestamp: ISO string,  // When recorded
  index: number          // Order in profile
}
```

---

## 👤 Profile Creation Flow

### ProfileCreation Component

**File**: `src/components/ProfileCreation.jsx`

#### Multi-Step Process

```
Step 1: Name Input
    ↓
Step 2-6: Record 5 Videos
    ↓
Complete: Call onComplete(profile)
```

#### Profile Data Structure

```javascript
{
  name: string,
  recordings: [
    {
      blob: Blob,
      url: string,
      prompt: string,
      index: number
    },
    // ... 4 more videos
  ],
  createdAt: ISO timestamp
}
```

#### Prompts System

Located at `ProfileCreation.jsx:4-10`:

```javascript
const PROFILE_PROMPTS = [
  "Introduce yourself! Tell us your name and what makes you unique.",
  "What are you passionate about? Show us your enthusiasm!",
  "Describe your ideal first date.",
  "What's something that always makes you laugh?",
  "Where's your favorite place in the world and why?"
];
```

**To customize**: Edit this array to change questions

---

## 🔍 Discovery Feed Implementation

### DiscoverFeed Component

**File**: `src/components/DiscoverFeed.jsx`

#### Profile Browsing Logic

```javascript
State:
├── currentProfileIndex: 0-N  // Which profile showing
└── currentVideoIndex: 0-4    // Which video in profile

Navigation:
├── Left 1/3 of screen → Previous video
├── Middle 1/3 → Play/Pause
└── Right 1/3 → Next video
```

#### Action Buttons

```javascript
Pass (X):      onPass(profile) → nextProfile()
Message (💬):   onMessage(profile) → Open messaging
Like (❤️):      onLike(profile) → Check for match
```

#### Match Logic (Demo)

```javascript
handleLike(profile) {
  if (Math.random() > 0.5) {
    // 50% match chance
    setMatches(prev => [...prev, profile]);
    alert('It's a match!');
  }
  nextProfile();
}
```

**Production**: Replace with backend API call to check mutual likes

---

## 💬 Video Messaging System

### VideoMessaging Component

**File**: `src/components/VideoMessaging.jsx`

#### Message Data Structure

```javascript
{
  id: number,
  sender: string,           // 'You' or match.name
  videoUrl: string,         // Blob URL
  timestamp: ISO string,
  isRead: boolean
}
```

#### Messaging Flow

1. User clicks "Record Video Message"
2. VideoRecorder component opens
3. Record and save video
4. New message added to conversation thread
5. Back to conversation view

#### Timestamp Formatting

```javascript
< 1 min:   "Just now"
< 1 hour:  "15m ago"
< 1 day:   "3h ago"
< 1 week:  "2d ago"
> 1 week:  "Jan 15, 2025"
```

---

## 🎨 Styling & Theme

### Tailwind Configuration

**File**: `tailwind.config.js`

```javascript
colors: {
  primary: '#FF385C',    // Pink/Red (main CTA)
  secondary: '#00A699',  // Teal (accents)
  dark: '#1A1A1A',      // Background
}
```

### Color Usage

- **Primary**: Like buttons, CTAs, main branding
- **Secondary**: Accents, success states
- **Dark**: Backgrounds, cards
- **Gray-800/900**: Secondary backgrounds

### Component Styling Patterns

1. **Cards**: `bg-gray-800 rounded-xl border border-gray-700`
2. **Buttons**: `bg-primary rounded-full px-8 py-4 hover:scale-105`
3. **Gradients**: `bg-gradient-to-r from-primary to-secondary`
4. **Glass Effect**: `bg-gray-800/50 backdrop-blur-sm`

---

## 🔧 Configuration Options

### Adjust Recording Time Limit

**File**: `src/components/VideoRecorder.jsx:21`

```javascript
const MAX_RECORDING_TIME = 60; // Change to 30, 90, etc.
```

### Adjust Video Quality

**File**: `src/components/VideoRecorder.jsx:33-36`

```javascript
const stream = await navigator.mediaDevices.getUserMedia({
  video: {
    width: 1920,      // Change resolution
    height: 1080,     // Higher = better quality, larger files
    frameRate: 30     // Add frame rate control
  },
  audio: true
});
```

### Add/Remove Profile Prompts

**File**: `src/components/ProfileCreation.jsx:4-10`

```javascript
const PROFILE_PROMPTS = [
  "Your question here",
  // Add more or remove questions
];
```

Number of videos = `PROFILE_PROMPTS.length`

### Change App Branding

**Files**: `src/App.jsx`

Search and replace:
- "VideoConnect" → Your app name
- Update color theme in `tailwind.config.js`

---

## 🚀 Production Deployment Checklist

### Backend Requirements

1. **Video Storage**
   - AWS S3 or Cloudinary for video hosting
   - CDN for fast delivery
   - Video transcoding for multiple qualities

2. **Database Schema**

```sql
users:
  - id, name, email, password_hash
  - created_at, last_active

videos:
  - id, user_id, prompt, s3_url
  - duration, thumbnail_url
  - created_at

matches:
  - id, user1_id, user2_id
  - matched_at, is_active

messages:
  - id, match_id, sender_id
  - video_url, timestamp
  - is_read
```

3. **API Endpoints**

```
POST   /auth/register
POST   /auth/login
POST   /videos/upload
GET    /profiles/discover
POST   /profiles/:id/like
GET    /matches
POST   /messages/:matchId/send
GET    /messages/:matchId
```

4. **Real-time (Socket.io)**
   - Match notifications
   - New message notifications
   - Online/offline status

### Security

1. **Video Upload**
   - Validate file type (video only)
   - Size limits (max 100MB per video)
   - Virus scanning
   - Rate limiting

2. **Content Moderation**
   - AI content screening (AWS Rekognition)
   - User reporting system
   - Manual review queue
   - Auto-ban inappropriate content

3. **Privacy**
   - HTTPS only
   - Encrypted video storage
   - GDPR compliance
   - User data deletion

### Performance

1. **Video Optimization**
   - Transcode to H.264/VP9
   - Generate thumbnails
   - Multiple quality levels
   - Adaptive bitrate streaming

2. **Caching**
   - CDN for videos
   - Redis for sessions
   - Database query optimization

3. **Mobile App**
   - React Native version
   - Native camera APIs
   - Push notifications

---

## 🐛 Common Issues & Solutions

### Camera Not Working

**Issue**: "Permission denied" or black screen

**Solutions**:
1. Check browser permissions
2. Use HTTPS (required for getUserMedia)
3. Test in different browser
4. Check if camera is used by another app

### Video Not Saving

**Issue**: Videos disappear on page refresh

**Solution**: This is expected in dev mode. Implement backend storage.

### Performance Issues

**Issue**: Lag during recording

**Solutions**:
1. Lower video resolution
2. Close other apps
3. Use hardware acceleration
4. Test on different device

### Browser Compatibility

**Issue**: Features not working in Safari

**Solution**: Safari has limited MediaRecorder support. Consider:
- Polyfills
- Alternative recording method
- Recommend Chrome/Firefox

---

## 📊 Future Feature Ideas

### Phase 2 (Enhanced Experience)
- [ ] Video filters and effects
- [ ] Background blur/replacement
- [ ] Beauty mode
- [ ] AR effects (Snapchat-style)

### Phase 3 (Social Features)
- [ ] Live video calls (WebRTC)
- [ ] Group video chats
- [ ] Video stories (24-hour)
- [ ] Shared video moments

### Phase 4 (Discovery)
- [ ] Location-based matching
- [ ] Interest tags
- [ ] Mutual friends
- [ ] Verified profiles

### Phase 5 (Monetization)
- [ ] Premium subscriptions
- [ ] Super likes
- [ ] See who liked you
- [ ] Unlimited rewinds
- [ ] Video analytics

---

## 🔗 API Integration Guide

When ready to add backend, modify:

### 1. Profile Creation

**Current**: Stores in memory

**Update to**:
```javascript
const handleProfileComplete = async (profile) => {
  // Upload videos to S3
  const videoUrls = await uploadVideos(profile.recordings);

  // Create profile in database
  const response = await fetch('/api/profiles', {
    method: 'POST',
    body: JSON.stringify({
      name: profile.name,
      videos: videoUrls
    })
  });

  const user = await response.json();
  setCurrentUser(user);
};
```

### 2. Discover Feed

**Current**: Mock profiles

**Update to**:
```javascript
useEffect(() => {
  const fetchProfiles = async () => {
    const response = await fetch('/api/profiles/discover');
    const profiles = await response.json();
    setProfiles(profiles);
  };
  fetchProfiles();
}, []);
```

### 3. Messaging

**Current**: Local state

**Update to**:
```javascript
const handleSendMessage = async (videoBlob, match) => {
  // Upload video
  const formData = new FormData();
  formData.append('video', videoBlob);

  const response = await fetch(`/api/messages/${match.id}`, {
    method: 'POST',
    body: formData
  });

  // Socket.io emit for real-time
  socket.emit('message', {
    matchId: match.id,
    videoUrl: response.url
  });
};
```

---

**This implementation is ready to run as a demo. For production, follow the deployment checklist above.**
