// src\components\Friends\YourFriends.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { X, UserMinus, Mail, UsersRound } from "lucide-react";
import { useCancelFriendRequest } from "../../hooks/useConnections";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";

const useSwipe = (onSwipeLeft, onSwipeRight) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && onSwipeLeft) onSwipeLeft();
    if (isRightSwipe && onSwipeRight) onSwipeRight();
  };
  const [mouseStart, setMouseStart] = useState(null);
  const [mouseDown, setMouseDown] = useState(false);

  const onMouseDown = (e) => {
    setMouseDown(true);
    setMouseStart(e.clientX);
  };

  const onMouseMove = (e) => {
    if (!mouseDown) return;
    setTouchEnd(e.clientX);
  };

  const onMouseUp = () => {
    if (!mouseDown || !mouseStart || !touchEnd) {
      setMouseDown(false);
      return;
    }

    const distance = mouseStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && onSwipeLeft) onSwipeLeft();
    if (isRightSwipe && onSwipeRight) onSwipeRight();

    setMouseDown(false);
  };
  useEffect(() => {
    if (mouseDown) {
      document.addEventListener("mouseup", onMouseUp);
      document.addEventListener("mousemove", onMouseMove);
    }

    return () => {
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, [mouseDown, mouseStart, touchEnd]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onMouseDown,
  };
};

const YourFriends = ({ friends, isLoading }) => {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [friendToRemove, setFriendToRemove] = useState(null);
  const { user } = useAuth();
  const API_URL = import.meta.env.VITE_ASSETS_URL || "";
  const { mutate: removeFriend, isLoading: isRemoving } =
    useCancelFriendRequest();

  // Get friend info helper function
  const getFriendInfo = (connection) => {
    if (!connection?.users || connection.users.length < 2) {
      return {
        id: connection?._id,
        fullName: "Unknown User",
        email: "unknown@example.com",
        image: "/profile.png",
        nickname: "",
      };
    }

    const currentUserId = user?._id;
    const friendUser = connection.users.find((u) => u.user !== currentUserId);

    if (!friendUser) {
      return {
        id: connection?._id,
        fullName: "Unknown User",
        email: "unknown@example.com",
        image: "/profile.png",
        nickname: "",
      };
    }

    return {
      id: connection._id,
      fullName: friendUser.fullName || "Unknown User",
      email: friendUser.email || "unknown@example.com",
      image: friendUser.image || "/profile.png",
      nickname: friendUser.nickname || "",
    };
  };

  // Friend removal functions
  const handleInitiateRemove = (id) => {
    const friendConnection = friends.find((friend) => friend._id === id);
    setFriendToRemove(friendConnection);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmRemove = () => {
    if (!friendToRemove) return;
    removeFriend(friendToRemove._id, {
      onSuccess: () => {
        toast.success("Friend removed successfully");
        setIsConfirmModalOpen(false);
        setFriendToRemove(null);
      },
      onError: (error) => {
        toast.error(
          error?.response?.data?.message || "Failed to remove friend"
        );
        setIsConfirmModalOpen(false);
        setFriendToRemove(null);
      },
    });
  };

  const handleCancelRemove = () => {
    setIsConfirmModalOpen(false);
    setFriendToRemove(null);
  };

  // Swipeable friend item component
  const SwipeableFriendItem = ({ connection, onRemove }) => {
    const [isOpen, setIsOpen] = useState(false);
    const friendInfo = getFriendInfo(connection);

    const swipeHandlers = useSwipe(
      () => setIsOpen(true),
      () => setIsOpen(false)
    );

    return (
      <div className='relative overflow-hidden rounded-lg mb-3 shadow-sm'>
        <div
          {...swipeHandlers}
          className='flex justify-between items-center bg-card rounded-lg p-3 touch-pan-y'
          style={{
            transform: isOpen ? "translateX(-80px)" : "translateX(0)",
            transition: "transform 0.3s ease-out",
          }}
        >
          <div className='flex items-center'>
            <div className='flex-shrink-0 mr-3'>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className='w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-100'
              >
                <img
                  src={
                    friendInfo.image
                      ? `${API_URL}${friendInfo.image}`
                      : "/profile.png"
                  }
                  alt={friendInfo.fullName || friendInfo.email}
                  className='w-full h-full object-cover'
                />
              </motion.div>
            </div>

            <div>
              <h3 className='text-base font-medium'>
                {friendInfo.fullName}
                {friendInfo.nickname && (
                  <span className='text-sm text-muted-foreground ml-1'>
                    ({friendInfo.nickname})
                  </span>
                )}
              </h3>
              <p className='text-xs text-muted-foreground'>
                {friendInfo.email.length > 25
                  ? `${friendInfo.email.slice(0, 25)}...`
                  : friendInfo.email}
              </p>
            </div>
          </div>

          <Link
            to='/chat-interface'
            className='px-3 py-1.5 rounded-md text-sm font-medium bg-primary text-white hover:bg-blue-600 transition-colors flex items-center gap-1'
          >
            <Mail size={16} /> Message
          </Link>
        </div>

        <div
          className='absolute top-0 right-0 h-full flex items-center'
          style={{
            transform: isOpen ? "translateX(0)" : "translateX(80px)",
            transition: "transform 0.3s ease-out",
          }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onRemove(connection._id)}
            className='h-full px-4 bg-destructive text-white flex items-center justify-center'
          >
            <UserMinus size={20} />
          </motion.button>
        </div>
      </div>
    );
  };

  return (
    <div className='flex flex-col w-full'>
      <div className='min-h-[200px]'>
        <AnimatePresence>
          {isLoading ? (
            <div className='flex items-center justify-center h-64'>
              <div className='loader'></div>
            </div>
          ) : friends && friends.length > 0 ? (
            <motion.div
              key='friends-list'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {friends.map((friend) => (
                <motion.div
                  key={friend._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <SwipeableFriendItem
                    connection={friend}
                    onRemove={handleInitiateRemove}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='flex flex-col items-center justify-center h-64 text-center'
            >
              <div className='bg-gray-100 p-4 rounded-full mb-4'>
                <UsersRound size={24} />
              </div>
              <p className='text-muted-foreground font-medium'>
                You don't have any friends yet
              </p>
              <p className='text-muted-foreground text-sm mt-1'>
                Go to Find Friends to connect with others
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {isConfirmModalOpen && friendToRemove && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
            onClick={handleCancelRemove}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className='bg-white rounded-lg p-5 w-80 mx-4 shadow-lg'
              onClick={(e) => e.stopPropagation()}
            >
              <div className='flex justify-between items-center mb-4'>
                <h3 className='text-lg text-black font-medium'>
                  Remove Friend
                </h3>
                <button
                  onClick={handleCancelRemove}
                  className='text-gray-500 hover:text-gray-700'
                >
                  <X size={20} />
                </button>
              </div>

              <div className='mb-6'>
                <p className='text-gray-600'>
                  Are you sure you want to remove{" "}
                  <span className='font-medium'>
                    {getFriendInfo(friendToRemove).fullName}
                  </span>{" "}
                  from your friends?
                </p>
              </div>

              <div className='flex justify-end gap-3'>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className='px-4 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors'
                  onClick={handleCancelRemove}
                  disabled={isRemoving}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className='px-4 py-2 rounded-md text-sm font-medium bg-destructive text-white hover:bg-red-600 transition-colors'
                  onClick={handleConfirmRemove}
                  disabled={isRemoving}
                >
                  {isRemoving ? "Removing..." : "Remove"}
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
