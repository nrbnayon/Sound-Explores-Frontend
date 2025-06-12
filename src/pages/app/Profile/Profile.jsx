import { useState, useRef, useEffect } from "react";
import { User, Crown, Lock, LogOut, ChevronRight, ImageUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../../../components/common/Header";
import { Helmet } from "react-helmet-async";
import apiClient from "../../../lib/api-client";
import LoadingScreen from "./../../../components/ui/LoadingScreen";

const Profile = () => {
  const { user, signOut } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [profileName, setProfileName] = useState("");
  const fileInputRef = useRef(null);

  // Get the API URL from environment variables
  const API_URL = import.meta.env.VITE_ASSETS_URL || "";

  if (!user) {
    return <LoadingScreen />;
  }
  useEffect(() => {
    if (user?.name) {
      setProfileName(user.name);
    } else if (user?.profile?.fullName) {
      setProfileName(user.profile.fullName);
    }
  }, [user, user?.name, user?.profile?.fullName]);

  useEffect(() => {
    if (user?.profile?.image) {
      if (user.profile.image.startsWith("http")) {
        setAvatar(user.profile.image);
      } else {
        setAvatar(`${API_URL}${user.profile.image}`);
      }
    } else {
      setAvatar("/profile.png");
    }
  }, [user?.profile?.image, API_URL]);

  // Toggle logout modal
  const toggleLogoutModal = () => {
    setShowLogoutModal(!showLogoutModal);
  };

  // console.log("User data::", user);

  // Handle logout confirmation
  const handleLogout = () => {
    signOut();
    setShowLogoutModal(false);
  };

  // Handle avatar upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setIsUploading(true);

        // Display preview immediately
        const reader = new FileReader();
        reader.onload = () => {
          setAvatar(reader.result);
        };
        reader.readAsDataURL(file);

        // Prepare form data for API
        const formData = new FormData();
        formData.append("file", file);

        // Send to API
        const response = await apiClient.patch(
          "/user/update-profile-image",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        // Update with server response if available
        if (response.data && response.data.data && response.data.data.image) {
          // Make sure we have the full URL
          const imagePath = response.data.data.image;
          const fullImageUrl = imagePath.startsWith("https")
            ? imagePath
            : `${API_URL}${imagePath}`;

          setAvatar(fullImageUrl);
        }
      } catch (error) {
        console.error("Error uploading avatar:", error);
        // Revert to previous avatar on error
        if (user?.profile?.image) {
          setAvatar(
            user.profile.image.startsWith("https")
              ? user.profile.image
              : `${API_URL}${user.profile.image}`
          );
        } else {
          setAvatar("/profile.png");
        }
      } finally {
        setIsUploading(false);
      }
    }
  };
  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="bg-background flex flex-row justify-center w-full min-h-screen">
      <div className="bg-card w-full max-w-md relative shadow-md">
        <Helmet>
          <title>Poop Alert Sound Explores Library Application</title>
          <meta
            name="description"
            content={`View Poop Alert Sound Explores Library Application profile`}
          />
          <meta name="robots" content="noindex, nofollow" />
          <meta
            property="og:title"
            content={`View Poop Alert Sound Explores Library Application profile`}
          />
          <meta
            property="og:description"
            content={`View Poop Alert Sound Explores Library Application profile`}
          />
          <meta
            property="og:image"
            content={"https://i.postimg.cc/HkHXj7zF/logo.png"}
          />
          <meta
            property="og:url"
            content={`https://poopalert.fun/profile/${user?.id || ""}`}
          />
          <meta property="og:type" content="profile" />
        </Helmet>
        {/* <StatusBar /> */}

        {/* Header */}
        <Header
          backHref="/sound-library"
          title="Profile"
          onLogoutClick={toggleLogoutModal}
        />

        {/* Profile Info */}
        <div className="bg-background pr-0.5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center p-6 border-b bg-gradient-to-b from-blue-50 to-white"
          >
            <div className="relative mb-5 group text-foreground">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-white shadow-md"
              >
                {isUploading ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <img
                    src={avatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                )}
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute bottom-0 right-0 bg-primary p-2 rounded-full shadow-md cursor-pointer transition-all hover:bg-blue-600"
                onClick={triggerFileInput}
              >
                <ImageUp className="w-4 h-4 text-white" />
              </motion.div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </div>

            <h2 className="text-2xl text-black font-bold mb-1">
              {profileName ||
                user?.email?.split("@")[0].slice(0, 10) ||
                "User Name"}
            </h2>
            <p className="text-xs text-muted-foreground mb-2">
              {user?.email || "user@example.com"}
            </p>
            <div className="mb-4 flex items-center bg-blue-50 px-3 py-1 rounded-full">
              <Crown className="w-4 h-4 text-blue-500 mr-1" />
              <span className="text-xs font-medium text-blue-700">
                {user?.subscription?.plan
                  ? user.subscription.plan.charAt(0).toUpperCase() +
                    user.subscription.plan.slice(1)
                  : "Free"}{" "}
                Member
              </span>
            </div>

            <div className="flex gap-4 w-full justify-center mt-2">
              <Link
                to="/edit-profile"
                className="px-5 py-2 bg-primary text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                Edit Profile
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Menu Items */}
        <div className="px-4 py-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
            Account Settings
          </h3>

          {/* Edit Profile */}
          <Link
            to="/edit-profile"
            className="flex items-center justify-between py-3 px-2 mb-1 rounded-lg hover:bg-background transition-colors"
          >
            <div className="flex items-center">
              <div className="p-2 mr-4 bg-blue-100 rounded-full">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <span className="text-base font-medium">
                  Personal Information
                </span>
                <p className="text-xs text-muted-foreground">
                  Update your profile details
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </Link>

          {/* Upgrade Plan */}
          <Link
            to="/payment"
            className="flex items-center justify-between py-3 px-2 mb-1 rounded-lg hover:bg-background transition-colors"
          >
            <div className="flex items-center">
              <div className="p-2 mr-4 bg-yellow-100 rounded-full">
                <Crown className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <span className="text-base font-medium">Subscription</span>
                <p className="text-xs text-muted-foreground">
                  Manage your plan
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-xs font-medium text-green-600 mr-2">
                Upgrade
              </span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Link>

          {/* Privacy Policy */}
          <Link
            to="/privacy-policy"
            className="flex items-center justify-between py-3 px-2 mb-1 rounded-lg hover:bg-background transition-colors"
          >
            <div className="flex items-center">
              <div className="p-2 mr-4 bg-purple-100 rounded-full">
                <Lock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <span className="text-base font-medium">
                  Privacy & Security
                </span>
                <p className="text-xs text-muted-foreground">
                  Manage your data and privacy
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </Link>

          <div className="border-t border-gray-100 my-4"></div>

          {/* Logout */}
          <motion.div
            whileHover={{ backgroundColor: "#fef2f2" }}
            className="flex items-center py-3 px-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
            onClick={toggleLogoutModal}
          >
            <div className="p-2 mr-4 bg-red-100 rounded-full">
              <LogOut className="w-5 h-5 text-destructive" />
            </div>
            <span className="text-base font-medium text-destructive">
              Logout
            </span>
          </motion.div>
        </div>

        {/* Logout Modal */}
        <AnimatePresence>
          {showLogoutModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50"
              onClick={toggleLogoutModal}
            >
              <motion.div
                initial={{ y: 300 }}
                animate={{ y: 0 }}
                exit={{ y: 300 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-card w-full max-w-md rounded-t-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-1 bg-gray-300 rounded-full my-3"></div>
                  <div className="w-full p-6">
                    <h3 className="text-2xl font-bold text-destructive text-center mb-6">
                      Logout
                    </h3>
                    <div className="border-t border-gray-200 mb-6"></div>
                    <p className="text-xl text-center mb-8">
                      Are you sure you want to log out?
                    </p>
                    <div className="flex gap-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleLogoutModal}
                        className="flex-1 py-4 px-6 bg-gray-100 rounded-full text-black font-medium"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLogout}
                        className="flex-1 py-4 px-6 bg-red-500 rounded-full text-white font-medium"
                      >
                        Yes, Logout
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Profile;
