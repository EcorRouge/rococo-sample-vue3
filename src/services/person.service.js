// src/services/person.service.js
import apiClient from '@/config/axios';
import { Notify } from 'quasar';

const API_ENDPOINT = '/person';  // Notice no trailing slash

const personService = {
  async getCurrentUser() {
    try {
      const response = await apiClient.get(`${API_ENDPOINT}/me`);
      
      if (response.data.success) {
        return response.data.person;
      } else {
        Notify.create({
          message: response.data.message || 'Failed to fetch user profile',
          color: 'negative'
        });
        return null;
      }
    } catch (error) {
      Notify.create({ message: 'Error fetching user profile', color: 'negative' });
      console.error('Error fetching user profile:', error);
      return null;
    }
  },

  async updateProfile(profileData) {
    try {
      const response = await apiClient.put(`${API_ENDPOINT}/me`, profileData);
      
      if (response.data.success) {
        Notify.create({
          message: 'Profile updated successfully',
          color: 'positive'
        });
        return response.data.person;
      } else {
        Notify.create({
          message: response.data.message || 'Failed to update profile',
          color: 'negative'
        });
        return null;
      }
    } catch (error) {
      Notify.create({ message: 'Error updating profile', color: 'negative' });
      console.error('Error updating profile:', error);
      return null;
    }
  }
};

export default personService;