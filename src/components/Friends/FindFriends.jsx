import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { useSendFriendRequest } from "../../hooks/useConnections";

const FindFriends = ({
  users,
  friends,
  sentRequests,
  receivedRequests,
  isLoading,
}) => {
  const [pendingFriends, setPendingFriends] = useState([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [userToRemove, setUserToRemove] = useState(null);
  const [hiddenUsers, setHiddenUsers] = useState([]);

  // Extract data from prop
  const allUsers = users?.data || [];

  console.log("sasdf", allUsers);

  // Filter users to show only:
  // 1. Users with role "USER"
  // 2. Not already friends with current user
  // 3. No pending requests (sent or received)
  // 4. Not hidden by user clicking "Remove"
  const filteredUsers = allUsers.filter((user) => {
    // Skip users that aren't role="USER"
    if (user.role !== "USER") return false;

    // Skip users that are hidden after clicking "Remove"
    if (hiddenUsers.includes(user._id)) return false;

    // Skip users that are already friends
    const isFriend = friends.some((friend) => friend._id === user._id);
    if (isFriend) return false;

    // Skip users with pending sent requests
    const hasSentRequest = sentRequests.some(
      (request) => request.receiver?._id === user._id
    );
    if (hasSentRequest) return false;

    // Skip users with pending received requests
    const hasReceivedRequest = receivedRequests.some(
      (request) => request.sender?._id === user._id
    );
    if (hasReceivedRequest) return false;

    return true;
  });

  // Use the hook for sending friend requests
  const { mutate: sendFriendRequest, isLoading: isSending } =
    useSendFriendRequest();

  // Handle initiating suggestion removal
  const handleInitiateDelete = (userId) => {
    // Find the user to remove and set it in state
    const user = allUsers.find((user) => user._id === userId);
    setUserToRemove(user);
    setIsConfirmModalOpen(true);
  };

  // Handle confirm suggestion removal
  const handleConfirmDelete = () => {
    if (!userToRemove) return;

    // Update the hidden users list to remove from UI
    setHiddenUsers((prev) => [...prev, userToRemove._id]);

    // Show success message
    toast.success("User removed from suggestions");

    // Close modal and reset state
    setIsConfirmModalOpen(false);
    setUserToRemove(null);
  };

  // Handle cancel suggestion removal
  const handleCancelDelete = () => {
    setIsConfirmModalOpen(false);
    setUserToRemove(null);
  };

  // Handle sending friend request
  const handleAddFriend = (user) => {
    // Add to pending friends list to disable the button
    setPendingFriends((prev) => [...prev, user._id]);

    // Send friend request using the hook
    sendFriendRequest(user._id, {
      onSuccess: () => {
        // Show success message
        toast.success(
          `Friend request sent to ${user.profile?.fullName || user.email}`
        );
      },
      onError: (error) => {
        // Remove from pending on error
        setPendingFriends((prev) => prev.filter((id) => id !== user._id));
        toast.error(
          error.response?.data?.message || "Failed to send friend request"
        );
      },
    });
  };

  return (
    <div className="flex flex-col w-full">
      <div className="min-h-[200px]">
        <AnimatePresence>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="loader"></div>
            </div>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="flex items-center bg-card rounded-lg p-1 mb-3 shadow-sm"
              >
                <div className="flex-shrink-0 mr-3">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-100"
                  >
                    <img
                      src={user.avatar || "/api/placeholder/48/48"}
                      alt={user.profile?.fullName || user.email}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                </div>

                <div className="flex-1">
                  <h3 className="text-base font-medium">
                    {user.profile?.fullName || user.email.split("@")[0]}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {user.email.length > 20
                      ? `${user.email.slice(0, 20)}...`
                      : user.email}
                  </p>
                </div>

                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={pendingFriends.includes(user._id) || isSending}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                      pendingFriends.includes(user._id)
                        ? "bg-gray-200 text-muted-foreground"
                        : "bg-primary text-white hover:bg-blue-600"
                    } transition-colors`}
                    onClick={() => handleAddFriend(user)}
                  >
                    {pendingFriends.includes(user._id)
                      ? "Pending"
                      : "Add Friend"}
                  </motion.button>

                  <div className="flex items-center text-white">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 py-1.5 bg-destructive rounded-md text-sm font-medium hover:bg-red-600 transition-colors"
                      onClick={() => handleInitiateDelete(user._id)}
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
                  <span className="font-medium">
                    {userToRemove?.profile?.fullName ||
                      userToRemove?.email ||
                      "this user"}
                  </span>{" "}
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
