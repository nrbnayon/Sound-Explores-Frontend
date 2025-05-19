// src/components/AudioPlayer/AudioPlayerModal.jsx
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  SkipBack,
  SkipForward,
  Repeat,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

const AudioPlayerModal = ({ audioUrl, onClose }) => {
  // Core audio states
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loop, setLoop] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  // References
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.volume = volume;
    audio.loop = loop;
    audio.playbackRate = playbackRate;

    const onLoadedMetadata = () => {
      setDuration(audio.duration);
      setLoading(false);
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onEnded = () => {
      if (!loop) {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    };

    const onError = (e) => {
      console.error("Audio loading error:", e);
      setLoading(false);
      setError("Failed to load audio. Please try again.");
    };

    // Set up event listeners
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    // Clean up
    return () => {
      audio.pause();
      audio.currentTime = 0;
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [audioUrl, loop, playbackRate]);

  // Effect for volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    onClose();
    navigate("/");
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // User has now interacted with the document, so play should work
      const playPromise = audioRef.current.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((error) => {
            console.error("Playback failed:", error);
            setError(
              "Playback failed. User interaction required before playback can start."
            );
            setIsPlaying(false);
          });
      }
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleLoop = () => {
    setLoop(!loop);
    if (audioRef.current) {
      audioRef.current.loop = !loop;
    }
  };

  const changePlaybackRate = () => {
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    const newRate = rates[nextIndex];
    setPlaybackRate(newRate);

    if (audioRef.current) {
      // Save current playing state
      const wasPlaying = !audioRef.current.paused;

      // Set new playback rate
      audioRef.current.playbackRate = newRate;

      // If it was playing, ensure it continues to play
      if (wasPlaying) {
        const playPromise = audioRef.current.play();

        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("Error resuming after speed change:", error);
            setIsPlaying(false);
          });
        }
      }
    }
  };

  // Skip forward/back 10 seconds
  const skipTime = (seconds) => {
    if (!audioRef.current) return;

    const newTime = Math.min(
      Math.max(0, audioRef.current.currentTime + seconds),
      audioRef.current.duration
    );

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Format time (seconds) to MM:SS
  const formatTime = (time) => {
    if (!time || isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Function to update progress
  const handleProgressChange = (e) => {
    const progressBar = progressBarRef.current;
    if (progressBar && audioRef.current) {
      const rect = progressBar.getBoundingClientRect();
      const position = (e.clientX - rect.left) / rect.width;
      const newTime = position * duration;
      setCurrentTime(newTime);
      audioRef.current.currentTime = newTime;
    }
  };

  // Calculate progress percentage
  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  // Get volume icon based on state
  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX size={18} />;
    if (volume < 0.5) return <Volume1 size={18} />;
    return <Volume2 size={18} />;
  };

  // Audio waveform visualization
  const AudioWave = () => {
    const [waveLines, setWaveLines] = useState(() => {
      const lineCount = 67;
      return Array(lineCount)
        .fill(null)
        .map(() => {
          const minHeight = 5;
          const maxHeight = 18;
          return (
            Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight
          );
        });
    });

    useEffect(() => {
      let animationTimer;
      if (isPlaying) {
        animationTimer = setInterval(() => {
          setWaveLines((prevLines) => {
            return prevLines.map((height, i) => {
              // Only change some of the lines to create a smoother animation
              if (Math.random() > 0.85) {
                const minHeight = 5;
                const maxHeight = 18;
                return (
                  Math.floor(Math.random() * (maxHeight - minHeight + 1)) +
                  minHeight
                );
              }
              return height;
            });
          });
        }, 150);
      }

      return () => {
        if (animationTimer) {
          clearInterval(animationTimer);
        }
      };
    }, [isPlaying]);

    return (
      <div className='w-full relative h-32 flex items-center justify-center'>
        <svg
          viewBox={`0 0 ${waveLines.length * 2} 24`}
          className='w-full h-full'
        >
          {waveLines.map((height, index) => {
            const x = index * 2;
            const centerY = 12;
            const startY = centerY - height / 2;
            const endY = centerY + height / 2;

            // Calculate if this line is in the "played" section
            const isPlayed =
              (x / (waveLines.length * 2)) * 100 <= progressPercentage;

            return (
              <line
                key={index}
                x1={x}
                y1={startY}
                x2={x}
                y2={endY}
                stroke={isPlayed ? "#00ae34" : "#D1D5DB"}
                strokeWidth='0.5'
                strokeLinecap='round'
              />
            );
          })}
        </svg>

        {error ? (
          <div className='absolute inset-0 flex items-center justify-center bg-white bg-opacity-80'>
            <p className='text-red-500 text-sm font-medium p-2 rounded'>
              {error}
            </p>
          </div>
        ) : loading ? (
          <div className='absolute inset-0 flex items-center justify-center bg-white bg-opacity-80'>
            <div className='flex items-center space-x-2'>
              <div
                className='w-2 h-2 bg-blue-600 rounded-full animate-pulse'
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className='w-2 h-2 bg-blue-600 rounded-full animate-pulse'
                style={{ animationDelay: "300ms" }}
              ></div>
              <div
                className='w-2 h-2 bg-blue-600 rounded-full animate-pulse'
                style={{ animationDelay: "600ms" }}
              ></div>
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='fixed inset-0 text-black bg-black bg-opacity-75 flex items-center justify-center z-50'
      onClick={(e) => {
        // Close modal when clicking the overlay but not its content
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className='bg-white rounded-xl p-6 w-11/12 max-w-md shadow-2xl'
      >
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-lg font-bold'>Sound Player</h3>
          <Button
            onClick={handleClose}
            variant='ghost'
            className='rounded-full h-8 w-8 p-0 hover:bg-gray-100'
          >
            <X size={20} />
          </Button>
        </div>

        <div className='space-y-4'>
          {/* Waveform visualization */}
          <AudioWave />

          {/* Progress bar */}
          <div className='mt-2 mb-4'>
            <div
              ref={progressBarRef}
              className='h-2 bg-gray-200 rounded-full overflow-hidden cursor-pointer relative'
              onClick={handleProgressChange}
            >
              <div
                className='h-full bg-blue-600 transition-all duration-100'
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className='flex justify-between text-xs text-gray-500 mt-1'>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Main controls */}
          <div className='flex items-center justify-center space-x-4'>
            <Button
              onClick={() => skipTime(-10)}
              variant='ghost'
              className='rounded-full h-10 w-10 p-0 hover:bg-gray-100'
              disabled={loading || !!error}
            >
              <SkipBack size={18} />
            </Button>

            <Button
              onClick={togglePlayPause}
              className={`rounded-full w-14 h-14 flex items-center justify-center ${
                isPlaying
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              disabled={loading || !!error}
            >
              {isPlaying ? (
                <Pause size={22} />
              ) : (
                <Play size={22} className='ml-1' />
              )}
            </Button>

            <Button
              onClick={() => skipTime(10)}
              variant='ghost'
              className='rounded-full h-10 w-10 p-0 hover:bg-gray-100'
              disabled={loading || !!error}
            >
              <SkipForward size={18} />
            </Button>
          </div>

          {/* Secondary controls */}
          <div className='flex items-center justify-between mt-6 border-t pt-4'>
            {/* Volume control */}
            <div className='flex items-center space-x-2'>
              <Button
                onClick={toggleMute}
                variant='ghost'
                className='rounded-full h-8 w-8 p-0 hover:bg-gray-100'
                disabled={loading || !!error}
              >
                {getVolumeIcon()}
              </Button>
              <input
                type='range'
                min='0'
                max='1'
                step='0.01'
                value={volume}
                onChange={handleVolumeChange}
                className='w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer'
                disabled={loading || !!error}
              />
            </div>

            {/* Loop and speed controls */}
            <div className='flex items-center space-x-2'>
              <Button
                onClick={toggleLoop}
                variant={loop ? "secondary" : "ghost"}
                className={`rounded-full h-8 w-8 p-0 hover:bg-gray-100 ${
                  loop ? "bg-gray-200" : ""
                }`}
                disabled={loading || !!error}
              >
                <Repeat size={16} />
              </Button>

              <Button
                onClick={changePlaybackRate}
                variant='ghost'
                className='rounded-full flex items-center justify-center text-xs font-medium hover:bg-gray-100 px-2 h-8'
                disabled={loading || !!error}
                title='Change playback speed'
              >
                <RefreshCw size={14} className='mr-1' />
                {playbackRate}x
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AudioPlayerModal;
