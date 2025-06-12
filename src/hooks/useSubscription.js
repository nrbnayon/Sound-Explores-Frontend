// src/hooks/useSubscription.js
import apiClient from "../lib/api-client";

export const subscriptionService = {
  buySubscription: async (plan, price, paymentMethodId) => {
    try {
      const payload = { plan, price };
      if (paymentMethodId) {
        payload.paymentMethodId = paymentMethodId;
      }

      // console.log("Buying subscription with payload:", payload);
      const response = await apiClient.post("/user/buy-subscription", payload);
      // console.log("Subscription response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Subscription error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to create subscription"
      );
    }
  },

  confirmPayment: async (clientSecret, paymentMethodId) => {
    try {
      const response = await apiClient.post("/user/confirm-payment", {
        clientSecret,
        paymentMethodId,
      });
      return response.data;
    } catch (error) {
      console.error("Payment confirmation error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to confirm payment"
      );
    }
  },

  completePayment: async (paymentIntentId) => {
    try {
      const response = await apiClient.post("/user/complete-payment", {
        paymentIntentId,
      });
      return response.data;
    } catch (error) {
      console.error("Complete payment error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to complete payment"
      );
    }
  },

  syncSubscriptionStatus: async () => {
    try {
      // console.log("Syncing subscription status...");
      const response = await apiClient.post("/user/sync-subscription");
      // console.log("Sync subscription response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Sync subscription error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to sync subscription status"
      );
    }
  },

  cancelSubscription: async () => {
    try {
      // console.log("Cancelling subscription...");
      const response = await apiClient.post("/user/cancel-subscription");
      // console.log("Cancel subscription response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Cancel subscription error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to cancel subscription"
      );
    }
  },

  getSubscriptionStatus: async () => {
    try {
      // console.log("Fetching subscription status...");
      const response = await apiClient.get("/user/subscription-status");
      // console.log("Subscription status response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Get subscription status error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch subscription status"
      );
    }
  },

  updatePaymentMethod: async (paymentMethodId) => {
    try {
      const response = await apiClient.post("/user/update-payment-method", {
        paymentMethodId,
      });
      return response.data;
    } catch (error) {
      console.error("Update payment method error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to update payment method"
      );
    }
  },
};
