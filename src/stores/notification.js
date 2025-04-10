import { defineStore, acceptHMRUpdate } from 'pinia'
import { Notify } from 'quasar'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: []
  }),

  actions: {
    /**
     * Show a notification
     * @param {Object} notification - Notification config
     * @param {string} notification.type - Notification type (positive, negative, warning, info)
     * @param {string} notification.message - Notification message
     * @param {string} [notification.icon] - Notification icon
     * @param {string} [notification.position='top'] - Notification position
     * @param {number} [notification.timeout=3000] - Notification timeout in ms
     */
    showNotification({ type, message, icon, position = 'top', timeout = 3000 }) {
      // Add to notification history if needed
      this.notifications.push({
        type,
        message,
        timestamp: new Date(),
        id: Date.now().toString()
      })
      
      // Limit the history size
      if (this.notifications.length > 20) {
        this.notifications.shift()
      }
      
      // Show notification using Quasar's Notify
      Notify.create({
        type,
        message,
        icon,
        position,
        timeout
      })
    },
    
    clearNotifications() {
      this.notifications = []
    }
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useNotificationStore, import.meta.hot))
}