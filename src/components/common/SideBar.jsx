// src\components\common\SideBar.jsx
import { useState, useEffect } from "react";
import { LogOut, Music, Users, UserCog } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

const SideBar = ({ onTitleChange, onViewChange, onClose, activeView }) => {
  const [activeButton, setActiveButton] = useState(1);
  const { user, signOut } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    // Set active button based on activeView
    switch (activeView) {
      case "sounds":
        setActiveButton(1);
        break;
      // case "friends":
      //   setActiveButton(2);
      //   break;
      case "manageUsers":
        setActiveButton(2); // Same button for admin
        break;
      default:
        setActiveButton(1);
    }
  }, [activeView]);

  const handleSoundButtonClick = () => {
    onTitleChange("Poop Alert");
    onViewChange("sounds");
    setActiveButton(1);
    if (onClose) onClose();
  };

  const handleSecondButtonClick = () => {
    if (isAdmin) {
      onTitleChange("Manage Users");
      onViewChange("manageUsers");
      setActiveButton(2);
    }
    // else {
    //   onTitleChange("Friends");
    //   onViewChange("friends");
    // }
    if (onClose) onClose();
  };

  // const handleLogout = async () => {
  //   try {
  //     await signOut();
  //   } catch (error) {
  //     toast.error("Logout failed");
  //     console.error("Logout error:", error);
  //   }
  // };

  const clearAllCookies = () => {
    // Get all cookies
    const cookies = document.cookie.split(";");

    // Clear each cookie
    cookies.forEach((cookie) => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

      // Clear cookie for current domain
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
    });

    // Also clear localStorage and sessionStorage
    localStorage.clear();
    sessionStorage.clear();
  };

  const handleLogout = () => {
    // Remove auth tokens using your utility function
    removeAuthTokens();

    // Clear all cookies manually
    clearAllCookies();

    setShowLogoutModal(false);

    // Redirect to home page
    window.location.href = "/";
  };

  return (
    <div className="flex w-full flex-col h-full bg-[#252525]">
      <div className="p-5 border-b border-gray-300 flex justify-between items-center">
        <h1 className="text-xl text-white font-bold">Poop Alert</h1>
      </div>

      <nav className="flex-1 w-full p-4">
        <ul className="space-y-4">
          <motion.li whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <button
              onClick={handleSoundButtonClick}
              className={`px-4 py-2 rounded-md w-full text-left transition-colors duration-200 flex items-center gap-3
                ${
                  activeButton === 1
                    ? "bg-card text-foreground"
                    : "text-white hover:bg-gray-600"
                }`}
            >
              <Music className="w-4 h-4" />
              Sounds
            </button>
          </motion.li>

          {isAdmin && (
            <motion.li whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button
                onClick={handleSecondButtonClick}
                className={`px-4 py-2 rounded-md w-full text-left transition-colors duration-200 flex items-center gap-3
                  ${
                    activeButton === 2
                      ? "bg-card text-foreground"
                      : "text-white hover:bg-gray-600"
                  }`}
              >
                <UserCog className="w-4 h-4" />
                Manage Users
              </button>
            </motion.li>
          )}

          {/* <motion.li whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <button
              onClick={handleSecondButtonClick}
              className={`px-4 py-2 rounded-md w-full text-left transition-colors duration-200 flex items-center gap-3
                ${
                  activeButton === 2
                    ? "bg-card text-foreground"
                    : "text-white hover:bg-gray-600"
                }`}
            >
              {isAdmin ? (
                <>
                  <UserCog className="w-4 h-4" />
                  Manage Users
                </>
                ) : (
                  <>
                    <Users className="w-4 h-4" />
                    Friends
                  </>
              )}
            </button>
          </motion.li> */}
        </ul>
      </nav>

      <div className="p-4 mt-auto border-t border-gray-300">
        <motion.button
          onClick={handleLogout}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 w-full text-left px-4 py-3 hover:bg-gray-600 transition-colors rounded-md text-white"
        >
          <LogOut size={18} />
          <span>Log Out</span>
        </motion.button>
      </div>
    </div>
  );
};

export default SideBar;
