import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import Header from "../../../components/common/Header";
import { removeAuthTokens } from "../../../utils/cookie-utils";
import { ImageUp } from "lucide-react";
import apiClient from "../../../lib/api-client";

const EditProfile = () => {
  const { user, updateProfile } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    fullName: user?.profile?.fullName || "",
    nickname: user?.profile?.nickname || "",
    dateOfBirth: user?.profile?.dateOfBirth
      ? new Date(user.profile.dateOfBirth).toISOString().split("T")[0]
      : "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.profile?.address || "",
  });
  const [errors, setErrors] = useState({});

  // Get the API URL from environment variables
  const API_URL = import.meta.env.VITE_ASSETS_URL || "";

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

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form - only email is required
  const validateForm = () => {
    const newErrors = {};

    // Only validate email as required
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        await updateProfile(formData);
      } catch (error) {
        toast.error("Failed to update profile");
      }
    }
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

  // Check if form is dirty (has changes)
  const isDirty = () => {
    return (
      formData.fullName !== (user?.profile?.fullName || "") ||
      formData.email !== (user?.email || "") ||
      formData.nickname !== (user?.profile?.nickname || "") ||
      formData.dateOfBirth !==
        (user?.profile?.dateOfBirth
          ? new Date(user.profile.dateOfBirth).toISOString().split("T")[0]
          : "") ||
      formData.phone !== (user?.phone || "") ||
      formData.address !== (user?.profile?.address || "")
    );
  };

  const toggleLogoutModal = () => {
    setShowLogoutModal(!showLogoutModal);
  };

  // Clear all cookies manually
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
    <div className="bg-background flex flex-row justify-center w-full min-h-screen">
      <div className="bg-card w-full max-w-md relative shadow-lg">
        {/* Header */}
        <Header
          backHref="/profile"
          title="Edit Profile"
          onLogoutClick={toggleLogoutModal}
        />

        {/* Form Container - Centered vertically */}
        <div className="flex flex-col min-h-[calc(100vh-64px)] justify-center p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {/* Profile Image - Centered */}
              <div className="flex justify-center mb-8">
                <div className="relative group">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-white shadow-lg"
                  >
                    {isUploading ? (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
                    className="absolute bottom-0 right-0 bg-primary p-2.5 rounded-full shadow-lg cursor-pointer transition-all hover:bg-blue-600"
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
              </div>

              {/* Full Name */}
              <div className="w-full">
                <label className="block text-base font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Enter your name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name..."
                  className="w-full text-black dark:text-white p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-base font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled
                  placeholder="Enter your email..."
                  className={`w-full text-black dark:text-white p-4 border disabled ${
                    errors.email
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  } rounded-xl bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all`}
                />
                {errors.email && (
                  <span className="text-red-500 text-sm mt-1 block">
                    {errors.email}
                  </span>
                )}
              </div>
            </motion.div>

            {/* Update Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={!isDirty()}
              className="w-full py-4 px-6 bg-primary text-white rounded-xl font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-all duration-200"
            >
              Update Profile
            </motion.button>
          </form>
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
                className="bg-card w-full max-w-md rounded-t-2xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-1 bg-gray-300 rounded-full my-3"></div>
                  <div className="w-full p-6">
                    <h3 className="text-2xl font-bold text-red-600 text-center mb-6">
                      Logout
                    </h3>
                    <div className="border-t border-gray-200 mb-6"></div>
                    <p className="text-lg text-center mb-8 text-gray-600">
                      Are you sure you want to log out?
                    </p>
                    <div className="flex gap-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleLogoutModal}
                        className="flex-1 py-4 px-6 bg-gray-100 hover:bg-gray-200 rounded-xl text-black font-semibold transition-colors"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLogout}
                        className="flex-1 py-4 px-6 bg-red-500 hover:bg-red-600 rounded-xl text-white font-semibold transition-colors"
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

export default EditProfile;
