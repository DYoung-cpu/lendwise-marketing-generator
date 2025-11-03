import { useState } from 'react';
import ProfileCreation from './components/ProfileCreation';
import DiscoverFeed from './components/DiscoverFeed';
import VideoMessaging from './components/VideoMessaging';
import { Users, MessageCircle, User } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState('welcome'); // welcome, createProfile, discover, messages
  const [currentUser, setCurrentUser] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [matches, setMatches] = useState([]);

  const handleProfileComplete = (profile) => {
    setCurrentUser(profile);
    // Add some mock profiles for demo
    setProfiles(generateMockProfiles());
    setCurrentView('discover');
  };

  const handleLike = (profile) => {
    console.log('Liked:', profile.name);
    // Simulate a match
    if (Math.random() > 0.5) {
      setMatches(prev => [...prev, profile]);
      alert(`It's a match with ${profile.name}! 🎉`);
    }
  };

  const handlePass = (profile) => {
    console.log('Passed:', profile.name);
  };

  const handleMessage = (profile) => {
    setSelectedMatch(profile);
    setCurrentView('messages');
  };

  const handleSendMessage = (message, match) => {
    console.log('Message sent to:', match.name);
  };

  const generateMockProfiles = () => {
    // Create mock profiles for demo
    return [
      {
        name: 'Alex',
        recordings: [
          { url: '', prompt: 'Hi, I\'m Alex!', index: 0 },
        ],
        createdAt: new Date().toISOString()
      },
      {
        name: 'Jordan',
        recordings: [
          { url: '', prompt: 'Hey there!', index: 0 },
        ],
        createdAt: new Date().toISOString()
      }
    ];
  };

  // Welcome Screen
  if (currentView === 'welcome') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
        <div className="max-w-2xl w-full text-center">
          <div className="mb-8">
            <h1 className="text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary via-pink-500 to-secondary bg-clip-text text-transparent">
                VideoConnect
              </span>
            </h1>
            <p className="text-2xl text-gray-300 mb-2">
              Real connections through real-time video
            </p>
            <p className="text-lg text-gray-400">
              No photos. No text. Just authentic you.
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">How it works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="text-white" size={32} />
                </div>
                <h3 className="text-white font-semibold mb-2">1. Create Profile</h3>
                <p className="text-gray-400 text-sm">
                  Record video answers to prompts - show your true self
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="text-white" size={32} />
                </div>
                <h3 className="text-white font-semibold mb-2">2. Discover</h3>
                <p className="text-gray-400 text-sm">
                  Watch video profiles and connect with people you like
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-secondary to-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="text-white" size={32} />
                </div>
                <h3 className="text-white font-semibold mb-2">3. Video Chat</h3>
                <p className="text-gray-400 text-sm">
                  Send video messages and have real conversations
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setCurrentView('createProfile')}
            className="px-12 py-4 bg-gradient-to-r from-primary via-pink-500 to-secondary hover:from-secondary hover:to-primary text-white text-xl font-bold rounded-full transition transform hover:scale-105 shadow-2xl"
          >
            Get Started
          </button>
        </div>
      </div>
    );
  }

  // Profile Creation View
  if (currentView === 'createProfile') {
    return <ProfileCreation onComplete={handleProfileComplete} />;
  }

  // Main App View with Navigation
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Top Navigation */}
      {currentView !== 'messages' && (
        <nav className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                VideoConnect
              </h1>
              <div className="flex gap-6">
                <button
                  onClick={() => setCurrentView('discover')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    currentView === 'discover'
                      ? 'bg-primary text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <Users size={20} />
                  Discover
                </button>
                <button
                  onClick={() => setCurrentView('matches')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition relative ${
                    currentView === 'matches'
                      ? 'bg-primary text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <MessageCircle size={20} />
                  Matches
                  {matches.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {matches.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      {currentView === 'discover' && profiles.length > 0 && (
        <DiscoverFeed
          profiles={profiles}
          currentUser={currentUser}
          onLike={handleLike}
          onPass={handlePass}
          onMessage={handleMessage}
        />
      )}

      {currentView === 'matches' && (
        <div className="min-h-screen p-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8">Your Matches</h2>
            {matches.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No matches yet. Keep swiping!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matches.map((match, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleMessage(match)}
                    className="bg-gray-800 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition"
                  >
                    <div className="aspect-square bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <span className="text-6xl text-white font-bold">
                        {match.name.charAt(0)}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="text-xl font-bold text-white">{match.name}</h3>
                      <p className="text-gray-400 text-sm">Click to message</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {currentView === 'messages' && selectedMatch && (
        <VideoMessaging
          match={selectedMatch}
          onBack={() => setCurrentView('matches')}
          onSendMessage={handleSendMessage}
        />
      )}
    </div>
  );
}

export default App;
