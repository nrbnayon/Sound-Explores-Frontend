// Modified SoundLibrary.jsx with Fixed Sidebar Animation

import { useState, useRef, useEffect } from "react";
import { Menu, CircleUserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SideBar from "../../../components/common/SideBar";
import SoundList from "../../../components/Sounds/SoundList";
import { StatusBar } from "../../../components/common/StatusBar";
import Friends from "./Friends";

const FriendList = () => {
  // State for sidebar visibility and active section
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSoundSelected, setIsSoundSelected] = useState(false);
  const [title, setTitle] = useState("Friends");
  const [scrolled, setScrolled] = useState(false);

  // Refs for detecting clicks outside sidebar
  const sidebarRef = useRef(null);
  const mainContentRef = useRef(null);

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar when clicking outside
  const handleOutsideClick = (e) => {
    if (
      sidebarOpen &&
      sidebarRef.current &&
      mainContentRef.current &&
      !sidebarRef.current.contains(e.target) &&
      mainContentRef.current.contains(e.target)
    ) {
      setSidebarOpen(false);
    }
  };

  // Track scroll for shadow effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Add event listener for clicks
  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [sidebarOpen]);

  return (
    <div className="bg-background flex flex-row justify-center w-full min-h-screen ">
      <div
        className="bg-card w-full max-w-md relative shadow-md"
        ref={mainContentRef}
      >
        <StatusBar />

        {/* Sidebar - FIXED ANIMATION HERE */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              ref={sidebarRef}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed top-0 z-40 bg-card w-56 h-full shadow-lg"
            >
              <SideBar
                onTitleChange={setTitle}
                onSoundListChange={setIsSoundSelected}
                onClose={toggleSidebar}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={`flex items-center justify-between p-4 border-b bg-card sticky top-0 z-10 w-full transition-shadow ${
            scrolled ? "shadow-md" : ""
          }`}
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-full hover:bg-background transition-colors"
            onClick={toggleSidebar}
          >
            <Menu className="w-5 h-5" />
          </motion.button>
          <h1 className="text-xl font-bold">{title}</h1>
          <Link to="/profile">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full hover:bg-background transition-colors"
            >
              <CircleUserRound className="w-5 h-5" />
            </motion.div>
          </Link>
        </motion.div>

        {/* Content Area */}
        <div className="h-[calc(100vh-56px)] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={isSoundSelected ? "sounds" : "friends"}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full overflow-y-auto p-4"
            >
              {isSoundSelected ? <SoundList /> : <Friends />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Overlay for mobile when sidebar is open */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0  bg-opacity-60 z-30"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FriendList;
