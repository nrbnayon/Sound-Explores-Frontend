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
import { Button } from "../ui/button";

const AudioPlayerModal = ({ audioUrl, onClose, autoplay = true }) => {
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
  const [showAutoplayPrompt, setShowAutoplayPrompt] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  // References
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);
  const autoplayTriesRef = useRef(0);

  // Enhanced autoplay function with multiple strategies
  const attemptAutoplay = async () => {
    if (!audioRef.current || userInteracted) return;

    try {
      // Strategy 1: Try muted autoplay first (usually allowed)
      audioRef.current.muted = true;
      audioRef.current.volume = 0;

      const playPromise = audioRef.current.play();

      if (playPromise !== undefined) {
        await playPromise;

        // If muted autoplay succeeds, try to unmute after a brief delay
        setTimeout(() => {
          if (audioRef.current && !audioRef.current.paused) {
            audioRef.current.muted = false;
            audioRef.current.volume = volume;
            setIsMuted(false);
            setIsPlaying(true);
            setShowAutoplayPrompt(false);
          }
        }, 100);
      }
    } catch (error) {
      // Strategy 2: Show user prompt but try background loading
      setShowAutoplayPrompt(true);
      setIsPlaying(false);

      // Strategy 3: Listen for any user interaction to start audio
      const startOnInteraction = () => {
        if (!userInteracted && audioRef.current) {
          setUserInteracted(true);
          forcePlay();
          document.removeEventListener("click", startOnInteraction, true);
          document.removeEventListener("touchstart", startOnInteraction, true);
          document.removeEventListener("keydown", startOnInteraction, true);
        }
      };

      document.addEventListener("click", startOnInteraction, true);
      document.addEventListener("touchstart", startOnInteraction, true);
      document.addEventListener("keydown", startOnInteraction, true);
    }
  };

  // Force play with full volume
  const forcePlay = async () => {
    if (!audioRef.current) return;

    try {
      audioRef.current.muted = false;
      audioRef.current.volume = volume;

      const playPromise = audioRef.current.play();

      if (playPromise !== undefined) {
        await playPromise;
        setIsPlaying(true);
        setShowAutoplayPrompt(false);
      }
    } catch (error) {
      console.error("Force play failed:", error);
      setShowAutoplayPrompt(true);
    }
  };

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    // Set audio properties
    audio.src = audioUrl;
    audio.volume = volume;
    audio.loop = loop;
    audio.playbackRate = playbackRate;
    audio.preload = "auto";

    // Try to enable autoplay attributes (limited browser support)
    audio.autoplay = true;
    audio.defaultMuted = false;

    const onLoadedMetadata = () => {
      setDuration(audio.duration);
      setLoading(false);

      // Attempt autoplay strategies
      if (autoplay) {
        setTimeout(() => {
          attemptAutoplay();
        }, 50);
      }
    };

    const onCanPlay = () => {
      // Audio buffer is ready
      if (autoplay && !userInteracted && autoplayTriesRef.current < 3) {
        autoplayTriesRef.current++;
        setTimeout(() => {
          attemptAutoplay();
        }, 100 * autoplayTriesRef.current);
      }
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

    const onPlay = () => {
      setIsPlaying(true);
      setShowAutoplayPrompt(false);
    };

    const onPause = () => {
      setIsPlaying(false);
    };

    const onLoadStart = () => {
      setLoading(true);
    };

    // Set up event listeners
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("loadstart", onLoadStart);

    // Clean up
    return () => {
      audio.pause();
      audio.currentTime = 0;
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("loadstart", onLoadStart);
    };
  }, [audioUrl, loop, playbackRate, autoplay]);

  // Effect for volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Global interaction listener for autoplay
  useEffect(() => {
    if (showAutoplayPrompt && !userInteracted) {
      const handleGlobalInteraction = (e) => {
        // Any click, touch, or key press enables autoplay
        setUserInteracted(true);
        forcePlay();
      };

      // Listen on document for any interaction
      document.addEventListener("mousedown", handleGlobalInteraction, true);
      document.addEventListener("touchstart", handleGlobalInteraction, true);
      document.addEventListener("keydown", handleGlobalInteraction, true);

      return () => {
        document.removeEventListener(
          "mousedown",
          handleGlobalInteraction,
          true
        );
        document.removeEventListener(
          "touchstart",
          handleGlobalInteraction,
          true
        );
        document.removeEventListener("keydown", handleGlobalInteraction, true);
      };
    }
  }, [showAutoplayPrompt, userInteracted]);

  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    onClose();
  };

  // Handle clicking outside the modal - start audio if paused
  const handleBackdropClick = () => {
    if (!isPlaying && !loading && !error && audioRef.current) {
      setUserInteracted(true);
      togglePlayPause();
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    setUserInteracted(true);

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      const playPromise = audioRef.current.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setShowAutoplayPrompt(false);
          })
          .catch((error) => {
            console.error("Playback failed:", error);
            setError("Playback failed. Please try again.");
            setIsPlaying(false);
          });
      }
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    setUserInteracted(true);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setUserInteracted(true);
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
      const wasPlaying = !audioRef.current.paused;
      audioRef.current.playbackRate = newRate;

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

  const skipTime = (seconds) => {
    if (!audioRef.current) return;

    const newTime = Math.min(
      Math.max(0, audioRef.current.currentTime + seconds),
      audioRef.current.duration
    );

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleProgressChange = (e) => {
    const progressBar = progressBarRef.current;
    if (progressBar && audioRef.current) {
      const rect = progressBar.getBoundingClientRect();
      const position = (e.clientX - rect.left) / rect.width;
      const newTime = position * duration;
      setCurrentTime(newTime);
      audioRef.current.currentTime = newTime;
      setUserInteracted(true);
    }
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

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

        {/* Enhanced autoplay prompt overlay */}
        {showAutoplayPrompt && !error && !loading && (
          <div className='absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 rounded-lg'>
            <div className='text-center p-4'>
              <div className='animate-bounce mb-3'>
                <Play size={32} className='mx-auto text-blue-600' />
              </div>
              <p className='text-lg font-semibold text-gray-800 mb-2'>
                Ready to Play!
              </p>
              <p className='text-sm text-gray-600 mb-4'>
                Click anywhere or press any key to start
              </p>
              {/* <Button
                onClick={togglePlayPause}
                className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 mb-2 rounded-full text-sm font-medium shadow-lg transform hover:scale-105 transition-all'
              >
                ▶ Start Playing
              </Button> */}
            </div>
          </div>
        )}

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
                className='w-3 h-3 bg-blue-600 rounded-full animate-pulse'
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className='w-3 h-3 bg-blue-600 rounded-full animate-pulse'
                style={{ animationDelay: "300ms" }}
              ></div>
              <div
                className='w-3 h-3 bg-blue-600 rounded-full animate-pulse'
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
      onClick={handleBackdropClick}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className='bg-white rounded-xl p-6 w-11/12 max-w-md shadow-2xl'
        onClick={(e) => e.stopPropagation()}
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
