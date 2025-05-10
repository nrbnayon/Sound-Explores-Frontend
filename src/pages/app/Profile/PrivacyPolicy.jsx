import { StatusBar } from "../../../components/common/StatusBar";
import { AnimatePresence, motion } from "framer-motion";
import { PrivacySection } from "../../../components/profile/PrivacySection";
import Header from "../../../components/common/Header";
import { useAuth } from "../../../contexts/AuthContext";
import { useState } from "react";

const PrivacyPolicy = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { user, signOut } = useAuth();
  const privacyItems = [
    {
      id: 1,
      title: "Types of Data We Collect",
      desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    },
    {
      id: 2,
      title: "Use of Your Personal Data",
      desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    },
    {
      id: 3,
      title: "Disclosure of Your Personal Data",
      desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    },
    {
      id: 4,
      title: "Security of Your Personal Data",
      desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    },
  ];

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
          title='Privacy Policy'
          onLogoutClick={toggleLogoutModal}
        />

        {/* Privacy Policy Sections */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className='px-4 py-4 pb-16'
        >
          {privacyItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <PrivacySection item={item} />
            </motion.div>
          ))}
        </motion.div>
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

export default PrivacyPolicy;
