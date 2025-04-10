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
      <SummaryCards :stats="taskStore.stats" />

      <!-- Main Content Row -->
      <div class="row q-col-gutter-lg">
        <!-- Task Statistics Section -->
        <div class="col-12 col-lg-8">
          <!-- Recent Tasks -->
          <RecentTasks 
            :tasks="taskStore.recentTasks"
            @view-task="viewTask"
            @toggle-task="toggleTask"
            @add-new-task="addNewTask"
          />

          <!-- Task Progress -->
          <TaskStatistics :stats="taskStore.stats" />
        </div>

        <!-- Sidebar Section -->
        <div class="col-12 col-lg-4">
          <!-- Quick Actions Card -->
          <QuickActions 
            @add-new-task="addNewTask"
            @navigate-to-tasks="navigateToTasks"
          />
          
          <!-- User Profile Card -->
          <UserProfileCard :user="authStore.user" :stats="taskStore.stats" />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTaskStore } from '@/stores/task'
import { useNotificationStore } from '@/stores/notification'
import localStorageService from '@/services/localStorage.service'

// Components
import WelcomeDialog from '@/components/dashboard/WelcomeDialog.vue'
import SummaryCards from '@/components/dashboard/SummaryCards.vue'
import RecentTasks from '@/components/dashboard/RecentTasks.vue'
import TaskStatistics from '@/components/dashboard/TaskStatistics.vue'
import QuickActions from '@/components/dashboard/QuickActions.vue'
import UserProfileCard from '@/components/dashboard/UserProfileCard.vue'

const router = useRouter()
const authStore = useAuthStore()
const taskStore = useTaskStore()
const notificationStore = useNotificationStore()

// State
const showWelcomeDialog = ref(false)

// Lifecycle hooks
onMounted(async () => {
  await loadDashboardData()
  checkWelcomeStatus()
})

// Methods
async function loadDashboardData() {
  try {
    await taskStore.fetchTasks('all')
  } catch {
    notificationStore.showNotification({
      type: 'negative',
      message: 'Failed to load dashboard data',
      icon: 'error'
    })
  }
}

function checkWelcomeStatus() {
  const welcomed = localStorageService.getItem('welcomed')
  if (!welcomed) {
    const user = authStore.user
    if (!user.first_name || !user.last_name || user.first_name.toLowerCase() === 'user' && user.last_name.toLowerCase() === 'user') {
      showWelcomeDialog.value = true
    } else {
      localStorageService.setItem('welcomed', true)
    }
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
    await taskStore.toggleTask(task.entity_id)
  } catch {
    task.is_completed = !task.is_completed // Revert UI change if API call fails
  }
}
</script>

<style lang="scss" scoped>
.page-container {
  max-width: 1280px;
  margin: 0 auto;
}
</style>