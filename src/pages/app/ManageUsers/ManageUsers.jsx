// src\pages\app\ManageUsers\ManageUsers.jsx
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Trash2, UserX, Users } from "lucide-react";
import { useGetAllUsers } from "../../../hooks/useConnections";
import { useDeleteUserByAdmin } from "../../../hooks/useAdmin";
import { useAuth } from "../../../contexts/AuthContext";
import Pagination from "../../../components/ui/pagination";
import toast from "react-hot-toast";

const ManageUsers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [contentHeight, setContentHeight] = useState("auto");
  const contentRef = useRef(null);
  const { user: currentUser } = useAuth();
  const API_URL = import.meta.env.VITE_ASSETS_URL || "";

  // Get all users data
  const { data: allUsersData, isLoading: isAllUsersLoading } = useGetAllUsers({
    search: searchTerm,
    page: currentPage,
    limit,
  });

  // Delete user mutation
  const deleteUserMutation = useDeleteUserByAdmin();

  // Prepare data with proper fallbacks
  const allUsers = allUsersData?.data?.data?.data || [];
  const totalUsersPages = allUsersData?.data?.meta?.totalPage || 1;
  const totalUsers = allUsersData?.data?.meta?.totalItem || 0;

  // Filter out current admin from the list - ensure allUsers is an array
  const filteredUsers = Array.isArray(allUsers)
    ? allUsers.filter((user) => user._id !== currentUser?._id)
    : [];

  // console.log("Filtered Users:", filteredUsers);

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

  // Handle delete user initiation
  const handleInitiateDelete = (user) => {
    setUserToDelete(user);
    setIsConfirmModalOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await deleteUserMutation.mutateAsync(userToDelete._id);
      setIsConfirmModalOpen(false);
      setUserToDelete(null);
      toast.success(
        `User ${
          userToDelete.profile?.fullName || userToDelete.email
        } deleted successfully`
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setIsConfirmModalOpen(false);
    setUserToDelete(null);
  };

  // Track content height for smooth transitions
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(`${contentRef.current.scrollHeight}px`);
    }
  }, [filteredUsers, isAllUsersLoading]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-[calc(100vh-120px)] overflow-hidden"
    >
      {/* Header - Fixed, doesn't scroll */}
      <div className="sticky top-0 z-10 bg-background">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Manage Users</h2>
              <p className="text-sm text-muted-foreground">
                {filteredUsers?.length} total users
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar - Fixed, doesn't scroll */}
        <div className="relative mb-4 px-1 text-black">
          <input
            type="text"
            placeholder="Search users by name, email, or phone..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full p-3 pl-10 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      {/* Scrollable content */}
      <div
        className="flex-1 overflow-y-auto scroll-container relative"
        ref={contentRef}
        style={{
          minHeight: "300px",
          height: contentHeight,
          transition: "height 0.3s ease",
        }}
      >
        <div className="min-h-[200px]">
          <AnimatePresence>
            {isAllUsersLoading ? (
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
                  className="flex items-center bg-card rounded-lg p-4 mb-3 shadow-sm border"
                >
                  <div className="flex-shrink-0 mr-4">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-gray-100"
                    >
                      <img
                        src={
                          user?.profile?.image
                            ? `${API_URL}${user.profile.image}`
                            : "/profile.png"
                        }
                        alt={user.profile?.fullName || user.email}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "/profile.png";
                        }}
                      />
                    </motion.div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-medium truncate">
                        {user.profile?.fullName}
                      </h3>

                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          user?.isSubscribed
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user?.isSubscribed
                          ? `Premium #${user?.premiumUserNumber}`
                          : "Free"}
                      </span>

                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          user.role === "ADMIN"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mb-1">
                      {user.email.length > 25
                        ? `${user.email.slice(0, 25)}...`
                        : user.email || user.email.split("@")[0]}
                    </p>
                    {/* {user.phone && (
                      <p className="text-xs text-muted-foreground">
                        {user.phone}
                      </p>
                    )} */}
                  </div>

                  <div className="flex-shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={deleteUserMutation.isLoading}
                      className="px-3 py-2 bg-destructive text-white rounded-md text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      onClick={() => handleInitiateDelete(user)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </motion.button>
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
                  <UserX className="w-8 h-8" />
                </div>
                <p className="text-muted-foreground font-medium">
                  No users found
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  {searchTerm
                    ? "Try adjusting your search criteria"
                    : "No users available to manage"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Pagination */}
      {totalUsersPages > 1 && (
        <div className="mt-4 mb-2">
          <Pagination
            totalPages={totalUsersPages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isConfirmModalOpen && userToDelete && (
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
              className="bg-white rounded-lg p-6 w-96 mx-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-100 p-2 rounded-full">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg text-black font-semibold">
                  Delete User
                </h3>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 mb-3">
                  Are you sure you want to permanently delete this user? This
                  action cannot be undone.
                </p>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        userToDelete?.profile?.image
                          ? `${API_URL}${userToDelete.profile.image}`
                          : "/profile.png"
                      }
                      alt={
                        userToDelete?.profile?.fullName || userToDelete?.email
                      }
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = "/profile.png";
                      }}
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        {userToDelete?.profile?.fullName ||
                          userToDelete?.email?.split("@")[0]}
                      </p>
                      <p className="text-sm text-gray-500">
                        {userToDelete?.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                  onClick={handleCancelDelete}
                  disabled={deleteUserMutation.isLoading}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 rounded-md text-sm font-medium bg-destructive text-white hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  onClick={handleConfirmDelete}
                  disabled={deleteUserMutation.isLoading}
                >
                  {deleteUserMutation.isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete User
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ManageUsers;
