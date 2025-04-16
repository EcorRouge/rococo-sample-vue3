import { defineStore } from 'pinia'
import axios from "config/axios"
export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [], // Array to store the tasks
    loading: false, // Loading state
    error: null // Error state
  }),

  getters: {
    completedTasks: (state) => state.tasks.filter(task => task.completed),
    activeTasks: (state) => state.tasks.filter(task => !task.completed)
  },

  actions: {
    // Fetch tasks from the API
    async getTasks() {
      this.loading = true
      this.error = null

      try {
        const response = await axios.get('/todo/todo') // Replace with your API endpoint
        this.tasks = response.data // Assuming response.data contains the task list
      } catch (error) {
        this.error = error
      } finally {
        this.loading = false
      }
    },

    // Add new task
    async addTask(title) {
      try {
        const response = await axios.post('/todo/todo', { title }) // Replace with your API endpoint
        if (response.status === 201) {
          this.tasks.push({ text: response.data.title, completed: false })
        }
      } catch (error) {
        console.error('Error adding task:', error)
      }
    },

    // Update task completion status
    toggleTaskCompletion(index) {
      this.tasks[index].completed = !this.tasks[index].completed
    },

    // Delete task
    deleteTask(index) {
      this.tasks.splice(index, 1)
    }
  }
})
