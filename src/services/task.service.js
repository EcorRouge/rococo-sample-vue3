// src/services/task.service.js
import apiClient from '@/config/axios';
import { Notify } from 'quasar';

// Endpoint for tasks
const API_ENDPOINT = '/tasks/';

const taskService = {
  async getTasks(filter = 'all') {
    try {
      const response = await apiClient.get(API_ENDPOINT, {
        params: { filter }
      });
      if (response.data.success) {
        return response.data.tasks || [];
      } else {
        Notify.create({
          message: response.data.message || 'Failed to fetch tasks',
          color: 'negative'
        });
        return [];
      }
    } catch (error) {
      Notify.create({ message: 'Error fetching tasks', color: 'negative' });
      console.error('Error fetching tasks:', error);
      return [];
    }
  },

  async getTaskById(taskId) {
    try {
      const response = await apiClient.get(`${API_ENDPOINT}${taskId}`);
      if (response.data.success) {
        return response.data.task;
      } else {
        Notify.create({
          message: response.data.message || 'Failed to fetch task',
          color: 'negative'
        });
        return null;
      }
    } catch (error) {
      Notify.create({ message: 'Error fetching task', color: 'negative' });
      console.error(`Error fetching task ${taskId}:`, error);
      return null;
    }
  },

  async createTask(taskData) {
    try {
      const response = await apiClient.post(API_ENDPOINT, taskData);
      if (response.data.success) {
        Notify.create({
          message: 'Task created successfully',
          color: 'positive'
        });
        return response.data.task;
      } else {
        Notify.create({
          message: response.data.message || 'Failed to create task',
          color: 'negative'
        });
        return null;
      }
    } catch (error) {
      Notify.create({ message: 'Error creating task', color: 'negative' });
      console.error('Error creating task:', error);
      return null;
    }
  },

  async updateTask(taskId, taskData) {
    try {
      const response = await apiClient.put(`${API_ENDPOINT}${taskId}`, taskData);
      if (response.data.success) {
        Notify.create({
          message: 'Task updated successfully',
          color: 'positive'
        });
        return response.data.task;
      } else {
        Notify.create({
          message: response.data.message || 'Failed to update task',
          color: 'negative'
        });
        return null;
      }
    } catch (error) {
      Notify.create({ message: 'Error updating task', color: 'negative' });
      console.error(`Error updating task ${taskId}:`, error);
      return null;
    }
  },

  async deleteTask(taskId) {
    try {
      const response = await apiClient.delete(`${API_ENDPOINT}${taskId}`);
      if (response.data.success) {
        Notify.create({
          message: 'Task deleted successfully',
          color: 'positive'
        });
        return true;
      } else {
        Notify.create({
          message: response.data.message || 'Failed to delete task',
          color: 'negative'
        });
        return false;
      }
    } catch (error) {
      Notify.create({ message: 'Error deleting task', color: 'negative' });
      console.error(`Error deleting task ${taskId}:`, error);
      return false;
    }
  },

  async toggleTask(taskId) {
    try {
      const response = await apiClient.post(`${API_ENDPOINT}${taskId}/toggle`);
      if (response.data.success) {
        Notify.create({
          message: 'Task status updated',
          color: 'positive'
        });
        return response.data.task;
      } else {
        Notify.create({
          message: response.data.message || 'Failed to update task status',
          color: 'negative'
        });
        return null;
      }
    } catch (error) {
      Notify.create({ message: 'Error toggling task status', color: 'negative' });
      console.error(`Error toggling task ${taskId}:`, error);
      return null;
    }
  }
};

export default taskService;