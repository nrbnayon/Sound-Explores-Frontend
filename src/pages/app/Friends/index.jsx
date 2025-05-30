// src\pages\app\Friends\index.jsx
import { useState, useRef, useEffect } from "react";
import { CircleUserRound, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { StatusBar } from "../../../components/common/StatusBar";
import Friends from "./Friends";
import { ThemeToggle } from "../../../components/common/ThemeToggle";

const FriendList = () => {
  // State for sidebar visibility and active section
  const [title, setTitle] = useState("Friends");
  const [scrolled, setScrolled] = useState(false);

  // Refs for detecting clicks outside sidebar
  const mainContentRef = useRef(null);

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

  return (
    <div className="bg-background flex flex-row justify-center w-full min-h-screen ">
      <div
        className="bg-card w-full max-w-md relative shadow-md"
        ref={mainContentRef}
      >
        {/* <StatusBar /> */}

        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={`grid grid-cols-3 items-center p-4 border-b bg-card sticky top-0 z-10 w-full transition-shadow ${
            scrolled ? "shadow-md" : ""
          }`}
        >
          <div className="flex items-center gap-2 justify-start">
            <Link to="/sound-library">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-full hover:bg-background transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.div>
            </Link>
            <ThemeToggle />
          </div>

          <h1 className="text-xl font-bold text-center">{title}</h1>
          <div className="flex justify-end">
            <Link to="/profile">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-full hover:bg-background transition-colors"
              >
                <CircleUserRound className="w-5 h-5" />
              </motion.div>
            </Link>
          </div>
        </motion.div>

        {/* Content Area */}
        <div className="h-[calc(100vh-56px)] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full overflow-y-auto p-4"
            >
              <Friends />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default FriendList;
