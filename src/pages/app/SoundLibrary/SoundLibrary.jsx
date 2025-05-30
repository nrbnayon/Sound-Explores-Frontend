// src\pages\app\SoundLibrary\SoundLibrary.jsx
import { useState, useRef, useEffect } from "react";
import { Menu, CircleUserRound } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SideBar from "../../../components/common/SideBar";
import SoundList from "../../../components/Sounds/SoundList";
import Friends from "../Friends/Friends";
import ManageUsers from "../ManageUsers/ManageUsers";
import { useQueryClient } from "@tanstack/react-query";
import { useSelectedSound } from "../../../contexts/SelectedSoundContext";
import { useAuth } from "../../../contexts/AuthContext";
import { ThemeToggle } from "../../../components/common/ThemeToggle";

const SoundLibrary = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("sounds"); // "sounds", "friends", "manageUsers"
  const [title, setTitle] = useState("Popular");
  const [scrolled, setScrolled] = useState(false);
  const queryClient = useQueryClient();
  const sidebarRef = useRef(null);
  const mainContentRef = useRef(null);
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const location = useLocation();
  const { clearSelectedSound } = useSelectedSound();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

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

  const handleViewChange = (view) => {
    setActiveView(view);
    switch (view) {
      case "sounds":
        setTitle("Popular");
        break;
      case "friends":
        setTitle("Friends");
        break;
      case "manageUsers":
        setTitle("Manage Users");
        break;
      default:
        setTitle("Popular");
    }
  };

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

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [sidebarOpen]);

  useEffect(() => {
    if (activeView === "sounds") {
      queryClient.invalidateQueries({ queryKey: ["sounds"] });
    }
  }, [activeView, queryClient]);

  useEffect(() => {
    // This will run when the location changes (e.g., when navigating back from friends)
    const isReturningToSoundLibrary = location.pathname === "/sound-library";

    if (isReturningToSoundLibrary && activeView !== "sounds") {
      // If we're returning to sound library but the view is still on friends/manageUsers
      clearSelectedSound();
      // console.log("Returned to Sound Library: clearing selected sound");
    }
  }, [location, activeView, clearSelectedSound]);

  const renderContent = () => {
    switch (activeView) {
      case "sounds":
        return <SoundList key={`sounds-${Date.now()}`} />;
      case "friends":
        return <Friends />;
      case "manageUsers":
        return <ManageUsers />;
      default:
        return <SoundList key={`sounds-${Date.now()}`} />;
    }
  };

  const contentKey = activeView;

  return (
    <div className="bg-background flex flex-row justify-center w-full h-screen overflow-hidden">
      <div
        className="bg-card w-full max-w-md relative shadow-md"
        ref={mainContentRef}
      >
        {/* <StatusBar /> */}

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
                onViewChange={handleViewChange}
                onClose={toggleSidebar}
                activeView={activeView}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={`grid grid-cols-3 items-center p-4 border-b bg-card sticky top-0 z-10 w-full transition-shadow ${
            scrolled ? "shadow-md" : ""
          }`}
        >
          <div className="flex items-center gap-2 justify-start">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full hover:bg-background transition-colors"
              onClick={toggleSidebar}
            >
              <Menu className="w-5 h-5" />
            </motion.button>
            <ThemeToggle />
          </div>

          <h1 className="text-xl font-bold text-[#8B4513] text-center">
            {title}
          </h1>

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

        <div className="h-[calc(100vh-56px)] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={contentKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full overflow-y-auto p-4"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-opacity-60 z-30"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SoundLibrary;
