import { defineStore, acceptHMRUpdate } from 'pinia'
import taskService from '@/services/task.service'
import { useNotificationStore } from './notification'

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [],
    currentTask: null,
    loading: false,
    error: null
  }),

  getters: {
    // Get all completed tasks
    completedTasks: (state) => state.tasks.filter(task => task.is_completed),

    // Get all incomplete tasks
    incompleteTasks: (state) => state.tasks.filter(task => !task.is_completed),
    
    // Get recent tasks for dashboard (5 most recent)
    recentTasks: (state) => [...state.tasks]
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .slice(0, 5),
    
    // Get total number of tasks
    totalTasks: (state) => state.tasks.length,
    
    // Get number of completed tasks
    totalCompletedTasks: (state) => state.completedTasks.length,
    
    // Get completion rate
    completionRate: (state) => {
      if (state.tasks.length === 0) return 0
      return state.completedTasks.length / state.tasks.length
    },
    
    // Tasks by priority (incomplete only)
    normalPriorityTasks: (state) => 
      state.incompleteTasks.filter(task => task.priority === 0),
    
    highPriorityTasks: (state) => 
      state.incompleteTasks.filter(task => task.priority === 1),
    
    urgentPriorityTasks: (state) => 
      state.incompleteTasks.filter(task => task.priority >= 2),
    
    // Get stats for dashboard
    stats: (state) => ({
      total: state.tasks.length,
      completed: state.completedTasks.length,
      priority: {
        normal: state.normalPriorityTasks.length,
        high: state.highPriorityTasks.length,
        urgent: state.urgentPriorityTasks.length
      }
    })
  },

  actions: {
    // Fetch all tasks
    async fetchTasks(filter = 'all') {
      const notificationStore = useNotificationStore()
      this.loading = true
      this.error = null
      
      try {
        const tasks = await taskService.getTasks(filter)
        this.tasks = tasks
        return tasks
      } catch (error) {
        this.error = error.message || 'Failed to fetch tasks'
        notificationStore.showNotification({
          type: 'negative',
          message: this.error,
          icon: 'error'
        })
        return []
      } finally {
        this.loading = false
      }
    },
    
    // Fetch a single task by ID
    async fetchTaskById(taskId) {
      const notificationStore = useNotificationStore()
      this.loading = true
      this.error = null
      
      try {
        const task = await taskService.getTaskById(taskId)
        this.currentTask = task
        return task
      } catch (error) {
        this.error = error.message || `Failed to fetch task ${taskId}`
        notificationStore.showNotification({
          type: 'negative',
          message: this.error,
          icon: 'error'
        })
        return null
      } finally {
        this.loading = false
      }
    },
    
    // Create a new task
    async createTask(taskData) {
      const notificationStore = useNotificationStore()
      this.loading = true
      this.error = null
      
      try {
        const task = await taskService.createTask(taskData)
        
        if (task) {
          this.tasks.push(task)
          notificationStore.showNotification({
            type: 'positive',
            message: 'Task created successfully',
            icon: 'check_circle'
          })
        }
        
        return task
      } catch (error) {
        this.error = error.message || 'Failed to create task'
        notificationStore.showNotification({
          type: 'negative',
          message: this.error,
          icon: 'error'
        })
        return null
      } finally {
        this.loading = false
      }
    },
    
    // Update an existing task
    async updateTask(taskId, taskData) {
      const notificationStore = useNotificationStore()
      this.loading = true
      this.error = null
      
      try {
        const updatedTask = await taskService.updateTask(taskId, taskData)
        
        if (updatedTask) {
          // Update in tasks array
          const index = this.tasks.findIndex(t => t.entity_id === taskId)
          if (index !== -1) {
            this.tasks[index] = updatedTask
          }
          
          // Update current task if it's the same one
          if (this.currentTask && this.currentTask.entity_id === taskId) {
            this.currentTask = updatedTask
          }
          
          notificationStore.showNotification({
            type: 'positive',
            message: 'Task updated successfully',
            icon: 'check_circle'
          })
        }
        
        return updatedTask
      } catch (error) {
        this.error = error.message || `Failed to update task ${taskId}`
        notificationStore.showNotification({
          type: 'negative',
          message: this.error,
          icon: 'error'
        })
        return null
      } finally {
        this.loading = false
      }
    },
    
    // Toggle task completion status
    async toggleTask(taskId) {
      const notificationStore = useNotificationStore()
      this.loading = true
      this.error = null
      
      try {
        const updatedTask = await taskService.toggleTask(taskId)
        
        if (updatedTask) {
          // Update in tasks array
          const index = this.tasks.findIndex(t => t.entity_id === taskId)
          if (index !== -1) {
            this.tasks[index] = updatedTask
          }
          
          // Update current task if it's the same one
          if (this.currentTask && this.currentTask.entity_id === taskId) {
            this.currentTask = updatedTask
          }
          
          notificationStore.showNotification({
            type: 'positive',
            message: `Task marked as ${updatedTask.is_completed ? 'completed' : 'incomplete'}`,
            icon: 'check_circle'
          })
        }
        
        return updatedTask
      } catch (error) {
        this.error = error.message || `Failed to toggle task ${taskId}`
        notificationStore.showNotification({
          type: 'negative',
          message: this.error,
          icon: 'error'
        })
        return null
      } finally {
        this.loading = false
      }
    },
    
    // Delete a task
    async deleteTask(taskId) {
      const notificationStore = useNotificationStore()
      this.loading = true
      this.error = null
      
      try {
        const success = await taskService.deleteTask(taskId)
        
        if (success) {
          // Remove from tasks array
          this.tasks = this.tasks.filter(t => t.entity_id !== taskId)
          
          // Clear current task if it's the same one
          if (this.currentTask && this.currentTask.entity_id === taskId) {
            this.currentTask = null
          }
          
          notificationStore.showNotification({
            type: 'positive',
            message: 'Task deleted successfully',
            icon: 'check_circle'
          })
        }
        
        return success
      } catch (error) {
        this.error = error.message || `Failed to delete task ${taskId}`
        notificationStore.showNotification({
          type: 'negative',
          message: this.error,
          icon: 'error'
        })
        return false
      } finally {
        this.loading = false
      }
    }
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTaskStore, import.meta.hot))
}