<template>
  <div>
    <!-- Task Actions Bar -->
    <div class="row q-mb-md items-center">
      <div class="col-12 col-md-6 q-mb-sm">
        <div class="row items-center">
          <q-btn-toggle
            v-model="activeFilter"
            toggle-color="primary"
            :options="[
              { label: 'All', value: 'all' },
              { label: 'Pending', value: 'incomplete' },
              { label: 'Completed', value: 'completed' }
            ]"
            @update:model-value="filterTasks"
            unelevated
            class="q-mr-sm"
          />
          
          <q-btn 
            color="positive" 
            icon="add" 
            label="New Task" 
            @click="showAddDialog = true"
            unelevated
          />
        </div>
      </div>
      
      <div class="col-12 col-md-6">
        <q-input
          v-model="searchQuery"
          outlined
          dense
          placeholder="Search tasks..."
          class="q-ml-md-auto"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
          <template v-slot:append v-if="searchQuery">
            <q-icon name="close" class="cursor-pointer" @click="searchQuery = ''" />
          </template>
        </q-input>
      </div>
    </div>
    
    <!-- Loading State -->
    <div v-if="taskStore.loading" class="q-pa-md text-center">
      <q-spinner color="primary" size="3em" />
      <div class="q-mt-sm">Loading tasks...</div>
    </div>
    
    <!-- Error State -->
    <div v-else-if="taskStore.error" class="q-pa-md">
      <q-banner class="bg-negative text-white">
        <template v-slot:avatar>
          <q-icon name="error" />
        </template>
        {{ taskStore.error }}
        <template v-slot:action>
          <q-btn flat label="Retry" @click="loadTasks()" />
        </template>
      </q-banner>
    </div>
    
    <!-- Empty State -->
    <div v-else-if="filteredTasks.length === 0" class="q-pa-xl text-center">
      <q-icon name="task" size="5em" color="grey-4" />
      <div class="text-h6 q-mt-md text-grey-7">No Tasks Found</div>
      <p class="text-grey-6">
        {{ searchQuery ? 'No tasks match your search criteria.' : 'You have no tasks yet. Create your first task to get started!' }}
      </p>
      <q-btn color="primary" icon="add" label="Create New Task" @click="showAddDialog = true" class="q-mt-sm" />
    </div>
    
    <!-- Task List -->
    <div v-else>
      <q-list separator>
        <q-item
          v-for="task in filteredTasks"
          :key="task.entity_id"
          clickable
          v-ripple
          @click="viewTask(task)"
          class="q-py-md"
        >
          <q-item-section avatar>
            <q-checkbox
              v-model="task.is_completed"
              @click.stop
              @update:model-value="toggleTask(task)"
              color="primary"
            />
          </q-item-section>

          <q-item-section>
            <q-item-label :class="{ 'text-strike': task.is_completed }">
              {{ task.title }}
            </q-item-label>
            <q-item-label caption v-if="task.description" class="q-mt-xs text-grey-6">
              {{ task.description.length > 60 ? task.description.slice(0, 60) + '...' : task.description }}
            </q-item-label>
            <q-item-label caption v-if="task.due_date" class="q-mt-xs">
              <q-icon name="event" size="xs" color="grey-6" />
              <span class="q-ml-xs">{{ formatDate(task.due_date) }}</span>
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-chip
              dense
              outline
              :color="task.priority === 0 ? 'grey-6' : task.priority === 1 ? 'warning' : 'negative'"
              :text-color="task.priority === 0 ? 'grey-7' : ''"
              class="q-px-sm"
            >
              {{ task.priority === 0 ? 'Normal' : task.priority === 1 ? 'High' : 'Urgent' }}
            </q-chip>
          </q-item-section>
          
          <q-item-section side>
            <div class="row">
              <q-btn flat round dense icon="edit" color="primary" @click.stop="editTask(task)">
                <q-tooltip>Edit Task</q-tooltip>
              </q-btn>
              <q-btn flat round dense icon="delete" color="negative" @click.stop="confirmDelete(task)">
                <q-tooltip>Delete Task</q-tooltip>
              </q-btn>
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
    
    <!-- Add/Edit Task Dialog -->
    <q-dialog v-model="showTaskDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ editingTask.entity_id ? 'Edit Task' : 'Add New Task' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="saveTask" class="q-gutter-md">
            <q-input 
              v-model="editingTask.title" 
              label="Task Title *" 
              :rules="[val => !!val || 'Title is required']" 
              outlined
            />
            
            <q-input 
              v-model="editingTask.description" 
              label="Description" 
              type="textarea" 
              outlined
            />
            
            <q-input 
              v-model="editingTask.due_date" 
              label="Due Date" 
              outlined
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="editingTask.due_date" mask="YYYY-MM-DD" />
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
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn flat label="Save" color="primary" @click="saveTask" :loading="saving" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="showDeleteDialog">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="delete" color="negative" text-color="white" />
          <span class="q-ml-sm">Are you sure you want to delete this task?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Delete" color="negative" @click="deleteTask" v-close-popup :loading="deleting" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { format, parseISO } from 'date-fns'
