import { useState, useEffect } from 'react';
import { Heart, X, MessageSquare } from 'lucide-react';

export default function DiscoverFeed({ profiles, currentUser, onLike, onPass, onMessage }) {
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentProfile = profiles[currentProfileIndex];

  const handleLike = () => {
    onLike(currentProfile);
    nextProfile();
  };

  const handlePass = () => {
    onPass(currentProfile);
    nextProfile();
  };

  const nextProfile = () => {
    setCurrentVideoIndex(0);
    if (currentProfileIndex < profiles.length - 1) {
      setCurrentProfileIndex(prev => prev + 1);
    } else {
      setCurrentProfileIndex(0); // Loop back
    }
  };

  const nextVideo = () => {
    if (currentVideoIndex < currentProfile.recordings.length - 1) {
      setCurrentVideoIndex(prev => prev + 1);
    } else {
      setCurrentVideoIndex(0);
    }
  };

  const prevVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(prev => prev - 1);
    } else {
      setCurrentVideoIndex(currentProfile.recordings.length - 1);
    }
  };

  if (!currentProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">No More Profiles</h2>
          <p className="text-gray-400">Check back later for new matches!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Profile Card */}
        <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
          {/* Video Section */}
          <div className="relative aspect-[9/16] bg-black">
            <video
              src={currentProfile.recordings[currentVideoIndex].url}
              className="w-full h-full object-cover"
              autoPlay
              loop
              playsInline
              onClick={(e) => {
                if (e.target.paused) {
                  e.target.play();
                  setIsPlaying(true);
                } else {
                  e.target.pause();
                  setIsPlaying(false);
                }
              }}
            />

            {/* Video Navigation Dots */}
            <div className="absolute top-4 left-0 right-0 flex justify-center gap-2 px-4">
              {currentProfile.recordings.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1 flex-1 rounded-full transition-all ${
                    idx === currentVideoIndex ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>

            {/* Video Navigation Areas */}
            <div className="absolute inset-0 flex">
              <div className="w-1/3 h-full" onClick={prevVideo} />
              <div className="w-1/3 h-full" />
              <div className="w-1/3 h-full" onClick={nextVideo} />
            </div>

            {/* Profile Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
              <h2 className="text-3xl font-bold text-white mb-2">
                {currentProfile.name}
              </h2>
              <p className="text-white/90 text-sm mb-4">
                {currentProfile.recordings[currentVideoIndex].prompt}
              </p>
            </div>

            {/* Play/Pause Indicator */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-20 h-20 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-white border-b-[15px] border-b-transparent ml-2" />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="p-6 flex justify-center items-center gap-6">
            <button
              onClick={handlePass}
              className="w-16 h-16 bg-gray-800 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition transform hover:scale-110 shadow-lg"
              title="Pass"
            >
              <X size={32} />
            </button>

            <button
              onClick={() => onMessage(currentProfile)}
              className="w-14 h-14 bg-gray-800 hover:bg-blue-500 text-white rounded-full flex items-center justify-center transition transform hover:scale-110 shadow-lg"
              title="Send Video Message"
            >
              <MessageSquare size={24} />
            </button>

            <button
              onClick={handleLike}
              className="w-16 h-16 bg-gradient-to-r from-primary to-pink-500 hover:from-pink-500 hover:to-primary text-white rounded-full flex items-center justify-center transition transform hover:scale-110 shadow-lg"
              title="Like"
            >
              <Heart size={32} fill="white" />
            </button>
          </div>
        </div>

        {/* Profile Counter */}
        <div className="text-center mt-4 text-gray-400">
          Profile {currentProfileIndex + 1} of {profiles.length}
        </div>
      </div>
    </div>
  );
}
