// src\hooks\useConnections.js
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../lib/api-client";
import toast from "react-hot-toast";

// Constants for user connection status
export const CONNECTION_STATUS = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  BLOCKED: "BLOCKED",
  REMOVED: "REMOVED",
};

const CONNECTION_KEYS = {
  all: ["connections"],
  lists: () => [...CONNECTION_KEYS.all, "list"],
  friendList: (filters) => [...CONNECTION_KEYS.lists(), "friends", { filters }],
  sentRequests: (filters) => [...CONNECTION_KEYS.lists(), "sent", { filters }],
  receivedRequests: (filters) => [
    ...CONNECTION_KEYS.lists(),
    "received",
    { filters },
  ],
  users: (filters) => [...CONNECTION_KEYS.all, "users", { filters }],
};

// Get all users (with search and pagination)
export const useGetAllUsers = (filters = {}) => {
  return useQuery({
    queryKey: CONNECTION_KEYS.users(filters),
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.search) params.append("search", filters.search);
      if (filters.page) params.append("page", filters.page);
      if (filters.limit) params.append("limit", filters.limit);

      const query = params.toString() ? `?${params.toString()}` : "";
      console.log(`Fetching users with query:`, query);

      const response = await apiClient.get(`/user/get-all-user${query}`);
      return response;
    },
    onError: (error) => {
      console.error("Error fetching users:", error);
      toast.error(error.response?.data?.message || "Failed to fetch users");
    },
  });
};

// Get friend list (with search and pagination)
export const useFriendList = (filters = {}) => {
  return useQuery({
    queryKey: CONNECTION_KEYS.friendList(filters),
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.search) params.append("search", filters.search);
      if (filters.page) params.append("page", filters.page);
      if (filters.limit) params.append("limit", filters.limit);

      const query = params.toString() ? `?${params.toString()}` : "";
      console.log("Fetching friend list with query:", query);

      const response = await apiClient.get(
        `/user-connection/friend-list${query}`
      );
      return response;
    },
    onError: (error) => {
      console.error("Error fetching friend list:", error);
      toast.error(error.response?.data?.message || "Failed to fetch friends");
    },
  });
};

// Get sent friend requests (with search and pagination)
export const useSentRequests = (filters = {}) => {
  return useQuery({
    queryKey: CONNECTION_KEYS.sentRequests(filters),
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.search) params.append("search", filters.search);
      if (filters.page) params.append("page", filters.page);
      if (filters.limit) params.append("limit", filters.limit);

      const query = params.toString() ? `?${params.toString()}` : "";
      console.log("Fetching sent friend requests with query:", query);

      const response = await apiClient.get(
        `/user-connection/sent-list${query}`
      );
      return response;
    },
    onError: (error) => {
      console.error("Error fetching sent requests:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch sent requests"
      );
    },
  });
};

// Get received friend requests (with search and pagination)
export const useReceivedRequests = (filters = {}) => {
  return useQuery({
    queryKey: CONNECTION_KEYS.receivedRequests(filters),
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.search) params.append("search", filters.search);
      if (filters.page) params.append("page", filters.page);
      if (filters.limit) params.append("limit", filters.limit);

      const query = params.toString() ? `?${params.toString()}` : "";
      console.log("Fetching received friend requests with query:", query);

      const response = await apiClient.get(
        `/user-connection/request-list${query}`
      );
      return response;
    },
    onError: (error) => {
      console.error("Error fetching received requests:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch received requests"
      );
    },
  });
};

// Send friend request
export const useSendFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId) => {
      console.log("Sending friend request to:", userId);
      const response = await apiClient.post("/user-connection/send-request", {
        userId,
      });
      return response;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Friend request sent successfully");
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: CONNECTION_KEYS.sentRequests(),
      });
      queryClient.invalidateQueries({
        queryKey: CONNECTION_KEYS.users(),
      });
    },
    onError: (error) => {
      console.error("Send friend request error:", error);
      toast.error(
        error.response?.data?.message || "Failed to send friend request"
      );
    },
  });
};

// Accept friend request
export const useAcceptFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId) => {
      console.log("Accepting friend request from:", userId);
      const response = await apiClient.patch(
        "/user-connection/accept-request",
        { userId }
      );
      return response;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Friend request accepted successfully");
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: CONNECTION_KEYS.receivedRequests(),
      });
      queryClient.invalidateQueries({
        queryKey: CONNECTION_KEYS.friendList(),
      });
    },
    onError: (error) => {
      console.error("Accept friend request error:", error);
      toast.error(
        error.response?.data?.message || "Failed to accept friend request"
      );
    },
  });
};

// Reject friend request
export const useRejectFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId) => {
      console.log("Rejecting friend request from:", userId);
      const response = await apiClient.patch(
        "/user-connection/reject-request",
        { userId }
      );
      return response;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Friend request rejected successfully");
      // Invalidate received requests
      queryClient.invalidateQueries({
        queryKey: CONNECTION_KEYS.receivedRequests(),
      });
    },
    onError: (error) => {
      console.error("Reject friend request error:", error);
      toast.error(
        error.response?.data?.message || "Failed to reject friend request"
      );
    },
  });
};

// Remove friend
export const useRemoveFriend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId) => {
      console.log("Removing friend:", userId);
      const response = await apiClient.patch("/user-connection/remove-friend", {
        userId,
      });
      return response;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Friend removed successfully");
      // Invalidate friend list
      queryClient.invalidateQueries({
        queryKey: CONNECTION_KEYS.friendList(),
      });
      queryClient.invalidateQueries({
        queryKey: CONNECTION_KEYS.users(),
      });
    },
    onError: (error) => {
      console.error("Remove friend error:", error);
      toast.error(error.response?.data?.message || "Failed to remove friend");
    },
  });
};

// Cancel sent friend request
export const useCancelFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId) => {
      console.log("Canceling friend request to:", userId);
      const response = await apiClient.patch(
        "/user-connection/cancel-request",
        {
          userId,
        }
      );
      return response;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Friend request canceled successfully");
      // Invalidate sent requests
      queryClient.invalidateQueries({
        queryKey: CONNECTION_KEYS.sentRequests(),
      });
      queryClient.invalidateQueries({
        queryKey: CONNECTION_KEYS.users(),
      });
    },
    onError: (error) => {
      console.error("Cancel friend request error:", error);
      toast.error(
        error.response?.data?.message || "Failed to cancel friend request"
      );
    },
  });
};
