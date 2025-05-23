// src/utils/privacyPolicyService.js
import apiClient from "../lib/api-client";

class PrivacyPolicyService {
  // Get active privacy policies (for users)
  async getActivePrivacyPolicies() {
    const response = await apiClient.get("/privacy-policy/active");
    return response.data;
  }

  // Admin: Get all privacy policies with pagination and search
  async getAllPrivacyPolicies(params = {}) {
    const { search = "", page = 1, limit = 20, isActive } = params;
    const queryParams = new URLSearchParams({
      search,
      page: page.toString(),
      limit: limit.toString(),
      ...(isActive !== undefined && { isActive: isActive.toString() }),
    });

    const response = await apiClient.get(`/privacy-policy?${queryParams}`);
    return response.data;
  }

  // Admin: Get privacy policy by ID
  async getPrivacyPolicyById(id) {
    const response = await apiClient.get(`/privacy-policy/${id}`);
    return response.data;
  }

  // Admin: Create new privacy policy
  async createPrivacyPolicy(data) {
    const response = await apiClient.post("/privacy-policy", data);
    return response.data;
  }

  // Admin: Update privacy policy
  async updatePrivacyPolicy(id, data) {
    const response = await apiClient.patch(`/privacy-policy/${id}`, data);
    return response.data;
  }

  // Admin: Delete privacy policy
  async deletePrivacyPolicy(id) {
    const response = await apiClient.delete(`/privacy-policy/${id}`);
    return response.data;
  }

  // Admin: Reorder privacy policies
  async reorderPrivacyPolicies(policies) {
    const response = await apiClient.patch("/privacy-policy/reorder/bulk", {
      policies,
    });
    return response.data;
  }
}

export default new PrivacyPolicyService();
