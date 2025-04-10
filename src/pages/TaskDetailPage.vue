<template>
  <q-page class="q-pa-md">
    <div class="row q-mb-md">
      <div class="col-12">
        <q-btn icon="arrow_back" flat round dense @click="$router.back()" />
        <h4 class="q-my-md inline-block">Task Details</h4>
      </div>
    </div>

    <div v-if="taskStore.loading">
      <q-card style="height: 300px">
        <q-card-section class="flex flex-center">
          <q-spinner size="50px" color="primary" />
        </q-card-section>
      </q-card>
    </div>

    <div v-else-if="taskStore.error">
      <q-card>
        <q-card-section>
          <div class="text-h6 text-negative">Error Loading Task</div>
          <p>{{ taskStore.error }}</p>
          <q-btn color="primary" label="Try Again" @click="loadTask" />
        </q-card-section>
      </q-card>
    </div>

    <div v-else-if="taskStore.currentTask">
      <q-card>
        <q-card-section>
          <div class="row items-center">
            <div class="col">
              <div class="text-h5">{{ taskStore.currentTask.title }}</div>
            </div>
            <div class="col-auto">
              <q-chip 
                :color="taskStore.currentTask.priority === 0 ? 'grey-4' : taskStore.currentTask.priority === 1 ? 'orange' : 'red'"
                :text-color="taskStore.currentTask.priority === 0 ? 'black' : 'white'"
                outline
              >
                {{
                  taskStore.currentTask.priority === 0
                    ? 'Normal'
                    : taskStore.currentTask.priority === 1
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
                  <p v-if="taskStore.currentTask.description" class="q-mt-sm">{{ taskStore.currentTask.description }}</p>
                  <p v-else class="text-grey-7 q-mt-sm">No description provided</p>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-md-4">
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-subtitle2">Status</div>
                  <div class="q-mt-sm">
                    <q-badge :color="taskStore.currentTask.is_completed ? 'positive' : 'warning'" class="q-py-sm q-px-md">
                      {{ taskStore.currentTask.is_completed ? 'Completed' : 'Pending' }}
                    </q-badge>
                  </div>
                </q-card-section>
              </q-card>

              <q-card flat bordered class="q-mt-md">
                <q-card-section>
                  <div class="text-subtitle2">Due Date</div>
                  <div class="q-mt-sm">
                    <q-chip v-if="taskStore.currentTask.due_date" icon="event" :color="isOverdue ? 'negative' : 'primary'" text-color="white">
                      {{ formatDate(taskStore.currentTask.due_date) }}
                    </q-chip>
                    <span v-else class="text-grey-7">No due date set</span>
                  </div>
                </q-card-section>
              </q-card>

              <q-card flat bordered class="q-mt-md">
                <q-card-section>
                  <div class="text-subtitle2">Created</div>
                  <div class="q-mt-sm text-grey-8">
                    {{ formatDateWithTime(taskStore.currentTask.created_at) || 'Unknown' }}
                  </div>
                </q-card-section>
              </q-card>

              <q-card flat bordered class="q-mt-md" v-if="taskStore.currentTask.completed_at">
                <q-card-section>
                  <div class="text-subtitle2">Completed</div>
                  <div class="q-mt-sm text-grey-8">
                    {{ formatDateWithTime(taskStore.currentTask.completed_at) }}
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn 
            :color="taskStore.currentTask.is_completed ? 'negative' : 'positive'" 
            :icon="taskStore.currentTask.is_completed ? 'restart_alt' : 'check'" 
            :label="taskStore.currentTask.is_completed ? 'Mark as Incomplete' : 'Mark as Complete'"
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
import { format, parseISO, isPast } from 'date-fns'
import { useTaskStore } from '@/stores/task'

const route = useRoute()
const router = useRouter()
const taskStore = useTaskStore()

// State
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
  if (!taskStore.currentTask?.due_date || taskStore.currentTask?.is_completed) return false
  return isPast(new Date(taskStore.currentTask.due_date))
})

// Lifecycle hooks
onMounted(() => {
  loadTask()
})

// Methods
async function loadTask() {
  const taskId = route.params.id
  if (taskId) {
    await taskStore.fetchTaskById(taskId)
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
  editingTask.value = { ...taskStore.currentTask }
  editDialog.value = true
}

async function saveTask() {
  await taskStore.updateTask(taskStore.currentTask.entity_id, editingTask.value)
  editDialog.value = false
}

async function toggleTaskStatus() {
  await taskStore.toggleTask(taskStore.currentTask.entity_id)
}

function confirmDelete() {
  deleteDialog.value = true
}

async function deleteTask() {
  const success = await taskStore.deleteTask(taskStore.currentTask.entity_id)
  if (success) {
    // Navigate back to tasks list
    router.push('/tasks')
  }
}
</script>