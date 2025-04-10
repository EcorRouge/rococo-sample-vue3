import { defineStore, acceptHMRUpdate } from 'pinia'
import axios from "@/config/axios"
import { useNotificationStore } from './notification'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    accessToken: localStorage.getItem('accessToken') || null,
    accessTokenExpiry: localStorage.getItem('accessTokenExpiry') || null,
    initialized: false
  }),

  getters: {
    isAuthenticated: (state) => {
      if (!state.accessToken || !state.accessTokenExpiry) {
        return false;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      return currentTime < state.accessTokenExpiry;
    },
    
    userInitials: (state) => {
      if (!state.user) return '?';
      return (
        (state.user.first_name?.[0] || '') + 
        (state.user.last_name?.[0] || '')
      ).toUpperCase();
    }
  },

  actions: {
    async initialize() {
      // Check for token in localStorage and validate it
      if (this.accessToken) {
        try {
          // Optionally verify the token with the backend
          // await this.validateToken(); 
        } catch {
          // If token is invalid, clear auth state
          this.logout(false); // Don't redirect
        }
      }
      
      this.initialized = true;
      return this.isAuthenticated;
    },
    
    async signup(payload) {
      const notificationStore = useNotificationStore();
      
      try {
        const response = await axios.post('/auth/signup', payload);
        
        if (response.data?.success) {
          return true;
        } else {
          notificationStore.showNotification({
            type: 'negative',
            message: response.data?.message || 'Signup failed',
            icon: 'error'
          });
          return false;
        }
      } catch (error) {
        notificationStore.showNotification({
          type: 'negative',
          message: error.response?.data?.message || 'An unknown error occurred',
          icon: 'error'
        });
        return false;
      }
    },

    async login(payload) {
      const notificationStore = useNotificationStore();
      
      try {
        const response = await axios.post('/auth/login', payload);
        
        if (!response.data?.success) {
          notificationStore.showNotification({
            type: 'negative',
            message: response.data?.message || 'Login failed',
            icon: 'error'
          });
          return false;
        }
        
        const { person, access_token, expiry } = response.data;
        
        // Store in state
        this.user = person;
        this.accessToken = access_token;
        this.accessTokenExpiry = expiry;
        
        // Store in localStorage
        localStorage.setItem('user', JSON.stringify(person));
        localStorage.setItem('accessToken', access_token);
        localStorage.setItem('accessTokenExpiry', expiry);
        
        // Set auth header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        
        notificationStore.showNotification({
          type: 'positive',
          message: 'Login successful',
          icon: 'check_circle'
        });
        
        return true;
      } catch (error) {
        notificationStore.showNotification({
          type: 'negative',
          message: error.response?.data?.message || 'An unknown error occurred',
          icon: 'error'
        });
        return false;
      }
    },

    async setPassword(token, uidb64, payload) {
      const notificationStore = useNotificationStore();
      
      try {
        const response = await axios.post(`/auth/reset_password/${token}/${uidb64}`, payload);
        
        if (!response.data?.success) {
          notificationStore.showNotification({
            type: 'negative',
            message: response.data?.message || 'Failed to set password',
            icon: 'error'
          });
          return false;
        }
        
        notificationStore.showNotification({
          type: 'positive',
          message: 'Password set successfully',
          icon: 'check_circle'
        });
        
        return true;
      } catch (error) {
        notificationStore.showNotification({
          type: 'negative',
          message: error.response?.data?.message || 'An unknown error occurred',
          icon: 'error'
        });
        return false;
      }
    },

    updateUser(userData) {
      this.user = { ...this.user, ...userData };
      localStorage.setItem('user', JSON.stringify(this.user));
    },

    async requestPasswordReset(payload) {
      const notificationStore = useNotificationStore();
      
      try {
        const response = await axios.post('/auth/forgot_password', payload);
        
        if (response.data?.success) {
          notificationStore.showNotification({
            type: 'positive',
            message: 'Password reset instructions sent to your email',
            icon: 'email'
          });
          return true;
        } else {
          notificationStore.showNotification({
            type: 'negative',
            message: response.data?.message || 'Failed to request password reset',
            icon: 'error'
          });
          return false;
        }
      } catch (error) {
        notificationStore.showNotification({
          type: 'negative',
          message: error.response?.data?.message || 'An unknown error occurred',
          icon: 'error'
        });
        return false;
      }
    },

    logout(redirect = true) {
      // Clear state
      this.user = null;
      this.accessToken = null;
      this.accessTokenExpiry = null;
      
      // Clear localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('accessTokenExpiry');
      
      // Clear auth header
      delete axios.defaults.headers.common['Authorization'];
      
      // Show notification
      const notificationStore = useNotificationStore();
      notificationStore.showNotification({
        type: 'info',
        message: 'You have been logged out',
        icon: 'logout'
      });
      
      // Redirect to login page if needed
      if (redirect && this.router) {
        this.router.push('/login');
      }
    }
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}