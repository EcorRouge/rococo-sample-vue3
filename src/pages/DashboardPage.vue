<template>
  <q-page class="q-py-lg q-px-md">
    <!-- Welcome Dialog -->
    <WelcomeDialog 
      v-model="showWelcomeDialog"
      @completed="onWelcomeCompleted"
    />

    <div class="page-container">
      <!-- Header Section -->
      <div class="row q-mb-xl">
        <div class="col-12">
          <div class="text-h4 text-weight-bold text-primary q-mb-xs">Dashboard</div>
          <p class="text-subtitle1 text-grey-7 q-mb-md">
            Welcome back, <span class="text-weight-bold">{{ authStore.user?.first_name }}</span>!
            <q-icon name="wave" class="q-ml-xs text-warning" />
          </p>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="row q-col-gutter-lg q-mb-lg">
        <!-- Total Tasks Card -->
        <div class="col-12 col-md-4">
          <q-card class="dashboard-card" flat bordered>
            <q-card-section class="q-pa-md">
              <div class="row items-center no-wrap">
                <div class="col">
                  <div class="text-subtitle1 text-grey-6">Total Tasks</div>
                  <div class="text-h3 text-weight-bold">{{ stats.total }}</div>
                </div>
                <div class="col-auto">
                  <q-icon name="task" size="48px" color="primary" class="q-ml-sm" />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Completed Tasks Card -->
        <div class="col-12 col-md-4">
          <q-card class="dashboard-card" flat bordered>
            <q-card-section class="q-pa-md">
              <div class="row items-center no-wrap">
                <div class="col">
                  <div class="text-subtitle1 text-grey-6">Completed</div>
                  <div class="text-h3 text-weight-bold text-positive">{{ stats.completed }}</div>
                </div>
                <div class="col-auto">
                  <q-icon name="check_circle" size="48px" color="positive" class="q-ml-sm" />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Completion Rate Card -->
        <div class="col-12 col-md-4">
          <q-card class="dashboard-card" flat bordered>
            <q-card-section class="q-pa-md">
              <div class="row items-center no-wrap">
                <div class="col">
                  <div class="text-subtitle1 text-grey-6">Completion Rate</div>
                  <div class="text-h3 text-weight-bold text-primary">{{ Math.round(completionRate * 100) }}%</div>
                </div>
                <div class="col-auto">
                  <q-circular-progress
                    :value="completionRate * 100"
                    size="60px"
                    :thickness="0.15"
                    color="primary"
                    track-color="grey-3"
                    class="q-ml-sm"
                  >
                    <q-icon name="insights" size="24px" color="primary" />
                  </q-circular-progress>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Main Content Row -->
      <div class="row q-col-gutter-lg">
        <!-- Task Statistics Section -->
        <div class="col-12 col-lg-8">
          <!-- Recent Tasks -->
          <q-card class="q-mb-lg">
            <q-card-section class="q-pb-none">
              <div class="text-h6 text-weight-bold">Recent Tasks</div>
              <p class="text-grey-7 q-mt-sm">Your most recent tasks are shown below</p>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <q-list separator>
                <q-item
                  v-for="task in recentTasks"
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
                      {{
                        task.priority === 0
                          ? 'Normal'
                          : task.priority === 1
                          ? 'High'
                          : 'Urgent'
                      }}
                    </q-chip>
                  </q-item-section>
                </q-item>

                <q-item v-if="recentTasks.length === 0">
                  <q-item-section class="text-center text-grey-6 q-py-lg">
                    <q-icon name="inventory_2" size="48px" color="grey-4" />
                    <div class="q-mt-sm">No tasks yet. Click "Add New Task" to get started!</div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>

            <q-separator />

            <q-card-actions align="center">
              <q-btn flat color="primary" label="View All Tasks" to="/tasks" class="q-px-md" />
              <q-btn flat color="positive" icon="add" label="Create Task" @click="addNewTask" class="q-px-md" />
            </q-card-actions>
          </q-card>

          <!-- Task Progress -->
          <q-card>
            <q-card-section class="q-pb-none">
              <div class="text-h6 text-weight-bold">Task Completion Progress</div>
              <p class="text-grey-7 q-mt-sm">Your overall progress is shown below</p>
            </q-card-section>

            <q-card-section>
              <div class="text-subtitle1 text-weight-medium q-mb-xs">Overall Progress</div>
              <q-linear-progress
                :value="completionRate"
                size="25px"
                class="q-mb-lg rounded-borders"
                :color="completionRate < 0.3 ? 'negative' : completionRate < 0.7 ? 'warning' : 'positive'"
              >
                <div class="absolute-full flex flex-center">
                  <q-badge :color="completionRate < 0.3 ? 'negative' : completionRate < 0.7 ? 'warning' : 'positive'" class="text-white">
                    {{ Math.round(completionRate * 100) }}% Complete
                  </q-badge>
                </div>
              </q-linear-progress>

              <div class="text-subtitle1 text-weight-medium q-mb-xs q-mt-lg">Tasks by Priority</div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-4">
                  <q-linear-progress
                    :value="stats.priority.normal / Math.max(1, stats.total - stats.completed)"
                    size="10px"
                    class="q-mb-sm rounded-borders"
                    color="grey-6"
                  />
                  <div class="row justify-between items-center">
                    <div class="text-caption text-grey-8">Normal</div>
                    <div class="text-body2 text-grey-8">{{ stats.priority.normal }}</div>
                  </div>
                </div>
                
                <div class="col-12 col-sm-4">
                  <q-linear-progress
                    :value="stats.priority.high / Math.max(1, stats.total - stats.completed)"
                    size="10px"
                    class="q-mb-sm rounded-borders"
                    color="warning"
                  />
                  <div class="row justify-between items-center">
                    <div class="text-caption text-grey-8">High</div>
                    <div class="text-body2 text-grey-8">{{ stats.priority.high }}</div>
                  </div>
                </div>
                
                <div class="col-12 col-sm-4">
                  <q-linear-progress
                    :value="stats.priority.urgent / Math.max(1, stats.total - stats.completed)"
                    size="10px"
                    class="q-mb-sm rounded-borders"
                    color="negative"
                  />
                  <div class="row justify-between items-center">
                    <div class="text-caption text-grey-8">Urgent</div>
                    <div class="text-body2 text-grey-8">{{ stats.priority.urgent }}</div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Sidebar Section -->
        <div class="col-12 col-lg-4">
          <!-- Quick Actions Card -->
          <q-card class="q-mb-lg">
            <q-card-section class="bg-primary text-white">
              <div class="text-h6 text-weight-bold">Quick Actions</div>
            </q-card-section>

            <q-card-section class="q-pa-none">
              <q-list padding>
                <q-item clickable v-ripple @click="addNewTask" class="q-py-md">
                  <q-item-section avatar>
                    <q-icon name="add_task" color="positive" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Add New Task</q-item-label>
                    <q-item-label caption>Create a new task to track</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item clickable v-ripple @click="navigateToTasks('incomplete')" class="q-py-md">
                  <q-item-section avatar>
                    <q-icon name="pending_actions" color="warning" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>View Pending Tasks</q-item-label>
                    <q-item-label caption>Focus on unfinished tasks</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item clickable v-ripple @click="navigateToTasks('completed')" class="q-py-md">
                  <q-item-section avatar>
                    <q-icon name="task_alt" color="positive" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>View Completed Tasks</q-item-label>
                    <q-item-label caption>See what you've accomplished</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>

          <!-- User Profile Card -->
          <q-card>
            <q-card-section class="bg-grey-2">
              <div class="row items-center">
                <q-avatar size="56px" color="primary" text-color="white" class="q-mr-md shadow-3">
                  {{ userInitials }}
                </q-avatar>
                <div>
                  <div class="text-h6 text-weight-bold">{{ authStore.user?.first_name }} {{ authStore.user?.last_name }}</div>
                </div>
              </div>
            </q-card-section>

            <q-card-section>
              <div class="text-subtitle1 text-weight-bold q-mb-sm">Account Summary</div>
              
              <div class="row q-col-gutter-sm">
                <div class="col-6">
                  <q-card flat bordered class="bg-grey-1">
                    <q-card-section class="q-pa-sm text-center">
                      <div class="text-h5 text-primary text-weight-bold">{{ stats.total }}</div>
                      <div class="text-caption">Total Tasks</div>
                    </q-card-section>
                  </q-card>
                </div>
                
                <div class="col-6">
                  <q-card flat bordered class="bg-grey-1">
                    <q-card-section class="q-pa-sm text-center">
                      <div class="text-h5 text-positive text-weight-bold">{{ stats.completed }}</div>
                      <div class="text-caption">Completed</div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </q-card-section>
            
            <q-separator />
            
            <q-card-actions align="center">
              <q-btn flat color="primary" icon="account_circle" label="My Profile" to="/profile" />
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/auth'
import { format, parseISO } from 'date-fns'
import taskService from '@/services/task.service'
import localStorageService from '@/services/localStorage.service'

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()

