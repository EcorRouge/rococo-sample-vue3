<template>
  <div>
    <!-- Task Header Section -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row items-center">
          <div class="col">
            <div class="text-h6 text-weight-bold">My Tasks</div>
            <p class="text-grey-7 q-mb-sm q-mt-xs">Manage and organize your tasks</p>
          </div>
          <div class="col-auto">
            <q-btn 
              color="primary" 
              icon="add" 
              label="New Task" 
              @click="showTaskDialog()" 
              class="q-px-sm q-py-xs"
              unelevated
            />
          </div>
        </div>
        
        <div class="row items-center q-mt-md">
          <div class="col">
            <q-btn-toggle
              v-model="filter"
              spread
              unelevated
              toggle-color="primary"
              color="grey-3"
              text-color="grey-8"
              :options="[
                { label: 'All Tasks', value: 'all' },
                { label: 'Incomplete', value: 'incomplete' },
                { label: 'Completed', value: 'completed' }
              ]"
              @update:model-value="loadTasks"
              class="q-mb-sm full-width"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Loading State -->
    <div v-if="loading" class="q-pa-xl flex flex-center">
      <q-spinner color="primary" size="48px" />
    </div>

    <!-- Empty State -->
    <q-card v-else-if="tasks.length === 0" class="text-center q-pa-lg">
      <q-card-section>
        <q-icon name="inventory_2" size="64px" color="grey-4" />
        <div class="text-h6 q-mt-md">No tasks found</div>
        <p class="text-grey-7">
          {{ emptyStateMessage }}
        </p>
        <q-btn 
          color="primary" 
          label="Create your first task" 
          icon="add" 
          @click="showTaskDialog()" 
          class="q-mt-sm"
          unelevated
        />
      </q-card-section>
    </q-card>

    <!-- Task List -->
    <q-card v-else>
      <q-list separator>
        <q-item 
          v-for="task in tasks" 
          :key="task.entity_id" 
          class="q-py-md task-item"
          clickable
          v-ripple
          @click="viewTask(task)"
        >
          <q-item-section avatar>
            <q-checkbox 
              v-model="task.is_completed" 
              @update:model-value="toggleTask(task)" 
              @click.stop 
              color="primary"
            />
          </q-item-section>

          <q-item-section>
            <q-item-label :class="{ 'text-strike': task.is_completed }">
              {{ task.title }}
            </q-item-label>
            <q-item-label caption v-if="task.description" class="q-mt-xs">
              {{ task.description.length > 60 ? task.description.slice(0, 60) + '...' : task.description }}
            </q-item-label>
            <div class="row q-mt-sm">
              <q-chip 
                v-if="task.due_date" 
                dense 
                outline 
                size="sm" 
                icon="event" 
                :color="isTaskOverdue(task) ? 'negative' : 'grey-7'"
                class="q-px-sm"
              >
                {{ formatDate(task.due_date) }}
              </q-chip>
              <q-chip 
                dense 
                outline 
                size="sm" 
                :color="task.priority === 0 ? 'grey-7' : task.priority === 1 ? 'warning' : 'negative'"
                class="q-px-sm"
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
          </q-item-section>

          <q-item-section side>
            <div class="row items-center">
              <q-btn 
                flat 
                round 
                dense 
                icon="edit" 
                color="primary" 
                @click.stop="showTaskDialog(task)" 
              />
              <q-btn 
                flat 
                round 
                dense 
                icon="delete" 
                color="negative" 
                @click.stop="confirmDelete(task)" 
              />
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>

    <!-- Task Form Dialog -->
    <q-dialog v-model="taskDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">{{ editingTask.entity_id ? 'Edit Task' : 'New Task' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit="saveTask" class="q-gutter-md">
            <q-input 
              v-model="editingTask.title" 
              label="Title *" 
              :rules="[val => !!val || 'Title is required']"
              outlined
              autofocus
              stack-label
            />
            
            <q-input 
              v-model="editingTask.description" 
              label="Description" 
              type="textarea" 
              outlined
              stack-label
              autogrow
            />
            
            <q-input 
              v-model="editingTask.due_date" 
              label="Due Date" 
              outlined
              stack-label
              :rules="[dateValidator]"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date 
                      v-model="editingTask.due_date" 
                      mask="YYYY-MM-DDTHH:mm:ss" 
                      color="primary"
                    />
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
              outlined
              stack-label
            />

            <div class="row justify-end q-mt-md">
              <q-btn 
                label="Cancel" 
                color="grey-7" 
                v-close-popup 
                flat
                class="q-mx-sm"
              />
              <q-btn 
                label="Save" 
                type="submit" 
                color="primary" 
                unelevated
              />
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
          <span class="q-ml-sm text-body1">Are you sure you want to delete this task?</span>
        </q-card-section>

        <q-card-section class="text-grey-7 q-pt-none">
          This action cannot be undone.
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Delete" color="negative" @click="deleteTask" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter, useRoute } from 'vue-router'
import { format, parseISO, isAfter, startOfDay } from 'date-fns'
import taskService from '@/services/task.service'

const $q = useQuasar()
const router = useRouter()
const route = useRoute()

// State
const tasks = ref([])
const filter = ref('all')
const taskDialog = ref(false)
const deleteDialog = ref(false)
const taskToDelete = ref(null)
const loading = ref(true)
const editingTask = ref({
  title: '',
  description: '',
  due_date: null,
  priority: 0,
  is_completed: false
})

// Priority options with colors
const priorityOptions = [
  { label: 'Normal', value: 0, color: 'grey-7' },
  { label: 'High', value: 1, color: 'warning' },
  { label: 'Urgent', value: 2, color: 'negative' }
]

// Computed
const emptyStateMessage = computed(() => {
  if (filter.value === 'all') return 'You have no tasks yet. Create one to get started!';
  if (filter.value === 'incomplete') return 'Great job! You have no incomplete tasks.';
  return 'You have no completed tasks yet. Mark tasks as complete to see them here.';
});

// Watch for query parameters
watch(() => route.query, (newQuery) => {
  if (newQuery.filter) {
    filter.value = newQuery.filter;
    loadTasks();
  }
  
  if (newQuery.action === 'create') {
    showTaskDialog();
  }
}, { immediate: true });

// Load tasks on component mount
onMounted(() => {
  if (!route.query.filter) {
    loadTasks();
  }
})

// Load tasks based on filter
async function loadTasks() {
  loading.value = true;
  try {
    tasks.value = await taskService.getTasks(filter.value);
    
    // Sort by priority (highest first) and due date (earliest first)
    tasks.value.sort((a, b) => {
      // First by completion status
      if (a.is_completed !== b.is_completed) {
        return a.is_completed ? 1 : -1;
      }
      
      // Then by priority (higher priority first)
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      
      // Then by due date (if exists)
      if (a.due_date && b.due_date) {
        return new Date(a.due_date) - new Date(b.due_date);
      }
      
      // Tasks with due dates come before those without
      if (a.due_date && !b.due_date) return -1;
      if (!a.due_date && b.due_date) return 1;
      
      // Finally by creation date (newest first)
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });
    
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Failed to load tasks: ' + (error.message || 'Unknown error'),
      icon: 'error',
      position: 'top'
    })
  } finally {
    loading.value = false;
  }
}

