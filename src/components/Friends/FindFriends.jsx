// src\components\Friends\FindFriends.jsx
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { UserSearch, X } from "lucide-react";
import { useSendFriendRequest } from "../../hooks/useConnections";
import { useAuth } from "./../../contexts/AuthContext";

const FindFriends = ({
  users,
  friends,
  sentRequests,
  receivedRequests,
  isLoading,
  allRequest,
}) => {
  const [pendingFriends, setPendingFriends] = useState([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [userToRemove, setUserToRemove] = useState(null);
  const [hiddenUsers, setHiddenUsers] = useState([]);
  const { user } = useAuth();
  const API_URL = import.meta.env.VITE_ASSETS_URL || "";
  const allUsers = users?.data || [];
  const [sentRequestReceiverIds, setSentRequestReceiverIds] = useState([]);

  const sentRequestIds = useMemo(
    () =>
      sentRequests
        .map((req) => {
          const other = req.users?.find((u) => u.user !== user._id);
          return other?.user;
        })
        .filter(Boolean),
    [sentRequests, user._id]
  );
  const receivedRequestIds = useMemo(
    () =>
      receivedRequests
        .map((req) => {
          return (
            req.senderId || req.users?.find((u) => u.user !== user._id)?.user
          );
        })
        .filter(Boolean),
    [receivedRequests, user._id]
  );
  const friendIds = useMemo(() => {
    return friends.flatMap((friend) => {
      return friend.users
        ? friend.users.map((u) => u.user).filter((id) => id !== user._id) // Filter out current user
        : [];
    });
  }, [friends, user._id]);
  const excludedIds = useMemo(() => {
    const s = new Set();
    s.add(user._id);
    friendIds.forEach((id) => s.add(id));
    sentRequestIds.forEach((id) => s.add(id));
    receivedRequestIds.forEach((id) => s.add(id));
    pendingFriends.forEach((id) => s.add(id));
    hiddenUsers.forEach((id) => s.add(id));
    return s;
  }, [
    user._id,
    friendIds,
    sentRequestIds,
    receivedRequestIds,
    pendingFriends,
    hiddenUsers,
  ]);
  const filteredUsers = useMemo(
    () => allUsers.filter((u) => u.role === "USER" && !excludedIds.has(u._id)),
    [allUsers, excludedIds]
  );
  const { mutate: sendFriendRequest, isLoading: isSending } =
    useSendFriendRequest();
  const handleInitiateDelete = (userId) => {
    const user = allUsers.find((user) => user._id === userId);
    setUserToRemove(user);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!userToRemove) return;
    setHiddenUsers((prev) => [...prev, userToRemove._id]);
    toast.success("User removed from suggestions");
    setIsConfirmModalOpen(false);
    setUserToRemove(null);
  };
  const handleCancelDelete = () => {
    setIsConfirmModalOpen(false);
    setUserToRemove(null);
  };

  const handleAddFriend = (user) => {
    setPendingFriends((prev) => [...prev, user._id]);
    sendFriendRequest(user._id, {
      onSuccess: () => {
        toast.success(
          `Friend request sent to ${user.profile?.fullName || user.email}`
        );
        setSentRequestReceiverIds((prev) => [...prev, user._id]);
      },
      onError: (error) => {
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
                      src={
                        `${API_URL}${user?.profile?.image}` || "/profile.png"
                      }
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
                    {user.email.length > 25
                      ? `${user.email.slice(0, 25)}...`
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
              <div className="bg-gray-100 p-4 rounded-full mb-4 text-black">
                <UserSearch />
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
