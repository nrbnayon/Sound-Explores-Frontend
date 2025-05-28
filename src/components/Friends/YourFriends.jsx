// src\components\Friends\YourFriends.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  X,
  UserMinus,
  Mail,
  UsersRound,
  CheckCircle,
  Loader2,
  ChevronLeft,
} from "lucide-react";
import { useCancelFriendRequest } from "../../hooks/useConnections";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useSelectedSound } from "../../contexts/SelectedSoundContext";
import { useSendSoundMessage } from "../../hooks/useMessages";

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

// Avatar component with fallback to initials
export const UserAvatar = ({ src, name, size = 40 }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Generate initials from name
  const getInitials = (fullName) => {
    if (!fullName || fullName.trim() === "") return "U";

    const words = fullName
      .trim()
      .split(" ")
      .filter((word) => word.length > 0);
    if (words.length === 0) return "U";

    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }

    return (
      words[0].charAt(0) + words[words.length - 1].charAt(0)
    ).toUpperCase();
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setImageError(true);
  };

  const initials = getInitials(name);

  return (
    <div
      className="relative flex items-center justify-center rounded-full overflow-hidden ring-2 ring-gray-100 bg-gray-200 hover:scale-105 transition-transform duration-200"
      style={{ width: size, height: size }}
    >
      {!imageError && src && src !== "/profile.png" ? (
        <>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
              <span
                className="text-gray-600 font-medium"
                style={{ fontSize: size * 0.4 }}
              >
                {initials}
              </span>
            </div>
          )}
          <img
            src={src}
            alt={name || "User"}
            className={`w-full h-full rounded-full object-cover transition-opacity  duration-200 ${
              isLoading ? "opacity-0" : "opacity-100"
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </>
      ) : (
        <span
          className="text-gray-600 font-medium select-none"
          style={{ fontSize: size * 0.4 }}
        >
          {initials}
        </span>
      )}
    </div>
  );
};

const YourFriends = ({ friends, isLoading }) => {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [friendToRemove, setFriendToRemove] = useState(null);
  // Track which friends have been sent the current sound
  const [sentToFriends, setSentToFriends] = useState({});
  // Track which friends are currently being sent a sound
  const [sendingToFriends, setSendingToFriends] = useState({});
  // Track if the swipe tutorial has been shown
  const [showSwipeTutorial, setShowSwipeTutorial] = useState(false);
  // Track tutorial animation state
  const [tutorialStep, setTutorialStep] = useState(0);
  // Track if user has swiped before
  const [hasSwipedBefore, setHasSwipedBefore] = useState(false);

  const { user } = useAuth();
  const API_URL = import.meta.env.VITE_ASSETS_URL || "";
  const { mutate: removeFriend, isLoading: isRemoving } =
    useCancelFriendRequest();

  const { selectedSound, clearSelectedSound } = useSelectedSound();
  const navigate = useNavigate();
  const sendSoundMessage = useSendSoundMessage();

  // Check if user has swiped before and setup tutorial
  useEffect(() => {
    const hasUserSwipedBefore =
      localStorage.getItem("hasSwipedFriend") === "true";
    setHasSwipedBefore(hasUserSwipedBefore);

    // Show tutorial if user has not swiped before and there are friends
    if (!hasUserSwipedBefore && friends && friends.length > 0) {
      setTimeout(() => {
        setShowSwipeTutorial(true);

        // Auto advance tutorial steps
        const timeout1 = setTimeout(() => setTutorialStep(1), 2000);
        const timeout2 = setTimeout(() => setTutorialStep(2), 4000);
        const timeout3 = setTimeout(() => {
          setTutorialStep(0);
          setShowSwipeTutorial(false);
        }, 6000);

        return () => {
          clearTimeout(timeout1);
          clearTimeout(timeout2);
          clearTimeout(timeout3);
        };
      }, 1000); // Delay to show tutorial after page loads
    }
  }, [friends]);

  // Reset sent status when selected sound changes
  useEffect(() => {
    if (selectedSound) {
      setSentToFriends({});
      setSendingToFriends({});
    }
  }, [selectedSound]);

  // Get friend info helper function with improved image URL handling
  const getFriendInfo = (connection) => {
    if (!connection?.users || connection.users.length < 2) {
      return {
        id: connection?._id,
        userId: null,
        fullName: "Unknown User",
        email: "unknown@example.com",
        image: null,
        nickname: "",
      };
    }

    const currentUserId = user?._id;
    const friendUser = connection.users.find((u) => u.user !== currentUserId);

    if (!friendUser) {
      return {
        id: connection?._id,
        userId: null,
        fullName: "Unknown User",
        email: "unknown@example.com",
        image: null,
        nickname: "",
      };
    }

    // Improved image URL construction
    let imageUrl = null;
    if (
      friendUser.image &&
      friendUser.image.trim() !== "" &&
      friendUser.image !== "/profile.png"
    ) {
      // If image starts with http/https, use as is (for external URLs)
      if (friendUser.image.startsWith("http")) {
        imageUrl = friendUser.image;
      } else {
        // For local images, construct the full URL
        const cleanImage = friendUser.image.startsWith("/")
          ? friendUser.image
          : `/${friendUser.image}`;
        imageUrl = `${API_URL}${cleanImage}`;
      }
    }

    return {
      id: connection._id,
      userId: friendUser.user,
      fullName: friendUser.fullName || "Unknown User",
      email: friendUser.email || "unknown@example.com",
      image: imageUrl,
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

  const handleSendSound = (friendId) => {
    if (selectedSound) {
      // Set sending state for this friend
      setSendingToFriends((prev) => ({
        ...prev,
        [friendId]: true,
      }));

      sendSoundMessage.mutate(
        {
          users: friendId,
          link: selectedSound.link,
          soundTitle: selectedSound.soundTitle,
        },
        {
          onSuccess: () => {
            toast.success(
              `Sound "${selectedSound.soundTitle}" sent successfully!`
            );
            // Mark this friend as having received the sound
            setSentToFriends((prev) => ({
              ...prev,
              [friendId]: true,
            }));
            // Clear sending state
            setSendingToFriends((prev) => ({
              ...prev,
              [friendId]: false,
            }));
          },
          onError: (error) => {
            toast.error(
              "Failed to send sound: " + (error?.message || "Unknown error")
            );
            // Clear sending state on error
            setSendingToFriends((prev) => ({
              ...prev,
              [friendId]: false,
            }));
          },
        }
      );
    } else {
      toast.error("No sound selected. Please select a sound first!");
      clearSelectedSound();
      navigate("/sound-library"); // Navigate to sound library to select a sound
    }
  };

  // Handle when user swipes
  const handleSwipe = () => {
    // Record that user has swiped
    if (!hasSwipedBefore) {
      localStorage.setItem("hasSwipedFriend", "true");
      setHasSwipedBefore(true);
    }
    // Hide tutorial
    setShowSwipeTutorial(false);
  };

  // Dismiss swipe tutorial
  const dismissSwipeTutorial = () => {
    setShowSwipeTutorial(false);
    localStorage.setItem("hasSwipedFriend", "true");
    setHasSwipedBefore(true);
  };

  // Swipeable friend item component
  const SwipeableFriendItem = ({ connection, onRemove, index }) => {
    const [isOpen, setIsOpen] = useState(false);
    const friendInfo = getFriendInfo(connection);
    const hasSentSound = sentToFriends[friendInfo.userId];
    const isSending = sendingToFriends[friendInfo.userId];
    const isFirstItem = index === 0;
    const shouldHighlight = isFirstItem && showSwipeTutorial;

    const swipeHandlers = useSwipe(
      () => {
        setIsOpen(true);
        handleSwipe();
      },
      () => {
        setIsOpen(false);
        handleSwipe();
      }
    );

    return (
      <div className="relative overflow-hidden rounded-lg mb-3 shadow-sm">
        {shouldHighlight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="absolute inset-0 z-10 rounded-lg"
            style={{
              background:
                "linear-gradient(90deg, rgba(59,130,246,0) 0%, rgba(59,130,246,0.2) 50%, rgba(59,130,246,0) 100%)",
              pointerEvents: "none",
            }}
          />
        )}
        <div
          {...swipeHandlers}
          className={`flex justify-between items-center bg-card rounded-lg p-3 touch-pan-y ${
            shouldHighlight ? "ring-2 ring-blue-400" : ""
          }`}
          style={{
            transform: isOpen ? "translateX(-80px)" : "translateX(0)",
            transition: "transform 0.3s ease-out",
          }}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 mr-3">
              <motion.div whileHover={{ scale: 1.05 }}>
                <UserAvatar
                  src={friendInfo.image}
                  name={friendInfo.fullName}
                  size={40}
                />
              </motion.div>
            </div>

            <div>
              <h3 className="text-base font-medium">
                {friendInfo.fullName}
                {friendInfo.nickname && (
                  <span className="text-sm text-muted-foreground ml-1">
                    ({friendInfo.nickname})
                  </span>
                )}
              </h3>
              <p className="text-xs text-muted-foreground">
                {friendInfo.email.length > 25
                  ? `${friendInfo.email.slice(0, 25)}...`
                  : friendInfo.email}
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              !hasSentSound && !isSending && handleSendSound(friendInfo.userId)
            }
            disabled={hasSentSound || isSending}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
              hasSentSound
                ? "bg-green-100 text-green-700 cursor-default"
                : isSending
                ? "bg-blue-500 text-white cursor-not-allowed opacity-80"
                : "bg-primary text-white hover:bg-blue-600"
            }`}
          >
            {hasSentSound ? (
              <>
                <CheckCircle size={16} />
                <span>Sent</span>
              </>
            ) : isSending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Mail size={16} />
                <span>{selectedSound ? "Send Sound" : "Message"}</span>
              </>
            )}
          </button>
        </div>

        <div
          className="absolute top-0 right-0 h-full flex items-center"
          style={{
            transform: isOpen ? "translateX(0)" : "translateX(80px)",
            transition: "transform 0.3s ease-out",
          }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onRemove(connection._id)}
            className="h-full px-4 bg-destructive text-white flex items-center justify-center"
          >
            <UserMinus size={20} />
          </motion.button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full">
      <div className="min-h-[200px] relative">
        {/* Swipe Tutorial Overlay */}
        <AnimatePresence>
          {showSwipeTutorial && friends && friends.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
            >
              {tutorialStep === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-blue-500 text-white px-5 py-3 rounded-lg shadow-lg"
                >
                  <p className="text-center mb-1 font-medium">Quick Tip</p>
                  <p className="text-center">
                    Swipe left on a friend to see remove option
                  </p>
                </motion.div>
              )}

              {tutorialStep === 1 && (
                <motion.div
                  initial={{ x: 0, opacity: 0 }}
                  animate={{ x: -60, opacity: 1 }}
                  transition={{ duration: 1 }}
                  className="flex items-center bg-blue-500 text-white px-5 py-3 rounded-lg shadow-lg"
                >
                  <span className="mr-2">Swipe left</span>
                  <ChevronLeft size={24} />
                </motion.div>
              )}

              {tutorialStep === 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center bg-white text-black px-5 py-3 rounded-lg shadow-lg"
                >
                  <div className="flex items-center justify-center mb-2">
                    <UserMinus size={20} className="text-red-500 mr-2" />
                    <span className="font-medium">Remove Friend</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Will appear when you swipe left
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="loader"></div>
            </div>
          ) : friends && friends.length > 0 ? (
            <motion.div
              key="friends-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {friends.map((friend, index) => (
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
                    index={index}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-64 text-center"
            >
              <div className="bg-gray-100 p-4 rounded-full mb-4 text-black">
                <UsersRound size={24} />
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
        {isConfirmModalOpen && friendToRemove && (
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
                  <span className="font-medium">
                    {getFriendInfo(friendToRemove).fullName}
                  </span>{" "}
                  from your friends?
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                  onClick={handleCancelRemove}
                  disabled={isRemoving}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 rounded-md text-sm font-medium bg-destructive text-white hover:bg-red-600 transition-colors"
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
