import { useEffect, useState, useRef } from "react";
import {
  ChevronLeft,
  MoreVertical,
  X,
  Music2Icon,
  UsersRound,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Header = ({ backHref, title, onLogoutClick }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);

  // Toggle options menu
  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex items-center justify-between p-4 border-b bg-card sticky top-0 z-10 transition-shadow ${
        scrolled ? "shadow-md" : ""
      }`}
    >
      <div className="flex items-center">
        <Link to={backHref}>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-full hover:bg-background transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.div>
        </Link>
      </div>
      <div>
        {" "}
        <h1 className="text-xl font-bold">{title}</h1>
      </div>
      <div className="relative" ref={menuRef}>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-full hover:bg-background transition-colors"
          onClick={toggleOptions}
        >
          {showOptions ? (
            <X className="w-5 h-5" />
          ) : (
            <MoreVertical className="w-5 h-5" />
          )}
        </motion.button>

        {/* Dropdown menu */}
        <AnimatePresence>
          {showOptions && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-48 bg-card rounded-lg shadow-lg border border-gray-100 z-20 overflow-hidden"
            >
              <div className="py-1">
                <Link
                  to="/sound-library"
                  className="flex items-center px-4 py-3 hover:bg-background"
                  onClick={() => setShowOptions(false)}
                >
                  <Music2Icon className="w-4 h-4 mr-3 text-muted-foreground" />
                  <span className="text-sm font-medium">Sound Library</span>
                </Link>
                <Link
                  to="/all-friends"
                  className="flex items-center px-4 py-3 hover:bg-background"
                  onClick={() => setShowOptions(false)}
                >
                  <UsersRound className="w-4 h-4 mr-3 text-muted-foreground" />
                  <span className="text-sm font-medium">Friends</span>
                </Link>
                <Link
                  to="/privacy-policy"
                  className="flex items-center px-4 py-3 hover:bg-background"
                  onClick={() => setShowOptions(false)}
                >
                  <HelpCircle className="w-4 h-4 mr-3 text-muted-foreground" />
                  <span className="text-sm font-medium">Privacy Policy</span>
                </Link>
                <motion.div
                  whileHover={{ backgroundColor: "#fef2f2" }}
                  className="flex items-center px-4 py-3 hover:bg-background text-destructive cursor-pointer"
                  onClick={() => {
                    setShowOptions(false);
                    onLogoutClick();
                  }}
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  <span className="text-sm font-medium">Logout</span>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Header;
