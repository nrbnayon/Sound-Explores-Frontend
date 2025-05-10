// src\components\Friends\YourFriends.jsx - Updated
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { FriendItem } from "./FriendItem";
import { X } from "lucide-react";

const YourFriends = ({ friends, setFriends }) => {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [friendToRemove, setFriendToRemove] = useState(null);

  // Handle initiating friend removal
  const handleInitiateRemove = (id) => {
    // Find the friend to remove and set it in state
    const friend = friends.find((friend) => friend.id === id);
    setFriendToRemove(friend);
    setIsConfirmModalOpen(true);
  };

  // Handle confirm friend removal
  const handleConfirmRemove = () => {
    if (!friendToRemove) return;

    // Here you would make an API call to remove the friend

    // Update local state
    const updatedFriends = friends.filter(
      (friend) => friend.id !== friendToRemove.id
    );
    setFriends(updatedFriends);

    // Close modal and reset state
    setIsConfirmModalOpen(false);
    setFriendToRemove(null);

    // Show success message
    toast.success("Friend removed successfully");
  };

  // Handle cancel friend removal
  const handleCancelRemove = () => {
    setIsConfirmModalOpen(false);
    setFriendToRemove(null);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="min-h-[200px]">
        <AnimatePresence>
          {friends.length > 0 ? (
            friends.map((friend) => (
              <motion.div
                key={friend.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <FriendItem friend={friend} onRemove={handleInitiateRemove} />
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-64 text-center"
            >
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <p className="text-muted-foreground font-medium">
                You don't have any friends yet
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                Go to Find Friends to connect with others
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {isConfirmModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={handleCancelRemove}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-5 w-80 mx-4 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg text-black font-medium">
                  Remove Friend
                </h3>
                <button
                  onClick={handleCancelRemove}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600">
                  Are you sure you want to remove{" "}
                  <span className="font-medium">{friendToRemove?.name}</span>{" "}
                  from your friends?
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                  onClick={handleCancelRemove}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 rounded-md text-sm font-medium bg-destructive text-white hover:bg-red-600 transition-colors"
                  onClick={handleConfirmRemove}
                >
                  Remove
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default YourFriends;
