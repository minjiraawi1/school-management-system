import api from './api';

export const profileService = {
  // Get current user profile
  getProfile: async () => {
    const response = await api.get('/profile/me');
    return response.data;
  },

  // Update admin profile (full edit)
  updateAdminProfile: async (profileData) => {
    const response = await api.put('/profile/admin', profileData);
    return response.data;
  },

  // Update password (for all roles)
  updatePassword: async (passwordData) => {
    const response = await api.put('/profile/password', passwordData);
    return response.data;
  },
};

export default profileService;
