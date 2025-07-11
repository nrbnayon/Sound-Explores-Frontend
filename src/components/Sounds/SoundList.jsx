// src\components\Sounds\SoundList.jsx
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { Search, Trash2, Plus, Share2, Download, Loader2 } from "lucide-react";
import { useNativeShare } from "../../hooks/useNativeShare";
import {
  useSounds,
  useDeleteSound,
  useDeleteMultipleSounds,
} from "./../../hooks/useSound";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import SoundModal from "./SoundModal";
import Pagination from "../ui/pagination";
import { useSelectedSound } from "../../contexts/SelectedSoundContext";
import { useNavigate } from "react-router-dom";
import { useFriendList } from "../../hooks/useConnections";
import { useSendSoundMessage } from "../../hooks/useMessages";
import ShareModal from "../ShareModal";

// Separate AudioWave component
const AudioWave = ({ isPlaying, isLoading = false }) => {
  const [waveLines, setWaveLines] = useState(() => {
    const lineCount = 67;
    const lines = [];
    for (let i = 0; i < lineCount; i++) {
      const minHeight = 8;
      const maxHeight = 14;
      const height =
        Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
      lines.push(height);
    }
    return lines;
  });

  const animationRef = useRef(null);

  useEffect(() => {
    if (isPlaying && !isLoading) {
      const animateWave = () => {
        setWaveLines((prevLines) => {
          const newLines = [...prevLines];
          for (let i = 0; i < 5; i++) {
            const randomIndex = Math.floor(Math.random() * newLines.length);
            const minHeight = 5;
            const maxHeight = 18;
            newLines[randomIndex] =
              Math.floor(Math.random() * (maxHeight - minHeight + 1)) +
              minHeight;
          }
          return newLines;
        });
        animationRef.current = requestAnimationFrame(animateWave);
      };
      animationRef.current = requestAnimationFrame(animateWave);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, isLoading]);

  if (isLoading) {
    return (
      <div className="w-full h-8 flex items-center justify-center">
        <div className="flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1 h-4 bg-gray-300 rounded animate-pulse"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <svg viewBox={`0 0 ${waveLines.length * 2} 24`} className="w-full h-8">
      {waveLines.map((height, index) => {
        const startY = 12 - height / 2;
        const endY = 12 + height / 2;
        return (
          <line
            key={index}
            x1={index * 2}
            y1={startY}
            x2={index * 2}
            y2={endY}
            stroke={isPlaying ? "#00ae34" : "#D1D5DB"}
            strokeWidth="0.5"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
};

// Separate DeleteModal component
const DeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  selectedSounds,
  sounds,
}) => {
  if (!isOpen) return null;

  const selectedCount = selectedSounds.length;
  const selectedSoundNames = sounds
    .filter((sound) => sound.selected)
    .map((sound) => sound.name);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white text-black rounded-lg p-6 w-11/12 max-w-md shadow-lg"
      >
        <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
        <p className="mb-4">
          {selectedCount === 1
            ? `Are you sure you want to delete "${selectedSoundNames[0]}"?`
            : `Are you sure you want to delete ${selectedCount} selected sounds?`}
        </p>
        {selectedCount > 1 && (
          <div className="max-h-32 overflow-y-auto mb-4 text-sm text-gray-600 bg-gray-50 p-2 rounded">
            <ul className="list-disc pl-5">
              {selectedSoundNames.map((name, index) => (
                <li key={index}>{name}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex justify-end gap-3 mt-6">
          <Button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Delete
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

const SoundList = () => {
  const [sounds, setSounds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isInitialLoading, setIsInitialLoading] = useState(true); // RENAMED: Only for initial data fetch
  const [loadingProgress, setLoadingProgress] = useState(0); // Overall progress
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState(null);
  const [selectedSounds, setSelectedSounds] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(1000);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState(null);

  // Premium warning with time-based throttling
  const lastPremiumWarningTime = useRef(0);
  const PREMIUM_WARNING_THROTTLE = 3000;

  // Refs
  const audioRef = useRef(null);
  const loadingAudioRefs = useRef(new Map());
  const abortControllerRef = useRef(null);

  // Hooks
  const { user } = useAuth();
  const { share, canShare } = useNativeShare();
  const navigate = useNavigate();
  const { setSelectedSound, clearSelectedSound } = useSelectedSound();
  const sendSoundMessage = useSendSoundMessage();

  // Constants
  const API_URL = import.meta.env.VITE_BASE_URL || "";
  const ASSETS_URL = import.meta.env.VITE_ASSETS_URL || "";

  // Computed values
  const isAdmin = user?.role === "ADMIN";
  const isSubscribed = user?.isSubscribed || false;

  // FIXED: Check if any sounds are still loading (for progress indicator only)
  const hasLoadingSounds = sounds.some((sound) => sound.isLoading);
  const loadedSoundsCount = sounds.filter((sound) => !sound.isLoading).length;

  // Friend list data
  const { data: friendListData, isLoading: isFriendListLoading } =
    useFriendList();
  const friends = friendListData?.data?.data?.data || [];
  const friendIds = useMemo(
    () => (!isFriendListLoading ? friends.map((friend) => friend._id) : []),
    [friends, isFriendListLoading]
  );

  // Sounds data
  const {
    data: soundsData,
    isLoading: isFetchingData,
    isError,
  } = useSounds({
    searchTerm: searchTerm,
    page: currentPage,
    limit: limit,
  });

  // Delete mutations
  const deleteSoundMutation = useDeleteSound();
  const deleteMultipleSoundsMutation = useDeleteMultipleSounds();

  // Filtered sounds with memoization
  const filteredSounds = useMemo(() => {
    if (!searchTerm || !searchTerm.trim()) {
      return sounds;
    }
    return sounds.filter((sound) =>
      sound.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sounds, searchTerm]);

  // Helper functions
  const formatDuration = useCallback((seconds) => {
    if (!seconds || isNaN(seconds)) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }, []);

  const showPremiumToast = useCallback(
    (message, soundId = null) => {
      const now = Date.now();

      if (now - lastPremiumWarningTime.current < PREMIUM_WARNING_THROTTLE) {
        return;
      }

      lastPremiumWarningTime.current = now;

      toast.custom(
        (t) => (
          <div className="max-w-xs w-full mx-auto mt-2 bg-red-50 border border-red-200 shadow-lg rounded-lg p-4 flex items-center">
            <div>
              <p className="text-sm font-medium text-red-800">{message}</p>
            </div>
          </div>
        ),
        { duration: 4000 }
      );
    },
    [PREMIUM_WARNING_THROTTLE]
  );

  // FIXED: Enhanced audio duration loading with per-sound tracking
  const loadAudioDurations = useCallback(
    async (soundsList) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      const { signal } = abortControllerRef.current;

      // FIXED: Set all sounds as loading initially
      const soundsWithLoadingState = soundsList.map((sound) => ({
        ...sound,
        isLoading: true, // NEW: Individual loading state
      }));

      setSounds(soundsWithLoadingState);
      setLoadingProgress(0);

      const BATCH_SIZE = 3;
      let processedCount = 0;
      const totalSounds = soundsWithLoadingState.length;

      try {
        for (let i = 0; i < soundsWithLoadingState.length; i += BATCH_SIZE) {
          if (signal.aborted) break;

          const batch = soundsWithLoadingState.slice(i, i + BATCH_SIZE);
          const promises = batch.map((sound, batchIndex) => {
            return new Promise((resolve) => {
              const index = i + batchIndex;

              // If sound already has duration, mark as loaded immediately
              if (sound.duration && sound.duration !== "00:00") {
                processedCount++;
                setLoadingProgress(
                  Math.round((processedCount / totalSounds) * 100)
                );

                // FIXED: Update individual sound loading state immediately
                setSounds((prevSounds) =>
                  prevSounds.map((s) =>
                    s.id === sound.id ? { ...s, isLoading: false } : s
                  )
                );
                resolve();
                return;
              }

              const audioUrl = `${ASSETS_URL}${sound.link}`;
              const audio = new Audio();

              loadingAudioRefs.current.set(sound.id, audio);

              const cleanup = () => {
                loadingAudioRefs.current.delete(sound.id);
                audio.removeEventListener("loadedmetadata", onLoaded);
                audio.removeEventListener("error", onError);
                audio.src = "";
              };

              const timeoutId = setTimeout(() => {
                cleanup();
                processedCount++;
                setLoadingProgress(
                  Math.round((processedCount / totalSounds) * 100)
                );

                // FIXED: Update individual sound when timeout occurs
                setSounds((prevSounds) =>
                  prevSounds.map((s) =>
                    s.id === sound.id
                      ? { ...s, duration: "00:00", isLoading: false }
                      : s
                  )
                );
                resolve();
              }, 3000);

              const onLoaded = () => {
                clearTimeout(timeoutId);
                const duration = formatDuration(audio.duration);
                cleanup();
                processedCount++;
                setLoadingProgress(
                  Math.round((processedCount / totalSounds) * 100)
                );

                // FIXED: Update individual sound when loaded successfully
                setSounds((prevSounds) =>
                  prevSounds.map((s) =>
                    s.id === sound.id
                      ? { ...s, duration: duration, isLoading: false }
                      : s
                  )
                );
                resolve();
              };

              const onError = () => {
                clearTimeout(timeoutId);
                console.warn(`Error loading audio for ${sound.name}`);
                cleanup();
                processedCount++;
                setLoadingProgress(
                  Math.round((processedCount / totalSounds) * 100)
                );

                // FIXED: Update individual sound when error occurs
                setSounds((prevSounds) =>
                  prevSounds.map((s) =>
                    s.id === sound.id
                      ? { ...s, duration: "00:00", isLoading: false }
                      : s
                  )
                );
                resolve();
              };

              if (signal.aborted) {
                cleanup();
                resolve();
                return;
              }

              audio.addEventListener("loadedmetadata", onLoaded);
              audio.addEventListener("error", onError);
              audio.src = audioUrl;
              audio.preload = "metadata";
            });
          });

          await Promise.all(promises);

          // Small delay between batches to prevent overwhelming the browser
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (error) {
        if (!signal.aborted) {
          console.error("Error loading audio durations:", error);
        }
      }

      return soundsWithLoadingState;
    },
    [ASSETS_URL, formatDuration]
  );

  // FIXED: Check individual sound loading state instead of global
  const isSoundReady = useCallback((sound) => {
    return !sound.isLoading; // Each sound is ready when its individual loading is complete
  }, []);

  // FIXED: Enhanced event handlers with per-sound loading state checks
  const toggleSelect = useCallback(
    (id) => {
      const soundToUpdate = sounds.find((sound) => sound.id === id);

      // FIXED: Check individual sound loading state
      if (!isSoundReady(soundToUpdate)) {
        toast.error("Please wait for this sound to finish loading...");
        return;
      }

      if (!isSubscribed && soundToUpdate?.isPremium) {
        showPremiumToast(
          "Please upgrade your subscription to enjoy playing and sharing the Members Only sounds",
          id
        );
        return;
      }

      setSounds((prevSounds) => {
        if (isAdmin) {
          return prevSounds.map((sound) =>
            sound.id === id ? { ...sound, selected: !sound.selected } : sound
          );
        } else {
          if (soundToUpdate && soundToUpdate.selected) {
            return prevSounds.map((sound) =>
              sound.id === id ? { ...sound, selected: false } : sound
            );
          } else {
            return prevSounds.map((sound) =>
              sound.id === id
                ? { ...sound, selected: true }
                : { ...sound, selected: false }
            );
          }
        }
      });
    },
    [sounds, isSubscribed, isAdmin, showPremiumToast, isSoundReady]
  );

  const togglePlaySound = useCallback(
    (id) => {
      const soundToPlay = sounds.find((sound) => sound.id === id);
      if (!soundToPlay) return;

      // FIXED: Check individual sound loading state
      if (!isSoundReady(soundToPlay)) {
        toast.error("Please wait for this sound to finish loading...");
        return;
      }

      if (soundToPlay.isPremium && !isSubscribed) {
        showPremiumToast(
          "Please upgrade your subscription to enjoy playing and sharing the Members Only sounds",
          id
        );
        return;
      }

      const audioUrl = `${ASSETS_URL}${soundToPlay.link}`;

      if (soundToPlay.isPlaying) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        setSounds((prevSounds) =>
          prevSounds.map((sound) => ({ ...sound, isPlaying: false }))
        );
        setCurrentlyPlayingId(null);
        return;
      }

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      setSounds((prevSounds) =>
        prevSounds.map((sound) =>
          sound.id === id
            ? { ...sound, isPlaying: true }
            : { ...sound, isPlaying: false }
        )
      );
      setCurrentlyPlayingId(id);

      const handlePlayError = () => {
        console.error("Error playing audio");
        toast.error("Failed to play audio");
        setSounds((prevSounds) =>
          prevSounds.map((sound) => ({ ...sound, isPlaying: false }))
        );
        setCurrentlyPlayingId(null);
        audioRef.current = null;
      };

      const handlePlayEnd = () => {
        setSounds((prevSounds) =>
          prevSounds.map((sound) => ({ ...sound, isPlaying: false }))
        );
        setCurrentlyPlayingId(null);
        audioRef.current = null;
      };

      audio.onended = handlePlayEnd;
      audio.onerror = handlePlayError;

      audio.play().catch(handlePlayError);
    },
    [sounds, isSubscribed, showPremiumToast, ASSETS_URL, isSoundReady]
  );

  const shareSound = useCallback(async () => {
    const selectedSound = sounds.find((sound) => sound.selected);
    if (!selectedSound) {
      toast.error("No sound selected. Please select a sound first!");
      return;
    }

    // FIXED: Check if selected sound is ready
    if (!isSoundReady(selectedSound)) {
      toast.error("Please wait for the selected sound to finish loading...");
      return;
    }

    const soundUrl = `${API_URL}${selectedSound.link}`;
    const sharePayload = {
      title: selectedSound.name,
      text: soundUrl,
      url: soundUrl,
    };

    if (canShare) {
      try {
        await navigator.share(sharePayload);
        clearSelectedSound();
        toast.success(`"${selectedSound.name}" sound has been shared!`);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Native share failed:", error);
          setShareData(sharePayload);
          setIsShareModalOpen(true);
        }
      }
    } else {
      setShareData(sharePayload);
      setIsShareModalOpen(true);
    }
  }, [sounds, API_URL, canShare, clearSelectedSound, isSoundReady]);

  const downloadSound = useCallback(
    async (sound) => {
      if (!isSubscribed) {
        toast.error("Please upgrade to premium to download sounds!");
        return;
      }

      // FIXED: Check individual sound loading state
      if (!isSoundReady(sound)) {
        toast.error("Please wait for this sound to finish loading...");
        return;
      }

      try {
        const audioUrl = `${ASSETS_URL}${sound.link}`;
        const response = await fetch(audioUrl);
        if (!response.ok) {
          throw new Error("Download failed");
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${sound.name}.mp3`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success(`"${sound.name}" downloaded successfully!`);
      } catch (error) {
        console.error("Download error:", error);
        toast.error("Failed to download sound. Please try again.");
      }
    },
    [isSubscribed, ASSETS_URL, isSoundReady]
  );

  const sendToFriend = useCallback(() => {
    const selectedSound = sounds.find((sound) => sound.selected);
    if (!selectedSound) {
      toast.error("No sound selected. Please select a sound first!");
      return;
    }

    // FIXED: Check if selected sound is ready
    if (!isSoundReady(selectedSound)) {
      toast.error("Please wait for the selected sound to finish loading...");
      return;
    }

    sendSoundMessage.mutate(
      {
        users: friendIds,
        link: `${API_URL}${selectedSound?.link}`,
        soundTitle: selectedSound?.name || undefined,
      },
      {
        onSuccess: () => {
          toast.success(
            `Sound "${selectedSound.name}" sent successfully! to all friends`
          );
          clearSelectedSound();
          navigate("/all-friends");
        },
      }
    );
  }, [
    sounds,
    friendIds,
    API_URL,
    sendSoundMessage,
    clearSelectedSound,
    navigate,
    isSoundReady,
  ]);

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const openDeleteModal = useCallback(() => {
    // FIXED: Allow delete if at least one selected sound is ready
    const selectedSoundsObjects = sounds.filter((sound) => sound.selected);
    const hasReadySelectedSounds = selectedSoundsObjects.some((sound) =>
      isSoundReady(sound)
    );

    if (!hasReadySelectedSounds) {
      toast.error("Please wait for selected sounds to finish loading...");
      return;
    }
    setIsDeleteModalOpen(true);
  }, [sounds, isSoundReady]);

  const confirmDelete = useCallback(() => {
    if (selectedSounds.length === 1) {
      deleteSoundMutation.mutate(selectedSounds[0]);
    } else if (selectedSounds.length > 1) {
      deleteMultipleSoundsMutation.mutate(selectedSounds);
    }
    setIsDeleteModalOpen(false);
  }, [selectedSounds, deleteSoundMutation, deleteMultipleSoundsMutation]);

  // Effects
  useEffect(() => {
    if (soundsData && soundsData.data) {
      const formattedSounds = soundsData.data.map((sound) => ({
        id: sound._id,
        name: sound.title,
        description: sound.description,
        category: sound.category,
        isPremium: sound.isPremium,
        link: sound.link,
        duration: "00:00",
        selected: false,
        isPlaying: false,
        isLoading: true, // NEW: Each sound starts as loading
      }));

      setIsInitialLoading(false); // FIXED: Set initial loading to false first

      // Start duration loading (this will update individual sound loading states)
      loadAudioDurations(formattedSounds);

      if (soundsData.meta) {
        setTotalPages(soundsData.meta.totalPage);
      }
    }
  }, [soundsData, loadAudioDurations]);

  useEffect(() => {
    const selected = sounds
      .filter((sound) => sound.selected)
      .map((sound) => sound.id);
    setSelectedSounds(selected);
  }, [sounds]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      loadingAudioRefs.current.forEach((audio) => {
        audio.src = "";
      });
      loadingAudioRefs.current.clear();

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-[calc(100vh-125px)] justify-between"
    >
      <div className="sticky top-0 bg-background z-30">
        <div className="flex items-center gap-2">
          <div className="relative text-black flex-1 pb-1">
            <input
              type="text"
              placeholder="Search sounds"
              value={searchTerm}
              onChange={handleSearch}
              className="w-full p-3 pl-10 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Search sounds"
              disabled={isInitialLoading} // FIXED: Only disable during initial loading
            />
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          </div>
          {isAdmin && (
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-primary hover:bg-blue-600 text-white px-3 py-3.5 rounded-lg h-auto flex items-center gap-2 mb-1"
              aria-label="Add new sound"
              disabled={isInitialLoading} // FIXED: Only disable during initial loading
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add Sound</span>
            </Button>
          )}
        </div>

        {/* FIXED: Show progress only when sounds are loading */}
        {hasLoadingSounds && sounds.length > 0 && (
          <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800">
                 Please wait, Sound Loading...
                </p>
                <div className="w-full bg-blue-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${loadingProgress}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-xs font-medium text-blue-600">
                {loadingProgress}%
              </span>
            </div>
          </div>
        )}

        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-between py-2 px-1 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 mb-3 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    !hasLoadingSounds
                      ? "bg-green-500"
                      : "bg-blue-500 animate-pulse"
                  }`}
                ></div>
                <span className="text-sm font-medium text-blue-800">
                  Total Sounds:
                  <span className="ml-1 px-2 py-1 bg-blue-600 text-white rounded-full text-xs font-semibold">
                    {sounds.length}
                  </span>
                </span>
              </div>
              {/* FIXED: Show ready count */}
              {hasLoadingSounds && (
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-green-300 rounded-full"></div>
                  <span className="text-sm font-medium text-green-700">
                    Ready:
                    <span className="ml-1 px-2 py-1 bg-green-600 text-white rounded-full text-xs font-semibold">
                      {loadedSoundsCount}
                    </span>
                  </span>
                </div>
              )}
              {searchTerm && filteredSounds.length !== sounds.length && (
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-blue-300 rounded-full"></div>
                  <span className="text-sm font-medium text-indigo-700">
                    Filtered:
                    <span className="ml-1 px-2 py-1 bg-indigo-600 text-white rounded-full text-xs font-semibold">
                      {filteredSounds.length}
                    </span>
                  </span>
                </div>
              )}
            </div>
            {searchTerm && filteredSounds.length !== sounds.length && (
              <div className="text-xs text-indigo-600 font-medium">
                {Math.round((filteredSounds.length / sounds.length) * 100)}%
                shown
              </div>
            )}
          </motion.div>
        )}

        <div className="sticky bottom-0 bg-background pt-3 space-y-2">
          <motion.div
            initial={{ y: 20, opacity: 1 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col gap-2"
          >
            <AnimatePresence>
              {isAdmin && selectedSounds.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Button
                    onClick={openDeleteModal}
                    className="flex items-center justify-center gap-2 px-6 py-3 w-full bg-red-500 rounded-full h-auto hover:bg-red-600 text-white font-medium disabled:opacity-50"
                    aria-label={`Delete ${
                      selectedSounds.length
                    } selected sound${selectedSounds.length > 1 ? "s" : ""}`}
                    disabled={isInitialLoading} // FIXED: Only disable during initial loading
                  >
                    <Trash2 size={18} />
                    Delete{" "}
                    {selectedSounds.length > 1
                      ? `Selected Sounds (${selectedSounds.length})`
                      : "Selected Sound"}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {!isAdmin && (
              <Button
                onClick={shareSound}
                disabled={
                  !sounds.some((sound) => sound.selected) || isInitialLoading
                } // FIXED: Only check initial loading
                className="flex items-center justify-center gap-2.5 px-6 py-3 w-full bg-primary rounded-full h-auto hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium"
                aria-label="Share selected sound"
              >
                <Share2 size={18} />
                {canShare ? (
                  <span className="rounded-full">Share Sound</span>
                ) : (
                  "Share Sound"
                )}
              </Button>
            )}
          </motion.div>
        </div>
      </div>

      <div className="overflow-y-auto scroll-container flex-1 my-2">
        <AnimatePresence>
          {isInitialLoading || isFetchingData ? (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-64"
            >
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
              <p className="text-muted-foreground">Loading sounds...</p>
            </motion.div>
          ) : isError ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-64"
            >
              <p className="text-red-500">Error loading sounds</p>
            </motion.div>
          ) : filteredSounds.length > 0 ? (
            <motion.div className="space-y-2 opacity-100">
              {filteredSounds.map((sound) => {
                const soundReady = isSoundReady(sound); // FIXED: Check individual sound readiness
                return (
                  <motion.div
                    key={sound.id}
                    initial={{ opacity: 1, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-center p-3 rounded-lg ${
                      sound.selected
                        ? "border bg-blue-50 text-black border-blue-200"
                        : ""
                    } hover:bg-gray-50 hover:text-black transition-colors ${
                      !soundReady ? "opacity-60" : "" // FIXED: Only dim if individual sound is loading
                    }`}
                  >
                    <div
                      className={`flex items-center cursor-pointer ${
                        !isSubscribed && sound.isPremium
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      } ${!soundReady ? "cursor-not-allowed" : ""}`} // FIXED: Check individual sound readiness
                      onClick={() => toggleSelect(sound.id)}
                    >
                      <Checkbox
                        id={`sound-${sound.id}`}
                        checked={sound.selected}
                        onCheckedChange={() => toggleSelect(sound.id)}
                        disabled={
                          (!isSubscribed && sound.isPremium) || !soundReady
                        } // FIXED: Check individual sound readiness
                        className="w-5 h-5 border-2 border-gray-300 rounded mr-3"
                        aria-label={`Select ${sound.name}`}
                      />
                      <div className="mr-3">
                        <p className="text-sm font-medium">{sound.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {sound.isLoading ? ( // FIXED: Check individual sound loading state
                            <span className="flex items-center gap-1">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Loading...
                            </span>
                          ) : (
                            sound.duration
                          )}
                          {sound.isPremium && (
                            <span className="ml-2 text-amber-500 font-medium">
                              Members Only
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex-1 mx-2">
                      <AudioWave
                        isPlaying={sound.isPlaying}
                        isLoading={sound.isLoading}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      {isSubscribed && (
                        <motion.button
                          whileHover={{ scale: soundReady ? 1.05 : 1 }}
                          whileTap={{ scale: soundReady ? 0.95 : 1 }}
                          onClick={() => downloadSound(sound)}
                          className="rounded-full w-10 h-8 flex items-center justify-center text-white bg-green-500 hover:bg-green-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Download Sound"
                          aria-label={`Download ${sound.name}`}
                          disabled={!soundReady} // FIXED: Check individual sound readiness
                        >
                          <Download size={14} />
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: soundReady ? 1.05 : 1 }}
                        whileTap={{ scale: soundReady ? 0.95 : 1 }}
                        onClick={() => togglePlaySound(sound.id)}
                        className={`rounded-full w-16 h-8 flex items-center justify-center text-white text-xs font-medium ${
                          sound.isPlaying
                            ? "bg-red-500 hover:bg-red-600"
                            : "bg-primary hover:bg-blue-600"
                        } transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                        aria-label={`${sound.isPlaying ? "Stop" : "Play"} ${
                          sound.name
                        }`}
                        disabled={!soundReady} // FIXED: Check individual sound readiness
                      >
                        {sound.isPlaying ? "Stop" : "Play"}
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-64"
            >
              <p className="text-muted-foreground">No sounds found</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 mb-4">
          <div className="flex justify-center">
            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              disabled={isInitialLoading} // FIXED: Only disable during initial loading
            />
          </div>
        </div>
      )}

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        selectedSounds={selectedSounds}
        sounds={sounds}
      />

      {isAddModalOpen && (
        <SoundModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}

      {isShareModalOpen && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          shareData={shareData}
        />
      )}
    </motion.div>
  );
};

export default SoundList;

// --- old version corrected ---
// src\components\Sounds\SoundList.jsx
// import { useState, useEffect, useRef } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Checkbox } from "../ui/checkbox";
// import { Button } from "../ui/button";
// import { Search, Trash2, Plus, Share2, Download } from "lucide-react";
// import { useNativeShare } from "../../hooks/useNativeShare";
// import {
//   useSounds,
//   useDeleteSound,
//   useDeleteMultipleSounds,
// } from "./../../hooks/useSound";
// import toast from "react-hot-toast";
// import { useAuth } from "../../contexts/AuthContext";
// import SoundModal from "./SoundModal";
// import Pagination from "../ui/pagination";
// import { useSelectedSound } from "../../contexts/SelectedSoundContext";
// import { useNavigate } from "react-router-dom";
// import { useFriendList } from "../../hooks/useConnections";
// import { useSendSoundMessage } from "../../hooks/useMessages";
// import ShareModal from "../ShareModal";

// const SoundList = () => {
//   const [sounds, setSounds] = useState([]);
//   const [filteredSounds, setFilteredSounds] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isLoading, setIsLoading] = useState(true);
//   const [currentlyPlayingId, setCurrentlyPlayingId] = useState(null);
//   const [selectedSounds, setSelectedSounds] = useState([]);
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [limit] = useState(1000);
//   const audioRef = useRef(null);
//   const { user } = useAuth();
//   const [isShareModalOpen, setIsShareModalOpen] = useState(false);
//   const [shareData, setShareData] = useState(null);
//   const { share, canShare } = useNativeShare();
//   const API_URL = import.meta.env.VITE_BASE_URL || "";
//   const navigate = useNavigate();
//   const { setSelectedSound, clearSelectedSound } = useSelectedSound();
//   const sendSoundMessage = useSendSoundMessage();
//   const [hasShownPremiumWarning, setHasShownPremiumWarning] = useState(false);

//   const showPremiumToast = (message) => {
//     toast.custom(
//       (t) => (
//         <div className="max-w-xs w-full mx-auto mt-2 bg-red-50 border border-red-200 shadow-lg rounded-lg p-4 flex items-center">
//           <div className="">
//             <p className="text-sm font-medium text-red-800">{message}</p>
//           </div>
//         </div>
//       ),
//       { duration: 4000 }
//     );
//   };

//   const { data: friendListData, isLoading: isFriendListLoading } =
//     useFriendList();
//   const friends = friendListData?.data?.data?.data || [];
//   const friendIds = !isFriendListLoading
//     ? friends.map((friend) => friend._id)
//     : [];

//   const isAdmin = user?.role === "ADMIN";
//   const isSubscribed = user?.isSubscribed || false;

//   const shareSound = async () => {
//     const selectedSound = sounds.find((sound) => sound.selected);
//     if (!selectedSound) {
//       toast.error("No sound selected. Please select a sound first!");
//       return;
//     }
//     const soundUrl = `${API_URL}${selectedSound.link}`;
//     const sharePayload = {
//       title: selectedSound.name,
//       text: soundUrl,
//       url: soundUrl,
//     };

//     if (canShare) {
//       try {
//         await navigator.share(sharePayload);
//         clearSelectedSound();
//         toast.success(`"${selectedSound.name}" sound has been shared!`);
//       } catch (error) {
//         if (error.name === "AbortError") {
//         } else {
//           console.error("Native share failed:", error);
//           setShareData(sharePayload);
//           setIsShareModalOpen(true);
//         }
//       }
//     } else {
//       setShareData(sharePayload);
//       setIsShareModalOpen(true);
//     }
//   };

//   const downloadSound = async (sound) => {
//     if (!isSubscribed) {
//       toast.error("Please upgrade to premium to download sounds!");
//       return;
//     }

//     try {
//       const audioUrl = `${import.meta.env.VITE_ASSETS_URL}${sound.link}`;
//       const response = await fetch(audioUrl);

//       if (!response.ok) {
//         throw new Error("Download failed");
//       }

//       const blob = await response.blob();
//       const url = window.URL.createObjectURL(blob);
//       const link = document.createElement("a");
//       link.href = url;
//       link.download = `${sound.name}.mp3`;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       window.URL.revokeObjectURL(url);

//       toast.success(`"${sound.name}" downloaded successfully!`);
//     } catch (error) {
//       console.error("Download error:", error);
//       toast.error("Failed to download sound. Please try again.");
//     }
//   };

//   const loadAudioDurations = async (soundsList) => {
//     const soundsWithDurations = [...soundsList];
//     const BATCH_SIZE = 5;
//     for (let i = 0; i < soundsWithDurations.length; i += BATCH_SIZE) {
//       const batch = soundsWithDurations.slice(i, i + BATCH_SIZE);

//       const promises = batch.map((sound, batchIndex) => {
//         return new Promise((resolve) => {
//           const index = i + batchIndex;
//           if (sound.duration && sound.duration !== "00:00") {
//             resolve();
//             return;
//           }
//           const audioUrl = `${import.meta.env.VITE_ASSETS_URL}${sound.link}`;
//           const audio = new Audio();
//           const timeoutId = setTimeout(() => {
//             audio.removeEventListener("loadedmetadata", onLoaded);
//             audio.removeEventListener("error", onError);
//             soundsWithDurations[index].duration = "00:00";
//             resolve();
//           }, 5000);

//           const onLoaded = () => {
//             clearTimeout(timeoutId);
//             const duration = formatDuration(audio.duration);
//             soundsWithDurations[index].duration = duration;
//             audio.removeEventListener("loadedmetadata", onLoaded);
//             audio.removeEventListener("error", onError);
//             audio.src = "";
//             resolve();
//           };

//           const onError = () => {
//             clearTimeout(timeoutId);
//             console.error(`Error loading audio for ${sound.name}`);
//             soundsWithDurations[index].duration = "00:00";
//             audio.removeEventListener("loadedmetadata", onLoaded);
//             audio.removeEventListener("error", onError);
//             resolve();
//           };
//           audio.addEventListener("loadedmetadata", onLoaded);
//           audio.addEventListener("error", onError);
//           audio.src = audioUrl;
//           audio.preload = "metadata";
//         });
//       });
//       await Promise.all(promises);
//       setSounds([...soundsWithDurations]);
//       setFilteredSounds([...soundsWithDurations]);
//     }
//     return soundsWithDurations;
//   };

//   const {
//     data: soundsData,
//     isLoading: isFetchingData,
//     isError,
//   } = useSounds({
//     searchTerm: searchTerm,
//     page: currentPage,
//     limit: limit,
//   });

//   // Delete mutations
//   const deleteSoundMutation = useDeleteSound();
//   const deleteMultipleSoundsMutation = useDeleteMultipleSounds();

//   // Helper function to format duration
//   const formatDuration = (seconds) => {
//     const minutes = Math.floor(seconds / 60);
//     const remainingSeconds = Math.floor(seconds % 60);
//     return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
//       .toString()
//       .padStart(2, "0")}`;
//   };

//   useEffect(() => {
//     if (soundsData && soundsData.data) {
//       const formattedSounds = soundsData.data.map((sound) => ({
//         id: sound._id,
//         name: sound.title,
//         description: sound.description,
//         category: sound.category,
//         isPremium: sound.isPremium,
//         link: sound.link,
//         duration: "00:00",
//         selected: false,
//         isPlaying: false,
//       }));
//       setSounds(formattedSounds);
//       setFilteredSounds(formattedSounds);
//       loadAudioDurations(formattedSounds);
//       setIsLoading(false);
//       if (soundsData.meta) {
//         setTotalPages(soundsData.meta.totalPage);
//       }
//     }
//   }, [soundsData]);

//   useEffect(() => {
//     const selected = sounds
//       .filter((sound) => sound.selected)
//       .map((sound) => sound.id);
//     setSelectedSounds(selected);
//   }, [sounds]);
//   useEffect(() => {
//     return () => {
//       if (audioRef.current) {
//         audioRef.current.pause();
//         audioRef.current = null;
//       }
//     };
//   }, []);

//   const toggleSelect = (id) => {
//     const soundToUpdate = sounds.find((sound) => sound.id === id);

//     // Check if non-subscribed user is trying to select premium sound
//     if (!isSubscribed && soundToUpdate?.isPremium) {
//       if (!hasShownPremiumWarning) {
//         showPremiumToast(
//           "Please upgrade your subscription to enjoy playing and sharing the Members Only sounds"
//         );
//         setHasShownPremiumWarning(true);
//       }
//       return;
//     }

//     if (isAdmin) {
//       const updatedSounds = sounds.map((sound) =>
//         sound.id === id ? { ...sound, selected: !sound.selected } : sound
//       );
//       setSounds(updatedSounds);
//       applySearch(searchTerm, updatedSounds);
//     } else {
//       if (soundToUpdate && soundToUpdate.selected) {
//         const updatedSounds = sounds.map((sound) =>
//           sound.id === id ? { ...sound, selected: false } : sound
//         );
//         setSounds(updatedSounds);
//         applySearch(searchTerm, updatedSounds);
//       } else {
//         const updatedSounds = sounds.map((sound) =>
//           sound.id === id
//             ? { ...sound, selected: true }
//             : { ...sound, selected: false }
//         );
//         setSounds(updatedSounds);
//         applySearch(searchTerm, updatedSounds);
//       }
//     }
//   };

//   const togglePlaySound = (id) => {
//     const soundToPlay = sounds.find((sound) => sound.id === id);
//     if (!soundToPlay) return;

//     // Check if user can play premium sounds
//     if (soundToPlay.isPremium && !isSubscribed) {
//       if (!hasShownPremiumWarning) {
//         showPremiumToast(
//           "Please upgrade your subscription to enjoy playing and sharing the Members Only sounds"
//         );
//         setHasShownPremiumWarning(true);
//       }
//       return;
//     }

//     const audioUrl = `${import.meta.env.VITE_ASSETS_URL}${soundToPlay.link}`;
//     if (soundToPlay.isPlaying) {
//       if (audioRef.current) {
//         audioRef.current.pause();
//         audioRef.current = null;
//       }
//       const updatedSounds = sounds.map((sound) => ({
//         ...sound,
//         isPlaying: false,
//       }));
//       setSounds(updatedSounds);
//       applySearch(searchTerm, updatedSounds);
//       setCurrentlyPlayingId(null);
//       return;
//     }

//     if (audioRef.current) {
//       audioRef.current.pause();
//       audioRef.current = null;
//     }

//     const audio = new Audio(audioUrl);
//     audioRef.current = audio;
//     const updatedSounds = sounds.map((sound) =>
//       sound.id === id
//         ? { ...sound, isPlaying: true }
//         : { ...sound, isPlaying: false }
//     );
//     setSounds(updatedSounds);
//     applySearch(searchTerm, updatedSounds);
//     setCurrentlyPlayingId(id);

//     audio.play().catch((error) => {
//       console.error("Error playing audio:", error);
//       toast.error("Failed to play audio");
//       const resetSounds = sounds.map((sound) => ({
//         ...sound,
//         isPlaying: false,
//       }));
//       setSounds(resetSounds);
//       applySearch(searchTerm, resetSounds);
//       setCurrentlyPlayingId(null);
//       audioRef.current = null;
//     });

//     audio.onended = () => {
//       const updatedSounds = sounds.map((sound) => ({
//         ...sound,
//         isPlaying: false,
//       }));
//       setSounds(updatedSounds);
//       applySearch(searchTerm, updatedSounds);
//       setCurrentlyPlayingId(null);
//       audioRef.current = null;
//     };
//   };

//   const sendToFriend = () => {
//     const selectedSound = sounds.find((sound) => sound.selected);
//     if (selectedSound) {
//       sendSoundMessage.mutate(
//         {
//           users: friendIds,
//           link: `${API_URL}${selectedSound?.link}`,
//           soundTitle: selectedSound?.name || undefined,
//         },
//         {
//           onSuccess: () => {
//             toast.success(
//               `Sound "${selectedSound.name}" sent successfully! to all friends`
//             );
//             clearSelectedSound();
//             navigate("/all-friends");
//           },
//         }
//       );
//     } else {
//       toast.error("No sound selected. Please select a sound first!");
//       clearSelectedSound();
//     }
//   };

//   const openDeleteModal = () => {
//     setIsDeleteModalOpen(true);
//   };

//   const confirmDelete = () => {
//     if (selectedSounds.length === 1) {
//       deleteSoundMutation.mutate(selectedSounds[0]);
//     } else if (selectedSounds.length > 1) {
//       deleteMultipleSoundsMutation.mutate(selectedSounds);
//     }
//     setIsDeleteModalOpen(false);
//   };

//   const handleSearch = (e) => {
//     const term = e.target.value;
//     setSearchTerm(term);
//     applySearch(term, sounds);
//   };

//   const applySearch = (term, soundList) => {
//     if (!term || !term.trim()) {
//       setFilteredSounds(soundList);
//     } else {
//       const filtered = soundList.filter((sound) =>
//         sound.name.toLowerCase().includes(term.toLowerCase())
//       );
//       setFilteredSounds(filtered);
//     }
//   };

//   const handlePageChange = (page) => {
//     setCurrentPage(page);
//   };

//   const AudioWave = ({ isPlaying }) => {
//     const generateLines = () => {
//       const lineCount = 67;
//       const lines = [];

//       for (let i = 0; i < lineCount; i++) {
//         const minHeight = isPlaying ? 5 : 8;
//         const maxHeight = isPlaying ? 18 : 14;
//         const height =
//           Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
//         lines.push(height);
//       }

//       return lines;
//     };

//     const [waveLines, setWaveLines] = useState(generateLines());
//     const [animationSpeed] = useState(150);

//     useEffect(() => {
//       let animationTimer;

//       if (isPlaying) {
//         animationTimer = setInterval(() => {
//           setWaveLines((prevLines) => {
//             const newLines = [...prevLines];
//             for (let i = 0; i < 10; i++) {
//               const randomIndex = Math.floor(Math.random() * newLines.length);
//               const minHeight = 5;
//               const maxHeight = 18;
//               newLines[randomIndex] =
//                 Math.floor(Math.random() * (maxHeight - minHeight + 1)) +
//                 minHeight;
//             }
//             return newLines;
//           });
//         }, animationSpeed);
//       }

//       return () => {
//         if (animationTimer) {
//           clearInterval(animationTimer);
//         }
//       };
//     }, [isPlaying, animationSpeed]);

//     return (
//       <svg viewBox={`0 0 ${waveLines.length * 2} 24`} className="w-full h-8">
//         {waveLines.map((height, index) => {
//           const startY = 12 - height / 2;
//           const endY = 12 + height / 2;

//           return (
//             <line
//               key={index}
//               x1={index * 2}
//               y1={startY}
//               x2={index * 2}
//               y2={endY}
//               stroke={isPlaying ? "#00ae34" : "#D1D5DB"}
//               strokeWidth="0.5"
//               strokeLinecap="round"
//             />
//           );
//         })}
//       </svg>
//     );
//   };

//   const DeleteModal = () => {
//     if (!isDeleteModalOpen) return null;

//     const selectedCount = selectedSounds.length;
//     const selectedSoundNames = sounds
//       .filter((sound) => sound.selected)
//       .map((sound) => sound.name);

//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//         <motion.div
//           initial={{ scale: 0.95, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           className="bg-white text-black rounded-lg p-6 w-11/12 max-w-md shadow-lg"
//         >
//           <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>

//           <p className="mb-4">
//             {selectedCount === 1
//               ? `Are you sure you want to delete "${selectedSoundNames[0]}"?`
//               : `Are you sure you want to delete ${selectedCount} selected sounds?`}
//           </p>

//           {selectedCount > 1 && (
//             <div className="max-h-32 overflow-y-auto mb-4 text-sm text-gray-600 bg-gray-50 p-2 rounded">
//               <ul className="list-disc pl-5">
//                 {selectedSoundNames.map((name, index) => (
//                   <li key={index}>{name}</li>
//                 ))}
//               </ul>
//             </div>
//           )}

//           <div className="flex justify-end gap-3 mt-6">
//             <Button
//               onClick={() => setIsDeleteModalOpen(false)}
//               className="bg-gray-200 hover:bg-gray-300 text-gray-800"
//             >
//               Cancel
//             </Button>
//             <Button
//               onClick={confirmDelete}
//               className="bg-red-500 hover:bg-red-600 text-white"
//             >
//               Delete
//             </Button>
//           </div>
//         </motion.div>
//       </div>
//     );
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       className="flex flex-col h-[calc(100vh-125px)] justify-between"
//     >
//       <div className="sticky top-0 bg-background z-30">
//         <div className="flex items-center gap-2">
//           <div className="relative text-black flex-1 pb-1">
//             <input
//               type="text"
//               placeholder="Search sounds"
//               value={searchTerm}
//               onChange={handleSearch}
//               className="w-full p-3 pl-10 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//             <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
//           </div>

//           {isAdmin && (
//             <Button
//               onClick={() => setIsAddModalOpen(true)}
//               className="bg-primary hover:bg-blue-600 text-white px-3 py-3.5 rounded-lg h-auto flex items-center gap-2 mb-1"
//             >
//               <Plus size={18} />
//               <span className="hidden sm:inline">Add Sound</span>
//             </Button>
//           )}
//         </div>

//         {isAdmin && (
//           <motion.div
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.3 }}
//             className="flex items-center justify-between py-2 px-1 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 mb-3 shadow-sm"
//           >
//             <div className="flex items-center gap-4">
//               <div className="flex items-center gap-2">
//                 <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
//                 <span className="text-sm font-medium text-blue-800">
//                   Total Sounds:
//                   <span className="ml-1 px-2 py-1 bg-blue-600 text-white rounded-full text-xs font-semibold">
//                     {sounds.length}
//                   </span>
//                 </span>
//               </div>

//               {searchTerm && filteredSounds.length !== sounds.length && (
//                 <div className="flex items-center gap-2">
//                   <div className="w-1 h-4 bg-blue-300 rounded-full"></div>
//                   <span className="text-sm font-medium text-indigo-700">
//                     Filtered:
//                     <span className="ml-1 px-2 py-1 bg-indigo-600 text-white rounded-full text-xs font-semibold">
//                       {filteredSounds.length}
//                     </span>
//                   </span>
//                 </div>
//               )}
//             </div>

//             {/* Optional: Add percentage indicator when filtering */}
//             {searchTerm && filteredSounds.length !== sounds.length && (
//               <div className="text-xs text-indigo-600 font-medium">
//                 {Math.round((filteredSounds.length / sounds.length) * 100)}%
//                 shown
//               </div>
//             )}
//           </motion.div>
//         )}

//         <div className="sticky bottom-0 bg-background pt-3 space-y-2">
//           <motion.div
//             initial={{ y: 20, opacity: 1 }}
//             animate={{ y: 0, opacity: 1 }}
//             transition={{ delay: 0.2 }}
//             className="flex flex-col gap-2"
//           >
//             {/* Delete button (only shown for admin when sounds are selected) */}
//             <AnimatePresence>
//               {isAdmin && selectedSounds.length > 0 && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: "auto" }}
//                   exit={{ opacity: 0, height: 0 }}
//                 >
//                   <Button
//                     onClick={openDeleteModal}
//                     className="flex items-center justify-center gap-2 px-6 py-3 w-full bg-red-500 rounded-full h-auto hover:bg-red-600 text-white font-medium"
//                   >
//                     <Trash2 size={18} />
//                     Delete{" "}
//                     {selectedSounds.length > 1
//                       ? `Selected Sounds (${selectedSounds.length})`
//                       : "Selected Sound"}
//                   </Button>
//                 </motion.div>
//               )}
//             </AnimatePresence>

//             {/* Share Sound button (only for non-admin users) */}
//             {!isAdmin && (
//               <Button
//                 onClick={shareSound}
//                 disabled={!sounds.some((sound) => sound.selected)}
//                 className="flex items-center justify-center gap-2.5 px-6 py-3 w-full bg-primary rounded-full h-auto hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium"
//               >
//                 <Share2 size={18} />
//                 {canShare ? (
//                   <span className="rounded-full">Share Sound</span>
//                 ) : (
//                   "Share Sound"
//                 )}
//               </Button>
//             )}
//           </motion.div>
//         </div>
//       </div>

//       {/* Sound List - Only this section scrolls */}
//       <div className="overflow-y-auto scroll-container flex-1 my-2">
//         <AnimatePresence>
//           {isLoading || isFetchingData ? (
//             <motion.div
//               initial={{ opacity: 1 }}
//               animate={{ opacity: 1 }}
//               className="flex flex-col items-center justify-center h-64"
//             >
//               <p className="text-muted-foreground">Loading sounds...</p>
//             </motion.div>
//           ) : isError ? (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               className="flex flex-col items-center justify-center h-64"
//             >
//               <p className="text-red-500">Error loading sounds</p>
//             </motion.div>
//           ) : filteredSounds.length > 0 ? (
//             <motion.div className="space-y-2 opacity-100">
//               {filteredSounds.map((sound) => (
//                 <motion.div
//                   key={sound.id}
//                   initial={{ opacity: 1, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, scale: 0.95 }}
//                   transition={{ duration: 0.2 }}
//                   className={`flex items-center p-3 rounded-lg ${
//                     sound.selected
//                       ? "border bg-blue-50 text-black border-blue-200"
//                       : ""
//                   } hover:bg-gray-50 hover:text-black transition-colors`}
//                 >
//                   <div
//                     className={`flex items-center cursor-pointer ${
//                       !isSubscribed && sound.isPremium
//                         ? "opacity-50 cursor-not-allowed"
//                         : ""
//                     }`}
//                     onClick={() => toggleSelect(sound.id)}
//                   >
//                     <Checkbox
//                       id={`sound-${sound.id}`}
//                       checked={sound.selected}
//                       onCheckedChange={() => toggleSelect(sound.id)}
//                       disabled={!isSubscribed && sound.isPremium}
//                       className="w-5 h-5 border-2 border-gray-300 rounded mr-3"
//                     />

//                     <div className="mr-3">
//                       <p className="text-sm font-medium">{sound.name}</p>
//                       <p className="text-xs text-muted-foreground">
//                         {sound.duration}
//                         {sound.isPremium && (
//                           <span className="ml-2 text-amber-500 font-medium">
//                             Members Only
//                           </span>
//                         )}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="flex-1 mx-2">
//                     {/* Dynamic waveform */}
//                     <AudioWave isPlaying={sound.isPlaying} />
//                   </div>

//                   <div className="flex items-center gap-2">
//                     {/* Download button - only for subscribed users */}
//                     {isSubscribed && (
//                       <motion.button
//                         whileHover={{ scale: 1.05 }}
//                         whileTap={{ scale: 0.95 }}
//                         onClick={() => downloadSound(sound)}
//                         className="rounded-full w-10 h-8 flex items-center justify-center text-white bg-green-500 hover:bg-green-600 transition-colors shadow-sm"
//                         title="Download Sound"
//                       >
//                         <Download size={14} />
//                       </motion.button>
//                     )}

//                     <motion.button
//                       whileHover={{ scale: 1.05 }}
//                       whileTap={{ scale: 0.95 }}
//                       onClick={() => togglePlaySound(sound.id)}
//                       className={`rounded-full w-16 h-8 flex items-center justify-center text-white text-xs font-medium ${
//                         sound.isPlaying
//                           ? "bg-red-500 hover:bg-red-600"
//                           : "bg-primary hover:bg-blue-600"
//                       } transition-colors shadow-sm`}
//                     >
//                       {sound.isPlaying ? "Stop" : "Play"}
//                     </motion.button>
//                   </div>
//                 </motion.div>
//               ))}
//             </motion.div>
//           ) : (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               className="flex flex-col items-center justify-center h-64"
//             >
//               <p className="text-muted-foreground">No sounds found</p>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>

//       {/* Pagination */}
//       {totalPages > 1 && (
//         <div className="mt-4 mb-4">
//           <div className="flex justify-center">
//             <Pagination
//               totalPages={totalPages}
//               currentPage={currentPage}
//               onPageChange={handlePageChange}
//             />
//           </div>
//         </div>
//       )}

//       {/* Modals */}
//       <DeleteModal />
//       {isAddModalOpen && (
//         <SoundModal
//           isOpen={isAddModalOpen}
//           onClose={() => setIsAddModalOpen(false)}
//         />
//       )}
//       {isShareModalOpen && (
//         <ShareModal
//           isOpen={isShareModalOpen}
//           onClose={() => setIsShareModalOpen(false)}
//           shareData={shareData}
//         />
//       )}
//     </motion.div>
//   );
// };

// export default SoundList;
