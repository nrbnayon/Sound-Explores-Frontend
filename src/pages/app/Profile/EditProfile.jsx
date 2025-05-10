import { useState } from "react";
import { ChevronLeft, MoreVertical } from "lucide-react";
import { Link } from "react-router-dom";
import { StatusBar } from "../../../components/common/StatusBar";
import { useAuth } from "../../../contexts/AuthContext";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import Header from "../../../components/common/Header";

const EditProfile = () => {
  const { user, updateProfile, signOut } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    nickname: "",
    dateOfBirth: "",
    email: user?.email || "",
    phone: "",
    address: "",
  });
  const [errors, setErrors] = useState({});

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

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
        toast.success("Profile updated successfully");
      } catch (error) {
        toast.error("Failed to update profile");
      }
    }
  };

  // Check if form is dirty (has changes)
  const isDirty = () => {
    return (
      formData.fullName !== (user?.name || "") ||
      formData.email !== (user?.email || "") ||
      formData.nickname !== "" ||
      formData.dateOfBirth !== "" ||
      formData.phone !== "" ||
      formData.address !== ""
    );
  };

    const toggleLogoutModal = () => {
      setShowLogoutModal(!showLogoutModal);
    };

    const handleLogout = () => {
      signOut();
      setShowLogoutModal(false);
    };

  return (
    <div className='bg-background flex flex-row justify-center w-full min-h-screen'>
      <div className='bg-card w-full max-w-md relative shadow-md'>
        <StatusBar />

        {/* Header */}
        <Header
          backHref='/profile'
          title='Edit Profile'
          onLogoutClick={toggleLogoutModal}
        />

        {/* Form */}
        <form onSubmit={handleSubmit} className='p-4'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className='space-y-4'
          >
            {/* Full Name */}
            <div>
              <label className='block text-base  font-medium mb-1'>
                Full Name
              </label>
              <input
                type='text'
                name='fullName'
                value={formData.fullName}
                onChange={handleChange}
                placeholder='Enter your Full Name...'
                className={`w-full text-black  p-3 border ${
                  errors.fullName ? "border-red-500" : "border-gray-200"
                } rounded-lg`}
              />
              {errors.fullName && (
                <span className='text-destructive text-sm mt-1 block'>
                  {errors.fullName}
                </span>
              )}
            </div>

            {/* Nickname */}
            <div>
              <label className='block text-base font-medium mb-1'>
                Nickname
              </label>
              <input
                type='text'
                name='nickname'
                value={formData.nickname}
                onChange={handleChange}
                placeholder='Enter your Nickname...'
                className='w-full text-black p-3 border border-gray-200 rounded-lg'
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className='block text-base font-medium mb-1'>
                Date of Birth
              </label>
              <input
                type='date'
                name='dateOfBirth'
                value={formData.dateOfBirth}
                onChange={handleChange}
                className='w-full text-black p-3 border border-gray-200 rounded-lg'
              />
            </div>

            {/* Email */}
            <div>
              <label className='block text-base font-medium mb-1'>Email</label>
              <input
                type='email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                placeholder='Enter your Email...'
                className={`w-full text-black p-3 border ${
                  errors.email ? "border-red-500" : "border-gray-200"
                } rounded-lg`}
              />
              {errors.email && (
                <span className='text-destructive text-sm mt-1 block'>
                  {errors.email}
                </span>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className='block text-base font-medium mb-1'>Phone</label>
              <input
                type='tel'
                name='phone'
                value={formData.phone}
                onChange={handleChange}
                placeholder='Enter your Phone...'
                className='w-full text-black p-3 border border-gray-200 rounded-lg'
              />
            </div>

            {/* Address */}
            <div>
              <label className='block text-base font-medium mb-1'>
                Address
              </label>
              <textarea
                name='address'
                value={formData.address}
                onChange={handleChange}
                placeholder='Address'
                className='w-full text-black p-3 border border-gray-200 rounded-lg h-20'
              />
            </div>
          </motion.div>

          {/* Update Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type='submit'
            disabled={!isDirty()}
            className='w-full mt-6 py-3 px-4 bg-primary text-white rounded-full font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors'
          >
            Update
          </motion.button>
        </form>
        {/* Logout Modal */}
        <AnimatePresence>
          {showLogoutModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50'
              onClick={toggleLogoutModal}
            >
              <motion.div
                initial={{ y: 300 }}
                animate={{ y: 0 }}
                exit={{ y: 300 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className='bg-card w-full max-w-md rounded-t-2xl'
                onClick={(e) => e.stopPropagation()}
              >
                <div className='flex flex-col items-center'>
                  <div className='w-12 h-1 bg-gray-300 rounded-full my-3'></div>
                  <div className='w-full p-6'>
                    <h3 className='text-2xl font-bold text-destructive text-center mb-6'>
                      Logout
                    </h3>
                    <div className='border-t border-gray-200 mb-6'></div>
                    <p className='text-xl text-center mb-8'>
                      Are you sure you want to log out?
                    </p>
                    <div className='flex gap-4'>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleLogoutModal}
                        className='flex-1 py-4 px-6 bg-gray-100 rounded-full text-black font-medium'
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLogout}
                        className='flex-1 py-4 px-6 bg-red-500 rounded-full text-white font-medium'
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
