// src\pages\app\Friends\Friends.jsx
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import FindFriends from "../../../components/Friends/FindFriends";
import YourFriends from "../../../components/Friends/YourFriends";
import FriendRequests from "../../../components/Friends/FriendRequests";
import Pagination from "../../../components/ui/pagination";
import {
  useGetAllUsers,
  useFriendList,
  useSentRequests,
  useReceivedRequests,
} from "../../../hooks/useConnections";

const Friends = () => {
  // Tab management
  // 0 = Your Friends, 1 = Find Friends, 2 = Friend Requests
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const contentRef = useRef(null);

  // Track content height to prevent scrollbar flashing
  const [contentHeight, setContentHeight] = useState("auto");

  // Get friend data using hooks
  const { data: friendListData, isLoading: isFriendListLoading } =
    useFriendList({
      search: searchTerm,
      page: currentPage,
      limit,
    });

  const { data: allUsersData, isLoading: isAllUsersLoading } = useGetAllUsers({
    search: searchTerm,
    page: currentPage,
    limit,
  });

  const { data: receivedRequestsData, isLoading: isReceivedRequestsLoading } =
    useReceivedRequests({
      search: searchTerm,
      page: currentPage,
      limit,
    });

  const { data: sentRequestsData, isLoading: isSentRequestsLoading } =
    useSentRequests({
      search: searchTerm,
      page: currentPage,
      limit,
    });

  // Prepare data for components
  const friends = friendListData?.data?.data || [];
  const totalFriendsPages = friendListData?.data?.meta?.totalPage || 1;
  const allUsers = allUsersData?.data?.data || [];
  const totalUsersPages = allUsersData?.data?.meta?.totalPage || 1;
  const receivedRequests = receivedRequestsData?.data?.data || [];
  const sentRequests = sentRequestsData?.data?.data || [];
  const totalRequestsPages = Math.max(
    receivedRequestsData?.data?.meta?.totalPage || 1,
    sentRequestsData?.data?.meta?.totalPage || 1
  );
  const requests = [...receivedRequests, ...sentRequests];

  // Handle search
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleTabChange = (newTabState) => {
    if (selectedTab !== newTabState) {
      if (contentRef.current) {
        setContentHeight(`${contentRef.current.scrollHeight}px`);
      }
      setSelectedTab(newTabState);
      setCurrentPage(1);
      setSearchTerm("");

      setTimeout(() => {
        setContentHeight("auto");
      }, 350);
    }
  };

  // Count of pending friend requests (for badge)
  const pendingRequestsCount = receivedRequests.length;

  // Get current tab pagination count
  const getCurrentTabTotalPages = () => {
    switch (selectedTab) {
      case 0: // Your Friends
        return totalFriendsPages;
      case 1: // Find Friends
        return totalUsersPages;
      case 2: // Friend Requests
        return totalRequestsPages;
      default:
        return 1;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className='flex flex-col h-[calc(100vh-120px)] overflow-hidden '
    >
      {/* Tabs - Fixed, doesn't scroll */}
      <div className='sticky top-0 z-10 bg-background'>
        <div className='flex mb-4'>
          <div className='flex flex-row w-full border-b'>
            <motion.button
              whileHover={{ backgroundColor: "#f9fafb" }}
              whileTap={{ scale: 0.95 }}
              className={`w-1/3 py-3 text-center transition-colors ${
                selectedTab === 0
                  ? "text-primary font-medium border-b-2 border-blue-500"
                  : "text-muted-foreground"
              }`}
              onClick={() => handleTabChange(0)}
            >
              Your Friends
            </motion.button>
            <motion.button
              whileHover={{ backgroundColor: "#f9fafb" }}
              whileTap={{ scale: 0.95 }}
              className={`w-1/3 py-3 text-center transition-colors ${
                selectedTab === 1
                  ? "text-primary font-medium border-b-2 border-blue-500"
                  : "text-muted-foreground"
              }`}
              onClick={() => handleTabChange(1)}
            >
              Find Friends
            </motion.button>

            <motion.button
              whileHover={{ backgroundColor: "#f9fafb" }}
              whileTap={{ scale: 0.95 }}
              className={`w-1/3 py-3 text-center transition-colors relative ${
                selectedTab === 2
                  ? "text-primary font-medium border-b-2 border-blue-500"
                  : "text-muted-foreground"
              }`}
              onClick={() => handleTabChange(2)}
            >
              Requests
              <span className='absolute top-2 right-8 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full'>
                {pendingRequestsCount}
              </span>
            </motion.button>
          </div>
        </div>

        {/* Search Bar - Fixed, doesn't scroll */}
        <div className='relative mb-4 px-1 text-black'>
          <input
            type='text'
            placeholder={
              selectedTab === 0
                ? "Search your friends"
                : selectedTab === 1
                ? "Search for new friends"
                : "Search friend requests"
            }
            value={searchTerm}
            onChange={handleSearch}
            className='w-full p-3 pl-10 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
          <Search className='absolute left-3 top-3 h-5 w-5 text-muted-foreground' />
        </div>
      </div>

      {/* Scrollable content with fixed scrollbar */}
      <div
        className='flex-1 overflow-y-auto scroll-container relative'
        ref={contentRef}
        style={{
          minHeight: "300px",
          height: contentHeight,
          transition: "height 0.3s ease",
        }}
      >
        <AnimatePresence mode='wait'>
          <motion.div
            key={`tab-${selectedTab}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className='w-full friends-list-container'
          >
            {selectedTab === 0 && (
              <YourFriends friends={friends} isLoading={isFriendListLoading} />
            )}

            {selectedTab === 1 && (
              <FindFriends
                users={allUsers}
                friends={friends}
                sentRequests={sentRequests}
                receivedRequests={receivedRequests}
                isLoading={
                  isAllUsersLoading ||
                  isFriendListLoading ||
                  isSentRequestsLoading ||
                  isReceivedRequestsLoading
                }
                allRequest={requests}
              />
            )}

            {selectedTab === 2 && (
              <FriendRequests
                receivedRequests={receivedRequests}
                sentRequests={sentRequests}
                isLoading={isReceivedRequestsLoading || isSentRequestsLoading}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {getCurrentTabTotalPages() > 1 && (
        <div className='mt-4 mb-2'>
          <Pagination
            totalPages={getCurrentTabTotalPages()}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </motion.div>
  );
};

export default Friends;
