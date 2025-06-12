// src/hooks/useSound.js
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../lib/api-client";
import toast from "react-hot-toast";

const SOUND_KEYS = {
  all: ["sounds"],
  lists: () => [...SOUND_KEYS.all, "list"],
  list: (filters) => [...SOUND_KEYS.lists(), { filters }],
  details: () => [...SOUND_KEYS.all, "detail"],
  detail: (id) => [...SOUND_KEYS.details(), id],
};

export const useSounds = (filters = {}) => {
  return useQuery({
    queryKey: SOUND_KEYS.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.category) params.append("category", filters.category);
      if (filters.searchTerm) params.append("searchTerm", filters.searchTerm);
      if (filters.page) params.append("page", filters.page);
      if (filters.limit) params.append("limit", filters.limit);

      // Add parameter to show all sounds including premium
      params.append("showAllSounds", "true");

      const query = params.toString() ? `?${params.toString()}` : "";

      const { data } = await apiClient.get(`/sound/get-all-sound${query}`);
      return data;
    },
  });
};

export const useSoundDetails = (soundId) => {
  return useQuery({
    queryKey: SOUND_KEYS.detail(soundId),
    queryFn: async () => {
      // console.log(`Fetching sound details for ID:`, soundId);
      const { data } = await apiClient.get(`/sound/${soundId}`);
      // console.log("Sound details data:", data);
      return data;
    },
    enabled: !!soundId, // Only run if soundId is provided
  });
};

export const useAddSound = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (soundData) => {
      // console.log("Adding new sound:", soundData.title);

      // Create FormData for file upload
      const formData = new FormData();

      // Add non-file data
      formData.append(
        "data",
        JSON.stringify({
          title: soundData.title,
          description: soundData.description,
          isPremium: soundData.isPremium,
          category: soundData.category,
        })
      );

      // Add sound file
      formData.append("sound", soundData.soundFile);

      const { data } = await apiClient.post("/sound/add-sound", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // console.log("Add sound response:", data);
      return data;
    },
    onSuccess: () => {
      toast.success("Sound added successfully");
      // Invalidate sounds list to trigger refetch
      queryClient.invalidateQueries({ queryKey: SOUND_KEYS.lists() });
    },
    onError: (error) => {
      console.error("Add sound error:", error);
      toast.error(error.response?.data?.message || "Failed to add sound");
    },
  });
};

export const useDeleteSound = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (soundId) => {
      // console.log("Deleting sound:", soundId);
      const { data } = await apiClient.delete(`/sound/delete-sound/${soundId}`);
      return data;
    },
    onSuccess: () => {
      toast.success("Sound deleted successfully");
      // Invalidate sounds list to trigger refetch
      queryClient.invalidateQueries({ queryKey: SOUND_KEYS.lists() });
    },
    onError: (error) => {
      console.error("Delete sound error:", error);
      toast.error(error.response?.data?.message || "Failed to delete sound");
    },
  });
};

export const useDeleteMultipleSounds = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (soundIds) => {
      // console.log("Deleting multiple sounds:", soundIds);
      const { data } = await apiClient.delete(`/sound/delete-multiple-sounds`, {
        data: { ids: soundIds },
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Selected sounds deleted successfully");
      // Invalidate sounds list to trigger refetch
      queryClient.invalidateQueries({ queryKey: SOUND_KEYS.lists() });
    },
    onError: (error) => {
      console.error("Delete multiple sounds error:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete selected sounds"
      );
    },
  });
};
