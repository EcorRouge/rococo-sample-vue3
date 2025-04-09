<template>
    <q-page class="q-pa-md">
      <div class="row q-mb-md">
        <div class="col-12">
          <q-btn icon="arrow_back" flat round dense @click="$router.back()" />
          <h4 class="q-my-md inline-block">Task Details</h4>
        </div>
      </div>
  
      <div v-if="loading">
        <q-card style="height: 300px">
          <q-card-section class="flex flex-center">
            <q-spinner size="50px" color="primary" />
          </q-card-section>
        </q-card>
      </div>
  
      <div v-else-if="error">
        <q-card>
          <q-card-section>
            <div class="text-h6 text-negative">Error Loading Task</div>
            <p>{{ error }}</p>
            <q-btn color="primary" label="Try Again" @click="loadTask" />
          </q-card-section>
        </q-card>
      </div>
  
      <div v-else>
        <q-card>
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-h5">{{ task.title }}</div>
              </div>
              <div class="col-auto">
                <q-chip 
                  :color="task.priority === 0 ? 'grey-4' : task.priority === 1 ? 'orange' : 'red'"
                  :text-color="task.priority === 0 ? 'black' : 'white'"
                  outline
                >
                  {{
                    task.priority === 0
                      ? 'Normal'
                      : task.priority === 1
                      ? 'High'
                      : 'Urgent'
                  }}
                </q-chip>
              </div>
            </div>
          </q-card-section>
  
          <q-separator />
  
          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-8">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-subtitle2">Description</div>
                    <p v-if="task.description" class="q-mt-sm">{{ task.description }}</p>
                    <p v-else class="text-grey-7 q-mt-sm">No description provided</p>
                  </q-card-section>
                </q-card>
              </div>
  
              <div class="col-12 col-md-4">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-subtitle2">Status</div>
                    <div class="q-mt-sm">
                      <q-badge :color="task.is_completed ? 'positive' : 'warning'" class="q-py-sm q-px-md">
                        {{ task.is_completed ? 'Completed' : 'Pending' }}
                      </q-badge>
                    </div>
                  </q-card-section>
                </q-card>
  
                <q-card flat bordered class="q-mt-md">
                  <q-card-section>
                    <div class="text-subtitle2">Due Date</div>
                    <div class="q-mt-sm">
                      <q-chip v-if="task.due_date" icon="event" :color="isOverdue ? 'negative' : 'primary'" text-color="white">
                        {{ formatDate(task.due_date) }}
                      </q-chip>
                      <span v-else class="text-grey-7">No due date set</span>
                    </div>
                  </q-card-section>
                </q-card>
  
                <q-card flat bordered class="q-mt-md">
                  <q-card-section>
                    <div class="text-subtitle2">Created</div>
                    <div class="q-mt-sm text-grey-8">
                      {{ formatDateWithTime(task.created_at) || 'Unknown' }}
                    </div>
                  </q-card-section>
                </q-card>
  
                <q-card flat bordered class="q-mt-md" v-if="task.completed_at">
                  <q-card-section>
                    <div class="text-subtitle2">Completed</div>
                    <div class="q-mt-sm text-grey-8">
                      {{ formatDateWithTime(task.completed_at) }}
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-card-section>
  
          <q-separator />
  
          <q-card-actions align="right">
            <q-btn 
              :color="task.is_completed ? 'negative' : 'positive'" 
              :icon="task.is_completed ? 'restart_alt' : 'check'" 
              :label="task.is_completed ? 'Mark as Incomplete' : 'Mark as Complete'"
              @click="toggleTaskStatus" 
            />
            <q-btn color="primary" icon="edit" label="Edit" @click="showEditDialog" />
            <q-btn color="negative" icon="delete" label="Delete" @click="confirmDelete" />
          </q-card-actions>
        </q-card>
      </div>
  
      <!-- Edit Task Dialog -->
      <q-dialog v-model="editDialog" persistent>
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">Edit Task</div>
          </q-card-section>
  
          <q-card-section class="q-pt-none">
            <q-form @submit="saveTask" class="q-gutter-md">
              <q-input v-model="editingTask.title" label="Title *" :rules="[val => !!val || 'Title is required']" />
              
              <q-input v-model="editingTask.description" label="Description" type="textarea" />
              
              <q-input v-model="editingTask.due_date" label="Due Date">
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="editingTask.due_date" mask="YYYY-MM-DDTHH:mm:ss" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
              
              <q-select
                v-model="editingTask.priority"
                :options="priorityOptions"
                label="Priority"
                emit-value
                map-options
              />
  
              <div class="q-mt-md">
                <q-btn label="Cancel" color="grey-7" v-close-popup />
                <q-btn label="Save" type="submit" color="primary" class="q-ml-sm" />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-dialog>
  
      <!-- Delete Confirmation Dialog -->
      <q-dialog v-model="deleteDialog">
        <q-card>
          <q-card-section class="row items-center">
            <q-avatar icon="delete" color="negative" text-color="white" />
            <span class="q-ml-sm">Are you sure you want to delete this task?</span>
          </q-card-section>
  
          <q-card-actions align="right">
            <q-btn flat label="Cancel" color="primary" v-close-popup />
            <q-btn flat label="Delete" color="negative" @click="deleteTask" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-page>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useQuasar } from 'quasar'
  import { format, parseISO, isPast } from 'date-fns'
  import taskService from '@/services/task.service'
  
  const route = useRoute()
  const router = useRouter()
  const $q = useQuasar()
  
  // State
  const task = ref({})
  const loading = ref(true)
  const error = ref(null)
  const editDialog = ref(false)
  const deleteDialog = ref(false)
  const editingTask = ref({})
  
  // Priority options
  const priorityOptions = [
    { label: 'Normal', value: 0 },
    { label: 'High', value: 1 },
    { label: 'Urgent', value: 2 }
  ]
  
  // Computed properties
  const isOverdue = computed(() => {
    if (!task.value.due_date || task.value.is_completed) return false
    return isPast(new Date(task.value.due_date))
  })
  
  // Lifecycle hooks
  onMounted(() => {
    loadTask()
  })
  
  // Methods
  async function loadTask() {
    const taskId = route.params.id
    if (!taskId) {
      error.value = 'No task ID provided'
      loading.value = false
      return
    }
  
    loading.value = true
    error.value = null
  
    try {
      const response = await taskService.getTaskById(taskId)
      task.value = response
    } catch (err) {
      error.value = err.message || 'Failed to load task'
      console.error(err)
    } finally {
      loading.value = false
    }
  }
  
  function formatDate(dateString) {
    if (!dateString) return ''
    try {
      return format(parseISO(dateString), 'MMM d, yyyy')
    } catch {
      return dateString
    }
  }
  
  function formatDateWithTime(dateString) {
    if (!dateString) return ''
    try {
      return format(parseISO(dateString), 'MMM d, yyyy h:mm a')
    } catch {
      return dateString
    }
  }
  
  function showEditDialog() {
    // Clone the task to avoid modifying the original data until save
    editingTask.value = { ...task.value }
    editDialog.value = true
  }
  
  async function saveTask() {
    try {
      const updatedTask = await taskService.updateTask(task.value.entity_id, editingTask.value)
      task.value = updatedTask
      editDialog.value = false
      
      $q.notify({
        type: 'positive',
        message: 'Task updated successfully'
      })
    } catch (err) {
      $q.notify({
        type: 'negative',
        message: 'Failed to update task: ' + (err.message || 'Unknown error')
      })
    }
  }
  
  async function toggleTaskStatus() {
    try {
      const updatedTask = await taskService.toggleTask(task.value.entity_id)
      task.value = updatedTask
      
      $q.notify({
        type: 'positive',
        message: `Task marked as ${task.value.is_completed ? 'completed' : 'incomplete'}`
      })
    } catch (err) {
      $q.notify({
        type: 'negative',
        message: 'Failed to update task status: ' + (err.message || 'Unknown error')
      })
    }
  }
  
  function confirmDelete() {
    deleteDialog.value = true
  }
  
  async function deleteTask() {
    try {
      await taskService.deleteTask(task.value.entity_id)
      
      $q.notify({
        type: 'positive',
        message: 'Task deleted successfully'
      })
      
      // Navigate back to tasks list
      router.push('/tasks')
    } catch (err) {
      $q.notify({
        type: 'negative',
        message: 'Failed to delete task: ' + (err.message || 'Unknown error')
      })
    }
  }
  </script>