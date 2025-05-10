// src\components\Friends\FindFriends.jsx - Updated
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { X } from "lucide-react";

const FindFriends = ({ friends, setFriends }) => {
  const [pendingFriends, setPendingFriends] = useState([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [friendToRemove, setFriendToRemove] = useState(null);

  // Handle initiating friend removal
  const handleInitiateDelete = (friendId) => {
    // Find the friend to remove and set it in state
    const friend = friends.find((friend) => friend.id === friendId);
    setFriendToRemove(friend);
    setIsConfirmModalOpen(true);
  };

  // Handle confirm friend removal
  const handleConfirmDelete = () => {
    if (!friendToRemove) return;

    // Remove from suggestion list
    const updatedFriends = friends.filter(
      (friend) => friend.id !== friendToRemove.id
    );

    // Here you would make an API call to remove the suggestion

    // Update UI
    setFriends(updatedFriends);

    // Close modal and reset state
    setIsConfirmModalOpen(false);
    setFriendToRemove(null);

    toast.success("Friend removed from suggestions");
  };

  // Handle cancel friend removal
  const handleCancelDelete = () => {
    setIsConfirmModalOpen(false);
    setFriendToRemove(null);
  };

  const handleAddFriend = (friend) => {
    // Add to pending friends list
    setPendingFriends([...pendingFriends, friend.id]);

    // Here you would make an API call to send the friend request

    // Show success message
    toast.success(`Friend request sent to ${friend.name}`);

    // Optional: Remove from suggestion list after a delay
    setTimeout(() => {
      setFriends(friends.filter((f) => f.id !== friend.id));
      setPendingFriends(pendingFriends.filter((id) => id !== friend.id));
    }, 2000);
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
                className="flex items-center bg-card rounded-lg p-3 mb-3 shadow-sm"
              >
                <div className="flex-shrink-0 mr-3">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-100"
                  >
                    <img
                      src={friend.image}
                      alt={friend.name}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                </div>

                <div className="flex-1">
                  <h3 className="text-base font-medium">{friend.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    Suggested for you
                  </p>
                </div>

                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={pendingFriends.includes(friend.id)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                      pendingFriends.includes(friend.id)
                        ? "bg-gray-200 text-muted-foreground"
                        : "bg-primary text-white hover:bg-blue-600"
                    } transition-colors`}
                    onClick={() => handleAddFriend(friend)}
                  >
                    {pendingFriends.includes(friend.id)
                      ? "Pending"
                      : "Add Friend"}
                  </motion.button>

                  <div className="flex items-center text-white">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 py-1.5 bg-destructive rounded-md text-sm font-medium hover:bg-red-600 transition-colors"
                      onClick={() => handleInitiateDelete(friend.id)}
                    >
                      Remove
                    </motion.button>
                  </div>
                </div>
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
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
              </div>
              <p className="text-muted-foreground font-medium">
                No friend suggestions available
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                Check back later for new suggestions
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
            onClick={handleCancelDelete}
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
                  Remove Suggestion
                </h3>
                <button
                  onClick={handleCancelDelete}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600">
                  Are you sure you want to remove{" "}
                  <span className="font-medium">{friendToRemove?.name}</span>{" "}
                  from your suggestions?
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                  onClick={handleCancelDelete}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 rounded-md text-sm font-medium bg-destructive text-white hover:bg-red-600 transition-colors"
                  onClick={handleConfirmDelete}
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

export default FindFriends;
