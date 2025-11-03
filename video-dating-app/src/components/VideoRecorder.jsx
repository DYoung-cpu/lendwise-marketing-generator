import { useState, useRef, useEffect } from 'react';

export default function VideoRecorder({ onRecordingComplete, prompt }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  const MAX_RECORDING_TIME = 60; // 60 seconds

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasPermission(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Please allow camera and microphone access to continue.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const startRecording = () => {
    setCountdown(3);
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(countdownInterval);
          beginRecording();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const beginRecording = () => {
    setRecordedChunks([]);
    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: 'video/webm;codecs=vp9'
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setRecordedChunks(prev => [...prev, event.data]);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      stopCamera();
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);

    // Start timer
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= MAX_RECORDING_TIME - 1) {
          stopRecording();
          return MAX_RECORDING_TIME;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handleRetake = () => {
    setPreviewUrl(null);
    setRecordedChunks([]);
    setRecordingTime(0);
    startCamera();
  };

  const handleSave = () => {
    if (recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      onRecordingComplete(blob, prompt);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto p-6">
      {/* Prompt Display */}
      {prompt && (
        <div className="mb-6 p-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg border border-primary/30">
          <h3 className="text-xl font-semibold text-white mb-2">Prompt:</h3>
          <p className="text-gray-200 text-lg">{prompt}</p>
        </div>
      )}

      {/* Video Display */}
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl mb-6">
        {!previewUrl ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover mirror"
          />
        ) : (
          <video
            src={previewUrl}
            controls
            className="w-full h-full object-cover"
          />
        )}

        {/* Countdown Overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="text-9xl font-bold text-white animate-pulse">
              {countdown}
            </div>
          </div>
        )}

        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-white font-semibold">
              Recording {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
            </span>
          </div>
        )}

        {/* Time Remaining */}
        {isRecording && (
          <div className="absolute top-4 right-4">
            <span className="text-white font-semibold bg-black/50 px-3 py-1 rounded-full">
              {MAX_RECORDING_TIME - recordingTime}s left
            </span>
          </div>
        )}

        {/* No Permission Warning */}
        {!hasPermission && !previewUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center p-6">
              <p className="text-white text-xl mb-4">Camera access required</p>
              <button
                onClick={startCamera}
                className="px-6 py-3 bg-primary hover:bg-primary/80 text-white rounded-lg font-semibold transition"
              >
                Enable Camera
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        {!previewUrl && !isRecording && hasPermission && (
          <button
            onClick={startRecording}
            className="px-8 py-4 bg-primary hover:bg-primary/80 text-white rounded-full font-semibold text-lg transition transform hover:scale-105 shadow-lg"
          >
            Start Recording
          </button>
        )}

        {isRecording && (
          <button
            onClick={stopRecording}
            className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold text-lg transition transform hover:scale-105 shadow-lg"
          >
            Stop Recording
          </button>
        )}

        {previewUrl && (
          <>
            <button
              onClick={handleRetake}
              className="px-8 py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-full font-semibold text-lg transition transform hover:scale-105 shadow-lg"
            >
              Retake
            </button>
            <button
              onClick={handleSave}
              className="px-8 py-4 bg-secondary hover:bg-secondary/80 text-white rounded-full font-semibold text-lg transition transform hover:scale-105 shadow-lg"
            >
              Save & Continue
            </button>
          </>
        )}
      </div>

      <style jsx>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
}
