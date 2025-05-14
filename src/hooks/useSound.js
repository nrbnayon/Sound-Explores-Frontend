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
      if (filters.search) params.append("searchTerm", filters.search);
      if (filters.page) params.append("page", filters.page);
      if (filters.limit) params.append("limit", filters.limit);

      const query = params.toString() ? `?${params.toString()}` : "";
      console.log(`Fetching sounds with query:`, query);

      const { data } = await apiClient.get(`/sound/get-all-sound${query}`);
      console.log("Sounds data:", data);
      return data;
    },
  });
};

export const useSoundDetails = (soundId) => {
  return useQuery({
    queryKey: SOUND_KEYS.detail(soundId),
    queryFn: async () => {
      console.log(`Fetching sound details for ID:`, soundId);
      const { data } = await apiClient.get(`/sound/${soundId}`);
      console.log("Sound details data:", data);
      return data;
    },
    enabled: !!soundId, // Only run if soundId is provided
  });
};

export const useAddSound = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (soundData) => {
      console.log("Adding new sound:", soundData.title);

      // Create FormData for file upload
      const formData = new FormData();

      // Add non-file data
      formData.append(
        "data",
        JSON.stringify({
          title: soundData.title,
          description: soundData.description,
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

      console.log("Add sound response:", data);
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
