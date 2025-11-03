import { useState } from 'react';
import VideoRecorder from './VideoRecorder';
import { ArrowLeft, Send } from 'lucide-react';

export default function VideoMessaging({ match, onBack, onSendMessage }) {
  const [showRecorder, setShowRecorder] = useState(false);
  const [messages, setMessages] = useState([
    // Mock conversation
    {
      id: 1,
      sender: match.name,
      videoUrl: match.recordings[0].url,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      isRead: true
    }
  ]);

  const handleRecordingComplete = (blob) => {
    const newMessage = {
      id: messages.length + 1,
      sender: 'You',
      videoUrl: URL.createObjectURL(blob),
      timestamp: new Date().toISOString(),
      isRead: false
    };

    setMessages(prev => [...prev, newMessage]);
    setShowRecorder(false);
    onSendMessage(newMessage, match);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (showRecorder) {
    return (
      <div className="min-h-screen p-6 bg-gray-900">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setShowRecorder(false)}
            className="mb-6 flex items-center gap-2 text-white hover:text-primary transition"
          >
            <ArrowLeft size={20} />
            Back to Messages
          </button>
          <h2 className="text-2xl font-bold text-white mb-6">
            Send Video Message to {match.name}
          </h2>
          <VideoRecorder
            onRecordingComplete={handleRecordingComplete}
            prompt={`Record a message for ${match.name}`}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-white hover:text-primary transition"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-xl">
              {match.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{match.name}</h2>
              <p className="text-sm text-gray-400">Active now</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'You' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-md ${message.sender === 'You' ? 'ml-12' : 'mr-12'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-white">
                    {message.sender}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(message.timestamp)}
                  </span>
                </div>
                <div
                  className={`rounded-2xl overflow-hidden shadow-lg ${
                    message.sender === 'You'
                      ? 'bg-gradient-to-r from-primary to-pink-500'
                      : 'bg-gray-800'
                  }`}
                >
                  <video
                    src={message.videoUrl}
                    controls
                    className="w-full aspect-video object-cover"
                    preload="metadata"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => setShowRecorder(true)}
            className="flex-1 px-6 py-4 bg-gradient-to-r from-primary to-pink-500 hover:from-pink-500 hover:to-primary text-white rounded-full font-semibold text-lg transition transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
          >
            <Send size={20} />
            Record Video Message
          </button>
        </div>
      </div>
    </div>
  );
}
