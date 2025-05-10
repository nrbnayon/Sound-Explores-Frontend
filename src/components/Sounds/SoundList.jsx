// src\components\Sounds\SoundList.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { Search } from "lucide-react";

const SoundList = () => {
  const [sounds, setSounds] = useState([
    {
      id: 1,
      name: "Relaxing Melody",
      duration: "00:45",
      selected: false,
      isPlaying: false,
    },
    {
      id: 2,
      name: "Energetic Beat",
      duration: "00:30",
      selected: true,
      isPlaying: false,
    },
    {
      id: 3,
      name: "Nature Ambience",
      duration: "01:15",
      selected: false,
      isPlaying: false,
    },
    {
      id: 4,
      name: "Urban Rhythm",
      duration: "00:50",
      selected: false,
      isPlaying: false,
    },
    {
      id: 5,
      name: "Acoustic Guitar",
      duration: "00:38",
      selected: false,
      isPlaying: false,
    },
    {
      id: 6,
      name: "Soft Piano",
      duration: "01:20",
      selected: false,
      isPlaying: false,
    },
    {
      id: 7,
      name: "Soft Piano",
      duration: "01:20",
      selected: false,
      isPlaying: false,
    },
    {
      id: 8,
      name: "Soft Piano",
      duration: "01:20",
      selected: false,
      isPlaying: false,
    },
    {
      id: 9,
      name: "Soft Piano",
      duration: "01:20",
      selected: false,
      isPlaying: false,
    },
    {
      id: 10,
      name: "Soft Piano",
      duration: "01:20",
      selected: false,
      isPlaying: false,
    },
    {
      id: 11,
      name: "Soft Piano",
      duration: "01:20",
      selected: false,
      isPlaying: false,
    },
    {
      id: 12,
      name: "Soft Piano",
      duration: "01:20",
      selected: false,
      isPlaying: false,
    },
    {
      id: 13,
      name: "Soft Piano",
      duration: "01:20",
      selected: false,
      isPlaying: false,
    },
    {
      id: 14,
      name: "Soft Piano",
      duration: "01:20",
      selected: false,
      isPlaying: false,
    },
    {
      id: 15,
      name: "Soft Piano",
      duration: "01:20",
      selected: false,
      isPlaying: false,
    },
    {
      id: 16,
      name: "Soft Piano",
      duration: "01:20",
      selected: false,
      isPlaying: false,
    },
  ]);

  const [filteredSounds, setFilteredSounds] = useState(sounds);
  const [searchTerm, setSearchTerm] = useState("");

  // Toggle sound selection with ability to unselect
  const toggleSelect = (id) => {
    const soundToUpdate = sounds.find((sound) => sound.id === id);

    // If sound is already selected, unselect it, otherwise select it and unselect others
    if (soundToUpdate && soundToUpdate.selected) {
      const updatedSounds = sounds.map((sound) =>
        sound.id === id ? { ...sound, selected: false } : sound
      );
      setSounds(updatedSounds);
      applySearch(searchTerm, updatedSounds);
    } else {
      const updatedSounds = sounds.map((sound) =>
        sound.id === id
          ? { ...sound, selected: true }
          : { ...sound, selected: false }
      );
      setSounds(updatedSounds);
      applySearch(searchTerm, updatedSounds);
    }
  };

  // Play/pause sound function (only one at a time)
  const togglePlaySound = (id) => {
    // Stop any currently playing sound and play the new one
    const updatedSounds = sounds.map((sound) =>
      sound.id === id
        ? { ...sound, isPlaying: !sound.isPlaying }
        : { ...sound, isPlaying: false }
    );

    setSounds(updatedSounds);
    applySearch(searchTerm, updatedSounds);
  };

  // Send to friend function (only selected sound)
  const sendToFriend = () => {
    const selectedSound = sounds.find((sound) => sound.selected);
    if (selectedSound) {
      console.log("Sending sound to friend:", {
        id: selectedSound.id,
        name: selectedSound.name,
      });
      // Here you would implement the actual send functionality
    }
  };

  // Handle search
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    applySearch(term, sounds);
  };

  // Apply search filter
  const applySearch = (term, soundList) => {
    if (!term || !term.trim()) {
      setFilteredSounds(soundList);
    } else {
      const filtered = soundList.filter((sound) =>
        sound.name.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredSounds(filtered);
    }
  };

  const AudioWave = ({ isPlaying }) => {
    const generateLines = () => {
      const lineCount = 67;
      const lines = [];

      for (let i = 0; i < lineCount; i++) {
        const minHeight = isPlaying ? 5 : 8;
        const maxHeight = isPlaying ? 18 : 14;
        const height =
          Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
        lines.push(height);
      }

      return lines;
    };

    const [waveLines, setWaveLines] = useState(generateLines());
    const [animationSpeed] = useState(150);

    useEffect(() => {
      let animationTimer;

      if (isPlaying) {
        animationTimer = setInterval(() => {
          setWaveLines((prevLines) => {
            const newLines = [...prevLines];
            for (let i = 0; i < 10; i++) {
              const randomIndex = Math.floor(Math.random() * newLines.length);
              const minHeight = 5;
              const maxHeight = 18;
              newLines[randomIndex] =
                Math.floor(Math.random() * (maxHeight - minHeight + 1)) +
                minHeight;
            }
            return newLines;
          });
        }, animationSpeed);
      }

      return () => {
        if (animationTimer) {
          clearInterval(animationTimer);
        }
      };
    }, [isPlaying, animationSpeed]);

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-[calc(100vh-125px)] justify-between"
    >
      {/* Search Bar */}
      <div className="sticky top-0 z-10 bg-background pb-2">
        <div className="relative text-black">
          <input
            type="text"
            placeholder="Search sounds"
            value={searchTerm}
            onChange={handleSearch}
            className="w-full p-3 pl-10 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      {/* Sound List - Only this section scrolls */}
      <div className="overflow-y-auto scroll-container flex-1 my-2">
        <AnimatePresence>
          {filteredSounds.length > 0 ? (
            <motion.div className="space-y-2">
              {filteredSounds.map((sound) => (
                <motion.div
                  key={sound.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-center p-3 rounded-lg ${
                    sound.selected
                      ? "border bg-blue-50 text-black border-blue-200"
                      : ""
                  } hover:bg-gray-50 hover:text-black transition-colors`}
                >
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => toggleSelect(sound.id)}
                  >
                    <Checkbox
                      id={`sound-${sound.id}`}
                      checked={sound.selected}
                      onCheckedChange={() => toggleSelect(sound.id)}
                      className="w-5 h-5 border-2 border-gray-300 rounded mr-3"
                    />
                    <div className="mr-3">
                      <p className="text-sm font-medium">{sound.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {sound.duration}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 mx-2">
                    {/* Dynamic waveform */}
                    <AudioWave isPlaying={sound.isPlaying} />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => togglePlaySound(sound.id)}
                    className={`rounded-full w-16 h-8 flex items-center justify-center text-white text-xs font-medium ${
                      sound.isPlaying
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-primary hover:bg-blue-600"
                    } transition-colors shadow-sm`}
                  >
                    {sound.isPlaying ? "Stop" : "Play"}
                  </motion.button>
                </motion.div>
              ))}
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

      {/* Bottom Action Button - Static, doesn't scroll */}
      <div className="sticky bottom-5">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            onClick={sendToFriend}
            disabled={!sounds.some((sound) => sound.selected)}
            className="flex items-center justify-center gap-2.5 px-6 py-3 w-full bg-primary rounded-full h-auto hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium"
          >
            Send to Friend
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SoundList;
