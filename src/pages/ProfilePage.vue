<template>
  <q-page class="q-py-lg q-px-md">
    <div class="page-container">
      <!-- Page Header -->
      <div class="row q-mb-xl">
        <div class="col-12">
          <div class="text-h4 text-weight-bold text-primary q-mb-xs">My Profile</div>
          <p class="text-subtitle1 text-grey-7 q-mb-md">
            Manage your personal information
          </p>
        </div>
      </div>

      <div class="row q-col-gutter-lg">
        <!-- Profile Information Card -->
        <div class="col-12 col-md-7">
          <q-card class="profile-card q-mb-lg">
            <q-card-section class="bg-primary text-white">
              <div class="row items-center">
                <q-avatar size="72px" color="white" text-color="primary" class="q-mr-md shadow-3">
                  {{ userInitials }}
                </q-avatar>
                <div>
                  <div class="text-h5 text-weight-bold">{{ authStore.user.first_name }} {{ authStore.user.last_name }}</div>
                  <div class="text-caption q-mt-xs">{{ email || 'No email available' }}</div>
                </div>
              </div>
            </q-card-section>

            <q-card-section v-if="!isEditing">
              <div class="text-subtitle1 text-weight-bold q-mb-md">Personal Information</div>
              
              <div class="row q-mb-md">
                <div class="col-4 text-grey-7 text-weight-medium">Full Name:</div>
                <div class="col-8">{{ authStore.user.first_name }} {{ authStore.user.last_name }}</div>
              </div>
            </q-card-section>

            <q-card-section v-if="isEditing">
              <ProfileEdit 
                @saved="onProfileSaved" 
                @cancel="isEditing = false" 
              />
            </q-card-section>

            <q-separator />

            <q-card-actions v-if="!isEditing">
              <q-btn flat color="primary" icon="edit" label="Edit Profile" @click="startEditing" />
            </q-card-actions>
          </q-card>
        </div>

        <!-- Account Information Card -->
        <div class="col-12 col-md-5">
          <!-- Account Stats Card -->
          <q-card class="q-mb-lg">
            <q-card-section class="bg-grey-2">
              <div class="text-subtitle1 text-weight-bold">Activity Overview</div>
            </q-card-section>

            <q-card-section>
              <div class="row q-col-gutter-md">
                <div class="col-6">
                  <q-card flat bordered class="bg-grey-1 text-center">
                    <q-card-section class="q-pa-md">
                      <div class="text-h5 text-primary text-weight-bold">{{ stats.total || 0 }}</div>
                      <div class="text-caption">Total Tasks</div>
                    </q-card-section>
                  </q-card>
                </div>
                
                <div class="col-6">
                  <q-card flat bordered class="bg-grey-1 text-center">
                    <q-card-section class="q-pa-md">
                      <div class="text-h5 text-positive text-weight-bold">{{ stats.completed || 0 }}</div>
                      <div class="text-caption">Completed</div>
                    </q-card-section>
                  </q-card>
                </div>
                
                <div class="col-12">
                  <q-linear-progress
                    :value="completionRate"
                    size="20px"
                    class="q-mt-sm rounded-borders"
                    :color="completionRate < 0.3 ? 'negative' : completionRate < 0.7 ? 'warning' : 'positive'"
                  >
                    <div class="absolute-full flex flex-center">
                      <q-badge :color="completionRate < 0.3 ? 'negative' : completionRate < 0.7 ? 'warning' : 'positive'" class="text-white">
                        {{ Math.round(completionRate * 100) }}% Complete
                      </q-badge>
                    </div>
                  </q-linear-progress>
                </div>
              </div>
            </q-card-section>
          </q-card>
          
          <!-- Logout Card -->
          <q-card>
            <q-card-section class="bg-grey-2">
              <div class="text-subtitle1 text-weight-bold">Account Actions</div>
            </q-card-section>
            
            <q-card-section>
              <div class="text-grey-7 q-mb-md">Ready to end your current session?</div>
              <q-btn 
                color="negative" 
                icon="logout" 
                label="Logout" 
                @click="confirmLogout" 
                class="full-width" 
                unelevated
              />
            </q-card-section>
          </q-card>
        </div>
      </div>
      
      <!-- Logout Confirmation Dialog -->
      <q-dialog v-model="logoutDialog">
        <q-card>
          <q-card-section class="row items-center">
            <q-avatar icon="logout" color="negative" text-color="white" />
            <span class="q-ml-sm text-body1">Confirm Logout</span>
          </q-card-section>

          <q-card-section class="q-pt-none">
            Are you sure you want to logout from your account?
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cancel" color="primary" v-close-popup />
            <q-btn flat label="Logout" color="negative" @click="logout" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/auth'
import ProfileEdit from '@/components/ProfileEdit.vue'
import personService from '@/services/person.service'
import taskService from '@/services/task.service'

const $q = useQuasar()
const authStore = useAuthStore()
const isEditing = ref(false)
const email = ref('')
const logoutDialog = ref(false)
const stats = ref({
  total: 0,
  completed: 0
})

// Computed property to get user initials for avatar
const userInitials = computed(() => {
  if (!authStore.user) return '?';
  return (
    (authStore.user.first_name?.[0] || '') + 
    (authStore.user.last_name?.[0] || '')
  ).toUpperCase();
})

// Computed property for completion rate
const completionRate = computed(() => {
  if (stats.value.total === 0) return 0
  return stats.value.completed / stats.value.total
})

onMounted(async () => {
  await loadUserProfile()
  await loadTaskStats()
})

// Load user profile data
async function loadUserProfile() {
  try {
    // Get the user's email from the profile
    const profile = await personService.getCurrentUser()
    if (profile && profile.emails && profile.emails.length > 0) {
      email.value = profile.emails[0].email
    }
  } catch (error) {
    console.error('Error fetching user profile:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to load profile information',
      icon: 'error'
    })
  }
}

// Load task statistics
async function loadTaskStats() {
  try {
    const allTasks = await taskService.getTasks('all')
    stats.value.total = allTasks.length
    stats.value.completed = allTasks.filter(t => t.is_completed).length
  } catch (error) {
    console.error('Error fetching task stats:', error)
  }
}

// Start editing profile
function startEditing() {
  isEditing.value = true
}

// Handle profile save completion
function onProfileSaved() {
  isEditing.value = false
}

// Show logout confirmation dialog
function confirmLogout() {
  logoutDialog.value = true
}

// Logout function
function logout() {
  authStore.logout()
  $q.notify({
    type: 'info',
    message: 'You have been logged out',
    icon: 'logout',
    position: 'top',
    timeout: 2000
  })
}
</script>

<style lang="scss" scoped>
.profile-card {
  .q-avatar {
    font-size: 1.5rem;
    font-weight: bold;
  }
}

.page-container {
  max-width: 1280px;
  margin: 0 auto;
}
</style>