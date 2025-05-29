// src\hooks\useAdmin.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../lib/api-client";
import toast from "react-hot-toast";

export const useDeleteUserByAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId) => {
      // console.log(`Deleting user with ID:`, userId);
      const { data } = await apiClient.delete(`/user/delete-user`, {
        data: { userId: userId },
      });
      return data;
    },
    onSuccess: (data) => {
      // Invalidate multiple queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
    onError: (error) => {
      console.error("Error deleting user:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to delete user";
      toast.error(errorMessage);
    },
  });
};
