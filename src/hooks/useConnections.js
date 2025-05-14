// src/hooks/useConnections.js
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../lib/api-client";
import toast from "react-hot-toast";

const CONNECTION_KEYS = {
  all: ["connections"],
  lists: () => [...CONNECTION_KEYS.all, "list"],
  friendList: () => [...CONNECTION_KEYS.lists(), "friends"],
  sentRequests: () => [...CONNECTION_KEYS.lists(), "sent"],
  receivedRequests: () => [...CONNECTION_KEYS.lists(), "received"],
  users: (filters) => [...CONNECTION_KEYS.all, "users", { filters }],
};

// Get all users (with search)
export const useUsers = (filters = {}) => {
  return useQuery({
    queryKey: CONNECTION_KEYS.users(filters),
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.search) params.append("searchTerm", filters.search);
      if (filters.page) params.append("page", filters.page);
      if (filters.limit) params.append("limit", filters.limit);

      const query = params.toString() ? `?${params.toString()}` : "";
      console.log(`Fetching users with query:`, query);

      const { data } = await apiClient.get(`/user/get-all-user${query}`);
      console.log("Users data:", data);
      return data;
    },
  });
};

// Get friend list
export const useFriendList = () => {
  return useQuery({
    queryKey: CONNECTION_KEYS.friendList(),
    queryFn: async () => {
      console.log("Fetching friend list");
      const { data } = await apiClient.get("/user-connection/friend-list");
      console.log("Friend list data:", data);
      return data;
    },
  });
};

// Get sent friend requests
export const useSentRequests = () => {
  return useQuery({
    queryKey: CONNECTION_KEYS.sentRequests(),
    queryFn: async () => {
      console.log("Fetching sent friend requests");
      const { data } = await apiClient.get("/user-connection/sent-list");
      console.log("Sent requests data:", data);
      return data;
    },
  });
};

// Get received friend requests
export const useReceivedRequests = () => {
  return useQuery({
    queryKey: CONNECTION_KEYS.receivedRequests(),
    queryFn: async () => {
      console.log("Fetching received friend requests");
      const { data } = await apiClient.get("/user-connection/request-list");
      console.log("Received requests data:", data);
      return data;
    },
  });
};

// Send friend request
export const useSendFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId) => {
      console.log("Sending friend request to:", userId);
      const { data } = await apiClient.post("/user-connection/send-request", {
        userId,
      });
      console.log("Send friend request response:", data);
      return data;
    },
    onSuccess: () => {
      toast.success("Friend request sent successfully");
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: CONNECTION_KEYS.sentRequests(),
      });
      queryClient.invalidateQueries({ queryKey: CONNECTION_KEYS.users() });
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
      const { data } = await apiClient.patch(
        "/user-connection/accept-request",
        { userId }
      );
      console.log("Accept friend request response:", data);
      return data;
    },
    onSuccess: () => {
      toast.success("Friend request accepted");
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: CONNECTION_KEYS.receivedRequests(),
      });
      queryClient.invalidateQueries({ queryKey: CONNECTION_KEYS.friendList() });
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
      const { data } = await apiClient.patch(
        "/user-connection/reject-request",
        { userId }
      );
      console.log("Reject friend request response:", data);
      return data;
    },
    onSuccess: () => {
      toast.success("Friend request rejected");
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
      const { data } = await apiClient.patch("/user-connection/remove-friend", {
        userId,
      });
      console.log("Remove friend response:", data);
      return data;
    },
    onSuccess: () => {
      toast.success("Friend removed successfully");
      // Invalidate friend list
      queryClient.invalidateQueries({ queryKey: CONNECTION_KEYS.friendList() });
    },
    onError: (error) => {
      console.error("Remove friend error:", error);
      toast.error(error.response?.data?.message || "Failed to remove friend");
    },
  });
};
