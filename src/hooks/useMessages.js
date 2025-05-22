// src/hooks/useMessages.js
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../lib/api-client";
import toast from "react-hot-toast";

const MESSAGE_KEYS = {
  all: ["messages"],
  lists: () => [...MESSAGE_KEYS.all, "list"],
  conversation: (userId) => [...MESSAGE_KEYS.lists(), userId],
};

// Send sound message

export const useSendSoundMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ users, link, soundTitle }) => {
      // console.log(
      //   "Sending sound message to users:",
      //   users,
      //   "with link:",
      //   link,
      //   "and title:",
      //   soundTitle
      // );
      const { data } = await apiClient.post("/message/send-sound", {
        users,
        link,
        soundTitle,
      });
      // console.log("Send sound message response:", data);
      return data;
    },
    onSuccess: (data, variables) => {
      // Ensure users is always treated as an array
      const userArray = Array.isArray(variables.users)
        ? variables.users
        : [variables.users];

      // Invalidate relevant queries
      userArray.forEach((userId) => {
        queryClient.invalidateQueries({
          queryKey: MESSAGE_KEYS.conversation(userId),
        });
      });
      queryClient.invalidateQueries({ queryKey: MESSAGE_KEYS.lists() });
    },
    onError: (error) => {
      console.error("Send sound message error:", error);
      toast.error(
        error.response?.data?.message || "Failed to send sound message"
      );
    },
  });
};
// export const useSendSoundMessage = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async ({ users, link, soundTitle }) => {
//       console.log(
//         "Sending sound message to users:",
//         users,
//         "with link:",
//         link,
//         "and title:",
//         soundTitle
//       );
//       const { data } = await apiClient.post("/message/send-sound", {
//         users,
//         link,
//         soundTitle,
//       });
//       console.log("Send sound message response:", data);
//       return data;
//     },
//     onSuccess: (data, variables) => {
//       // Ensure users is always treated as an array
//       const userArray = Array.isArray(variables.users)
//         ? variables.users
//         : [variables.users];

//       // Invalidate relevant queries
//       userArray.forEach((userId) => {
//         queryClient.invalidateQueries({
//           queryKey: MESSAGE_KEYS.conversation(userId),
//         });
//       });
//       queryClient.invalidateQueries({ queryKey: MESSAGE_KEYS.lists() });
//     },
//     onError: (error) => {
//       console.error("Send sound message error:", error);
//       toast.error(
//         error.response?.data?.message || "Failed to send sound message"
//       );
//     },
//   });
// };

// Get conversation messages with a user
export const useConversation = (userId) => {
  return useQuery({
    queryKey: MESSAGE_KEYS.conversation(userId),
    queryFn: async () => {
      // console.log(`Fetching conversation with user:`, userId);
      const { data } = await apiClient.get(`/message/conversation/${userId}`);
      // console.log("Conversation data:", data);
      return data;
    },
    enabled: !!userId,
  });
};

// Get all conversations
export const useConversations = () => {
  return useQuery({
    queryKey: MESSAGE_KEYS.lists(),
    queryFn: async () => {
      // console.log("Fetching all conversations");
      const { data } = await apiClient.get("/message/conversations");
      // console.log("All conversations data:", data);
      return data;
    },
  });
};

// Send message
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ users, link }) => {
      // console.log("Sending message to users:", users, "with link:", link);
      const { data } = await apiClient.post("/message/send-message", {
        users,
        link,
      });
      // console.log("Send message response:", data);
      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      variables.users.forEach((userId) => {
        queryClient.invalidateQueries({
          queryKey: MESSAGE_KEYS.conversation(userId),
        });
      });
      queryClient.invalidateQueries({ queryKey: MESSAGE_KEYS.lists() });
    },
    onError: (error) => {
      console.error("Send message error:", error);
      toast.error(error.response?.data?.message || "Failed to send message");
    },
  });
};
