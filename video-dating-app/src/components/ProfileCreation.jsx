import { useState, useEffect } from 'react';
import VideoRecorder from './VideoRecorder';
import { getProfilePrompts } from '../config/prompts';

export default function ProfileCreation({ onComplete }) {
  const [prompts, setPrompts] = useState([]);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [recordings, setRecordings] = useState([]);
  const [userName, setUserName] = useState('');
  const [showNameInput, setShowNameInput] = useState(true);

  // Generate random prompts when component mounts
  useEffect(() => {
    setPrompts(getProfilePrompts());
  }, []);

  const handleRecordingComplete = (blob, prompt) => {
    const newRecording = {
      blob,
      prompt,
      url: URL.createObjectURL(blob),
      index: currentPromptIndex
    };

    setRecordings(prev => [...prev, newRecording]);

    if (currentPromptIndex < prompts.length - 1) {
      setCurrentPromptIndex(prev => prev + 1);
    } else {
      // All prompts completed
      handleProfileComplete([...recordings, newRecording]);
    }
  };

  const handleProfileComplete = (allRecordings) => {
    const profile = {
      name: userName,
      recordings: allRecordings,
      prompts: prompts, // Save the prompts used
      createdAt: new Date().toISOString()
    };
    onComplete(profile);
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (userName.trim()) {
      setShowNameInput(false);
    }
  };

  // Don't render until prompts are loaded
  if (prompts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading prompts...</div>
      </div>
    );
  }

  if (showNameInput) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="max-w-md w-full">
          <h1 className="text-4xl font-bold text-white mb-4 text-center">
            Welcome to <span className="text-primary">VideoConnect</span>
          </h1>
          <p className="text-gray-300 mb-2 text-center">
            The anti-swipe dating app.
          </p>
          <p className="text-gray-400 mb-8 text-center text-sm">
            No photos. No endless scrolling. Just real people making real connections.
          </p>

          <form onSubmit={handleNameSubmit} className="space-y-4">
            <div>
              <label className="block text-white mb-2 font-semibold">
                What's your name?
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Enter your name"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full px-6 py-3 bg-primary hover:bg-primary/80 text-white rounded-lg font-semibold transition transform hover:scale-105"
            >
              Start Creating Profile
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-white">
            Creating Profile for {userName}
          </h2>
          <span className="text-gray-300">
            {currentPromptIndex + 1} / {prompts.length}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-500"
            style={{ width: `${((currentPromptIndex + 1) / prompts.length) * 100}%` }}
          />
        </div>

        {/* Prompt Category Badge */}
        {prompts[currentPromptIndex] && (
          <div className="mt-4">
            <span className="inline-block px-3 py-1 bg-secondary/20 text-secondary rounded-full text-sm font-semibold">
              {prompts[currentPromptIndex].category.toUpperCase()}
            </span>
            {prompts[currentPromptIndex].tip && (
              <p className="text-gray-400 text-sm mt-2 italic">
                💡 {prompts[currentPromptIndex].tip}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Video Recorder */}
      <VideoRecorder
        prompt={prompts[currentPromptIndex]?.text || ''}
        onRecordingComplete={handleRecordingComplete}
      />

      {/* Recorded Videos Preview */}
      {recordings.length > 0 && (
        <div className="max-w-4xl mx-auto mt-12">
          <h3 className="text-xl font-bold text-white mb-4">Completed Videos:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recordings.map((recording, idx) => (
              <div key={idx} className="bg-gray-800 rounded-lg overflow-hidden">
                <video
                  src={recording.url}
                  className="w-full aspect-video object-cover"
                  controls
                />
                <div className="p-3">
                  <p className="text-sm text-gray-300 line-clamp-2">
                    {recording.prompt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