// State
const recentTasks = ref([])
const showWelcomeDialog = ref(false)
const stats = ref({
  total: 0,
  completed: 0,
  priority: {
    normal: 0,
    high: 0,
    urgent: 0
  }
})

// Computed
const completionRate = computed(() => {
  if (stats.value.total === 0) return 0
  return stats.value.completed / stats.value.total
})

// Computed property to get user initials for avatar
const userInitials = computed(() => {
  if (!authStore.user) return '?';
  return (
    (authStore.user.first_name?.[0] || '') + 
    (authStore.user.last_name?.[0] || '')
  ).toUpperCase();
})

// Lifecycle hooks
onMounted(async () => {
  await loadDashboardData()

  const welcomed = localStorageService.getItem('welcomed')
  if (!welcomed) {
    const user = authStore.user
    if (!user.first_name || !user.last_name || user.first_name.toLowerCase() === 'user' && user.last_name.toLowerCase() === 'user') {
      showWelcomeDialog.value = true
    } else {
      localStorageService.setItem('welcomed', true)
    }
  }
})

// Methods
async function loadDashboardData() {
  try {
    const allTasks = await taskService.getTasks('all')
    const completed = allTasks.filter(t => t.is_completed)
    const incomplete = allTasks.filter(t => !t.is_completed)

    stats.value.total = allTasks.length
    stats.value.completed = completed.length

    stats.value.priority.normal = incomplete.filter(t => t.priority === 0).length
    stats.value.priority.high = incomplete.filter(t => t.priority === 1).length
    stats.value.priority.urgent = incomplete.filter(t => t.priority >= 2).length

    recentTasks.value = allTasks
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .slice(0, 5)
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Failed to load dashboard data: ' + (error.message || 'Unknown error'),
      icon: 'error'
    })
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

function navigateToTasks(filter) {
  router.push({ path: '/tasks', query: { filter } })
}

function addNewTask() {
  router.push({ path: '/tasks', query: { action: 'create' } })
}

function viewTask(task) {
  router.push(`/tasks/${task.entity_id}`)
}

function onWelcomeCompleted(updated) {
  if (updated) loadDashboardData()
}

async function toggleTask(task) {
  try {
    await taskService.toggleTask(task.entity_id)
    await loadDashboardData()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Failed to update task status: ' + (error.message || 'Unknown error'),
      icon: 'error'
    })
    task.is_completed = !task.is_completed
  }
}
</script>

<style lang="scss" scoped>
.dashboard-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  }
}

.page-container {
  max-width: 1280px;
  margin: 0 auto;
}

.text-strike {
  text-decoration: line-through;
  color: #aaa;
}
</style>