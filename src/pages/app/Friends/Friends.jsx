// src\pages\app\Friends\Friends.jsx
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import FindFriends from "../../../components/Friends/FindFriends";
import YourFriends from "../../../components/Friends/YourFriends";

const Friends = () => {
  const [selectedTab, setSelectedTab] = useState(false); // true = Find Friends, false = Your Friends
  const [searchTerm, setSearchTerm] = useState("");
  const contentRef = useRef(null);

  // Track content height to prevent scrollbar flashing
  const [contentHeight, setContentHeight] = useState("auto");

  const [initialFriends, setInitialFriends] = useState([
    { id: 1, name: "Jane Cooper", image: "/profile.png" },
    { id: 2, name: "Savannah Nguyen", image: "/profile.png" },
    { id: 3, name: "Devon Lane", image: "/profile.png" },
    { id: 4, name: "Annette Black", image: "/profile.png" },
    { id: 5, name: "Floyd Miles", image: "/profile.png" },
    { id: 6, name: "Theresa Webb", image: "/profile.png" },
    { id: 7, name: "Floyd Miles", image: "/profile.png" },
    { id: 8, name: "Theresa Webb", image: "/profile.png" },
    { id: 9, name: "Floyd Miles", image: "/profile.png" },
    { id: 10, name: "Theresa Webb", image: "/profile.png" },
    { id: 11, name: "Floyd Miles", image: "/profile.png" },
    { id: 12, name: "Theresa Webb", image: "/profile.png" },
    { id: 13, name: "Floyd Miles", image: "/profile.png" },
    { id: 14, name: "Theresa Webb", image: "/profile.png" },
    { id: 15, name: "Floyd Miles", image: "/profile.png" },
    { id: 16, name: "Theresa Webb", image: "/profile.png" },
  ]);

  const [filteredFriends, setFilteredFriends] = useState(initialFriends);

  // Handle search
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (!term.trim()) {
      setFilteredFriends(initialFriends);
    } else {
      const filtered = initialFriends.filter((friend) =>
        friend.name.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredFriends(filtered);
    }
  };

  // Update filtered friends when initial friends change
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredFriends(initialFriends);
    } else {
      const filtered = initialFriends.filter((friend) =>
        friend.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFriends(filtered);
    }
  }, [initialFriends, searchTerm]);

  // Lock scroll container height before tab change
  const handleTabChange = (newTabState) => {
    // Only proceed if we're actually changing tabs
    if (selectedTab !== newTabState) {
      // Lock the height to prevent jumps
      if (contentRef.current) {
        setContentHeight(`${contentRef.current.scrollHeight}px`);
      }

      // Change the tab
      setSelectedTab(newTabState);

      // Reset height after animation completes
      setTimeout(() => {
        setContentHeight("auto");
      }, 350); // Slightly longer than animation duration
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-[calc(100vh-120px)] overflow-hidden"
    >
      {/* Tabs - Fixed, doesn't scroll */}
      <div className="sticky top-0 z-10 bg-background">
        <div className="flex mb-4">
          <div className="flex flex-row w-full border-b">
            <motion.button
              whileHover={{ backgroundColor: "#f9fafb" }}
              whileTap={{ scale: 0.95 }}
              className={`w-1/2 py-3 text-center transition-colors ${
                !selectedTab
                  ? "text-primary font-medium border-b-2 border-blue-500"
                  : "text-muted-foreground"
              }`}
              onClick={() => handleTabChange(false)}
            >
              Your Friends
            </motion.button>
            <motion.button
              whileHover={{ backgroundColor: "#f9fafb" }}
              whileTap={{ scale: 0.95 }}
              className={`w-1/2 py-3 text-center transition-colors ${
                selectedTab
                  ? "text-primary font-medium border-b-2 border-blue-500"
                  : "text-muted-foreground"
              }`}
              onClick={() => handleTabChange(true)}
            >
              Find Friends
            </motion.button>
          </div>
        </div>

        {/* Search Bar - Fixed, doesn't scroll */}
        <div className="relative mb-4 text-black">
          <input
            type="text"
            placeholder={
              selectedTab ? "Search for friends" : "Search your friends"
            }
            value={searchTerm}
            onChange={handleSearch}
            className="w-full p-3 pl-10 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      {/* Scrollable content with fixed scrollbar */}
      <div
        className="flex-1 overflow-y-auto scroll-container relative"
        ref={contentRef}
        style={{
          minHeight: "300px",
          height: contentHeight,
          transition: "height 0.3s ease",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTab ? "find" : "your"}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full friends-list-container"
          >
            {selectedTab ? (
              <FindFriends
                friends={filteredFriends}
                setFriends={setInitialFriends}
              />
            ) : (
              <YourFriends
                friends={filteredFriends}
                setFriends={setInitialFriends}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Friends;