import { useTaskStore } from '@/stores/task'

const router = useRouter()
const route = useRoute()
const taskStore = useTaskStore()

// State
const showAddDialog = ref(false)
const showTaskDialog = ref(false)
const showDeleteDialog = ref(false)
const editingTask = ref({
  title: '',
  description: '',
  due_date: '',
  priority: 0,
  is_completed: false
})
const taskToDelete = ref(null)
const activeFilter = ref('all')
const searchQuery = ref('')
const saving = ref(false)
const deleting = ref(false)

// Priority options
const priorityOptions = [
  { label: 'Normal', value: 0 },
  { label: 'High', value: 1 },
  { label: 'Urgent', value: 2 }
]

// Computed properties
const filteredTasks = computed(() => {
  let tasks = [...taskStore.tasks]
  
  // Apply search filter if query exists
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    tasks = tasks.filter(task => 
      task.title.toLowerCase().includes(query) || 
      (task.description && task.description.toLowerCase().includes(query))
    )
  }
  
  return tasks
})

// Watch for route query changes
watch(() => route.query, (newQuery) => {
  // Handle filter from route
  if (newQuery.filter) {
    activeFilter.value = newQuery.filter
    filterTasks(newQuery.filter)
  }
  
  // Handle create action from route
  if (newQuery.action === 'create') {
    showAddDialog.value = true
  }
}, { immediate: true })

// Watch for showAddDialog changes
watch(showAddDialog, (newVal) => {
  if (newVal) {
    // Reset editing task and show dialog
    editingTask.value = {
      title: '',
      description: '',
      due_date: '',
      priority: 0,
      is_completed: false
    }
    showTaskDialog.value = true
  }
})

// Lifecycle hooks
onMounted(() => {
  loadTasks()
})

// Methods
async function loadTasks() {
  await taskStore.fetchTasks(activeFilter.value)
}

function formatDate(dateString) {
  if (!dateString) return ''
  try {
    return format(parseISO(dateString), 'MMM d, yyyy')
  } catch {
    return dateString
  }
}

function filterTasks(filter) {
  activeFilter.value = filter
  loadTasks()
  
  // Update route query
  router.replace({ query: { ...route.query, filter } })
}

function viewTask(task) {
  router.push(`/tasks/${task.entity_id}`)
}

async function toggleTask(task) {
  await taskStore.toggleTask(task.entity_id)
}

function editTask(task) {
  editingTask.value = { ...task }
  showTaskDialog.value = true
}

function confirmDelete(task) {
  taskToDelete.value = task
  showDeleteDialog.value = true
}

async function saveTask() {
  if (!editingTask.value.title) return
  
  saving.value = true
  
  try {
    if (editingTask.value.entity_id) {
      // Update existing task
      await taskStore.updateTask(editingTask.value.entity_id, editingTask.value)
    } else {
      // Create new task
      await taskStore.createTask(editingTask.value)
    }
    
    // Close dialog
    showTaskDialog.value = false
    
    // Clear route query
    if (route.query.action === 'create') {
      router.replace({ query: { filter: activeFilter.value } })
    }
  } finally {
    saving.value = false
  }
}

async function deleteTask() {
  if (!taskToDelete.value) return
  
  deleting.value = true
  
  try {
    await taskStore.deleteTask(taskToDelete.value.entity_id)
    taskToDelete.value = null
  } finally {
    deleting.value = false
  }
}
</script>

<style lang="scss" scoped>
.text-strike {
  text-decoration: line-through;
  color: #aaa;
}

@media (min-width: 768px) {
  .q-ml-md-auto {
    margin-left: auto;
  }
}
</style>