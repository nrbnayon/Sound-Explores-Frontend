// src\components\Friends\FriendRequests.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Clock, UserX, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import {
  useAcceptFriendRequest,
  useRejectFriendRequest,
  useCancelFriendRequest,
} from "../../hooks/useConnections";
import { useAuth } from "../../contexts/AuthContext";

const FriendRequests = ({ receivedRequests, sentRequests, isLoading }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState("");
  const [requestToAction, setRequestToAction] = useState(null);
  const { user } = useAuth();
  const API_URL = import.meta.env.VITE_ASSETS_URL || "";
  const { mutate: acceptRequest, isLoading: isAccepting } =
    useAcceptFriendRequest();
  const { mutate: rejectRequest, isLoading: isRejecting } =
    useRejectFriendRequest();
  const { mutate: cancelRequest, isLoading: isCanceling } =
    useCancelFriendRequest();
  const getRequestUserInfo = (request, isSentRequest = false) => {
    if (!request?.users || request.users.length < 2) {
      return {
        fullName: "Unknown User",
        email: "unknown@example.com",
        image: "/profile.png",
      };
    }
    const currentUserId = user?._id;
    const otherUser = request.users.find((u) => u.user !== currentUserId);

    if (!otherUser) {
      return {
        fullName: "Unknown User",
        email: "unknown@example.com",
        image: "/profile.png",
      };
    }
    return {
      fullName: otherUser.fullName || "Unknown User",
      email: otherUser.email || "unknown@example.com",
      image: otherUser.image || "/profile.png",
    };
  };
  const handleAcceptRequest = (connectionID) => {
    acceptRequest(connectionID, {
      onSuccess: () => {
        toast.success("Friend request accepted");
      },
      onError: (error) => {
        toast.error(          error?.response?.data?.message || "Failed to accept friend request"
        );
      },
    });
  };
  const handleInitiateAction = (action, connectionID) => {
    const request =
      action === "reject"
        ? receivedRequests.find((req) => req._id === connectionID)
        : sentRequests.find((req) => req._id === connectionID);

    setRequestToAction(request);
    setModalAction(action);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmAction = () => {
    if (!requestToAction) return;
    if (modalAction === "reject") {
      rejectRequest(requestToAction._id, {
        onSuccess: () => {
          toast.success("Friend request rejected");
          setIsConfirmModalOpen(false);
          setRequestToAction(null);
        },
        onError: (error) => {
          toast.error(
            error?.response?.data?.message || "Failed to reject friend request"
          );
          setIsConfirmModalOpen(false);
          setRequestToAction(null);
        },
      });
    } else if (modalAction === "cancel") {
      cancelRequest(requestToAction._id, {
        onSuccess: () => {
          toast.success("Friend request canceled");
          setIsConfirmModalOpen(false);
          setRequestToAction(null);
        },
        onError: (error) => {
          toast.error(
            error?.response?.data?.message || "Failed to cancel friend request"
          );
          setIsConfirmModalOpen(false);
          setRequestToAction(null);
        },
      });
    }
  };
  const handleCancelAction = () => {
    setIsConfirmModalOpen(false);
    setRequestToAction(null);
  };

  return (
    <div className='flex flex-col w-full'>
      <div className='flex mb-4 border-b'>
        <button
          className={`w-1/2 py-2 text-center ${
            activeTab === 0
              ? "text-primary border-b-2 border-blue-500 font-medium"
              : "text-muted-foreground"
          }`}
          onClick={() => setActiveTab(0)}
        >
          Received Requests ({receivedRequests?.length || 0})
        </button>
        <button
          className={`w-1/2 py-2 text-center ${
            activeTab === 1
              ? "text-primary border-b-2 border-blue-500 font-medium"
              : "text-muted-foreground"
          }`}
          onClick={() => setActiveTab(1)}
        >
          Sent Requests ({sentRequests?.length || 0})
        </button>
      </div>

      <div className='min-h-[200px]'>
        <AnimatePresence mode='wait'>
          {isLoading ? (
            <div className='flex items-center justify-center h-64'>
              <div className='loader'></div>
            </div>
          ) : activeTab === 0 ? (
            receivedRequests?.length > 0 ? (
              <motion.div
                key='received'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {receivedRequests.map((request) => {
                  const userInfo = getRequestUserInfo(request, false);
                  return (
                    <motion.div
                      key={request._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className='flex justify-between items-center bg-card rounded-lg p-3 mb-3 shadow-sm'
                    >
                      <div className='flex-shrink-0 mr-3'>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className='w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-100'
                        >
                          <img
                            src={
                              userInfo.image
                                ? `${API_URL}${userInfo.image}`
                                : "/profile.png"
                            }
                            alt={userInfo.fullName || userInfo.email}
                            className='w-full h-full object-cover'
                          />
                        </motion.div>
                      </div>

                      <div className='flex-1'>
                        <h3 className='text-base font-medium'>
                          {userInfo.fullName}
                        </h3>
                        <p className='text-xs text-muted-foreground'>
                          {userInfo.email.length > 25
                            ? `${userInfo.email.slice(0, 25)}...`
                            : userInfo.email}
                        </p>
                      </div>

                      <div className='flex gap-2'>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          disabled={isAccepting}
                          className='px-3 py-1.5 rounded-md text-sm font-medium bg-primary text-white hover:bg-blue-600 transition-colors flex items-center gap-1'
                          onClick={() => handleAcceptRequest(request._id)}
                        >
                          <Check size={16} /> Accept
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          disabled={isRejecting}
                          className='px-3 py-1.5 rounded-md text-sm font-medium bg-destructive text-white hover:bg-red-600 transition-colors flex items-center gap-1'
                          onClick={() =>
                            handleInitiateAction("reject", request._id)
                          }
                        >
                          <X size={16} /> Reject
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key='no-received'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className='flex flex-col items-center justify-center h-64 text-center'
              >
                <div className='bg-gray-100 p-4 rounded-full mb-4 text-black'>
                  <UserX />
                </div>
                <p className='text-muted-foreground font-medium'>
                  No friend requests received
                </p>
                <p className='text-muted-foreground text-sm mt-1'>
                  When someone sends you a friend request, it will appear here
                </p>
              </motion.div>
            )
          ) : // Sent Requests
          sentRequests?.length > 0 ? (
            <motion.div
              key='sent'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {sentRequests.map((request) => {
                const userInfo = getRequestUserInfo(request, true);
                return (
                  <motion.div
                    key={request._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className='flex justify-between items-center bg-card rounded-lg p-3 mb-3 shadow-sm'
                  >
                    <div className='flex-shrink-0 mr-3 '>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className='w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-100'
                      >
                        <img
                          src={
                            userInfo.image
                              ? `${API_URL}${userInfo.image}`
                              : "/profile.png"
                          }
                          alt={userInfo.fullName || userInfo.email}
                          className='w-full h-full object-cover'
                        />
                      </motion.div>
                    </div>

                    <div className='flex-1'>
                      <h3 className='text-base font-medium'>
                        {userInfo.fullName}
                      </h3>
                      <p className='text-xs text-muted-foreground'>
                        {userInfo.email.length > 25
                          ? `${userInfo.email.slice(0, 25)}...`
                          : userInfo.email}
                      </p>
                    </div>

                    <div className='flex gap-2 items-center'>
                      <span className='text-xs text-muted-foreground flex items-center mr-2'>
                        <Clock size={14} className='mr-1' /> Pending
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={isCanceling}
                        className='px-3 py-1.5 rounded-md text-sm font-medium bg-destructive text-white hover:bg-red-600 transition-colors flex items-center gap-1'
                        onClick={() =>
                          handleInitiateAction("cancel", request._id)
                        }
                      >
                        <X size={16} /> Cancel
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key='no-sent'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='flex flex-col items-center justify-center h-64 text-center'
            >
              <div className='bg-gray-100 p-4 rounded-full mb-4 text-black'>
                <UserPlus />
              </div>
              <p className='text-muted-foreground font-medium'>
                No friend requests sent
              </p>
              <p className='text-muted-foreground text-sm mt-1'>
                When you send friend requests, they will appear here
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {isConfirmModalOpen && requestToAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
            onClick={handleCancelAction}
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
                  {modalAction === "reject"
                    ? "Reject Friend Request"
                    : "Cancel Friend Request"}
                </h3>
                <button
                  onClick={handleCancelAction}
                  className='text-gray-500 hover:text-gray-700'
                >
                  <X size={20} />
                </button>
              </div>

              <div className='mb-6'>
                <p className='text-gray-600'>
                  {modalAction === "reject" ? (
                    <>
                      Are you sure you want to reject the friend request from{" "}
                      <span className='font-medium'>
                        {requestToAction &&
                          getRequestUserInfo(requestToAction, false).fullName}
                      </span>
                      ?
                    </>
                  ) : (
                    <>
                      Are you sure you want to cancel your friend request to{" "}
                      <span className='font-medium'>
                        {requestToAction &&
                          getRequestUserInfo(requestToAction, true).fullName}
                      </span>
                      ?
                    </>
                  )}
                </p>
              </div>

              <div className='flex justify-end gap-3'>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className='px-4 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors'
                  onClick={handleCancelAction}
                  disabled={isRejecting || isCanceling}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className='px-4 py-2 rounded-md text-sm font-medium bg-destructive text-white hover:bg-red-600 transition-colors'
                  onClick={handleConfirmAction}
                  disabled={isRejecting || isCanceling}
                >
                  {modalAction === "reject"
                    ? isRejecting
                      ? "Rejecting..."
                      : "Confirm"
                    : isCanceling
                    ? "Canceling..."
                    : "Confirm"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FriendRequests;