// Format date for display
function formatDate(dateString) {
  if (!dateString) return '';
  try {
    return format(parseISO(dateString), 'MMM d, yyyy');
  } catch {
    return dateString;
  }
}

// Check if task is overdue
function isTaskOverdue(task) {
  if (!task.due_date || task.is_completed) return false;
  const today = startOfDay(new Date());
  const dueDate = startOfDay(parseISO(task.due_date));
  return isAfter(today, dueDate);
}

// Validate date format
function dateValidator(value) {
  if (!value) return true;
  const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
  return regex.test(value) || 'Invalid date format (YYYY-MM-DDTHH:mm:ss)';
}

// View task detail
function viewTask(task) {
  router.push(`/tasks/${task.entity_id}`);
}

// Open task dialog for create/edit
function showTaskDialog(task = null) {
  if (task) {
    // Clone task for editing to avoid modifying the original object
    editingTask.value = { ...task };
  } else {
    // Reset form for new task
    editingTask.value = {
      title: '',
      description: '',
      due_date: null,
      priority: 0,
      is_completed: false
    };
  }
  taskDialog.value = true;
}

// Save task (create or update)
async function saveTask() {
  try {
    if (editingTask.value.entity_id) {
      // Update existing task
      await taskService.updateTask(editingTask.value.entity_id, editingTask.value);
    } else {
      // Create new task
      await taskService.createTask(editingTask.value);
    }
    taskDialog.value = false;
    
    // Clear the create action from URL if present
    if (route.query.action === 'create') {
      router.replace({ query: { ...route.query, action: undefined }});
    }
    
    loadTasks();
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Failed to save task: ' + (error.message || 'Unknown error'),
      icon: 'error'
    });
  }
}

// Toggle task completion status
async function toggleTask(task) {
  try {
    await taskService.toggleTask(task.entity_id);    
    loadTasks(); // Reload to get updated task data
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Failed to update task status: ' + (error.message || 'Unknown error'),
      icon: 'error'
    });
    // Revert checkbox state if API call fails
    task.is_completed = !task.is_completed;
  }
}

// Show delete confirmation dialog
function confirmDelete(task) {
  taskToDelete.value = task;
  deleteDialog.value = true;
}

// Delete task
async function deleteTask() {
  if (!taskToDelete.value) return;

  try {
    await taskService.deleteTask(taskToDelete.value.entity_id);
    loadTasks();
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Failed to delete task: ' + (error.message || 'Unknown error'),
      icon: 'error'
    });
  }
}
</script>

<style lang="scss" scoped>
.task-item {
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }
}

.text-strike {
  text-decoration: line-through;
  color: $grey-5;
}
</style>