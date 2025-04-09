<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="app-header">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          v-if="authStore.isAuthenticated"
        />

        <q-toolbar-title class="text-weight-bold">
          <span class="text-h6">TODO</span>
          <span class="text-caption q-ml-sm">MVC</span>
        </q-toolbar-title>

        <!-- User Profile Menu -->
        <div v-if="authStore.isAuthenticated" class="cursor-pointer q-ml-md">
          <q-btn flat no-caps class="q-px-sm">
            <q-avatar size="28px" color="primary" text-color="white" class="q-mr-sm">
              {{ userInitials }}
            </q-avatar>
            {{ authStore.user.first_name }}
            <q-icon name="expand_more" size="sm" class="q-ml-xs" />
          </q-btn>
          
          <q-menu transition-show="jump-down" transition-hide="jump-up" anchor="bottom right" self="top right">
            <q-list style="min-width: 180px">
              <q-item class="q-pa-md">
                <q-item-section>
                  <q-item-label class="text-weight-bold">{{ authStore.user.first_name }} {{ authStore.user.last_name }}</q-item-label>
                </q-item-section>
              </q-item>
              
              <q-separator />
              
              <q-item clickable v-ripple to="/profile" class="q-pa-sm">
                <q-item-section avatar>
                  <q-icon name="account_circle" color="primary" />
                </q-item-section>
                <q-item-section>Profile</q-item-section>
              </q-item>
              
              <q-item clickable v-ripple class="q-pa-sm" @click="authStore.logout()">
                <q-item-section avatar>
                  <q-icon name="logout" color="negative" />
                </q-item-section>
                <q-item-section>Logout</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </div>
      </q-toolbar>
    </q-header>

    <!-- Sidebar Navigation -->
    <q-drawer 
      v-if="authStore.isAuthenticated" 
      v-model="leftDrawerOpen" 
      show-if-above 
      bordered 
      class="app-sidebar"
      :width="240"
    >
      <q-scroll-area class="fit">
        <q-list padding>
          <q-item class="q-pa-md">
            <q-item-section>
              <q-item-label class="text-subtitle1 text-weight-bold text-primary">
                Navigation
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-item 
            v-for="link in linksList" 
            :key="link.title" 
            clickable 
            v-ripple 
            :to="link.link"
            exact
          >
            <q-item-section avatar>
              <q-icon :name="link.icon" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ link.title }}</q-item-label>
              <q-item-label caption v-if="link.caption">{{ link.caption }}</q-item-label>
            </q-item-section>
          </q-item>
          
          <q-separator class="q-my-md" />
          
          <q-item class="q-pa-md">
            <q-item-section>
              <q-item-label class="text-subtitle1 text-weight-bold text-primary">
                Quick Actions
              </q-item-label>
            </q-item-section>
          </q-item>
          
          <q-item 
            clickable 
            v-ripple 
            @click="$router.push('/tasks?action=create')"
          >
            <q-item-section avatar>
              <q-icon name="add_task" color="positive" />
            </q-item-section>
            <q-item-section>
              <q-item-label>New Task</q-item-label>
            </q-item-section>
          </q-item>
          
          <q-item 
            clickable 
            v-ripple 
            @click="$router.push('/tasks?filter=incomplete')"
          >
            <q-item-section avatar>
              <q-icon name="checklist" color="warning" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Pending Tasks</q-item-label>
            </q-item-section>
          </q-item>
          
          <q-item 
            clickable 
            v-ripple 
            @click="$router.push('/profile')"
          >
            <q-item-section avatar>
              <q-icon name="settings" color="grey-6" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Settings</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
      
      <q-img src="/api/placeholder/1000/200" class="absolute-bottom" style="opacity: 0.1">
        <div class="absolute-bottom text-subtitle2 text-center q-pa-xs">
          <div>Rococo Task Manager</div>
          <div class="text-caption">v1.0</div>
        </div>
      </q-img>
    </q-drawer>

    <q-page-container class="bg-grey-1">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from 'stores/auth'

const authStore = useAuthStore()

const linksList = [
  {
    title: 'Dashboard',
    icon: 'dashboard',
    link: '/dashboard',
  },
  {
    title: 'Tasks',
    icon: 'task',
    link: '/tasks',
    caption: 'Manage your tasks'
  },
]

const leftDrawerOpen = ref(false)

// Computed property to get user initials for avatar
const userInitials = computed(() => {
  if (!authStore.user) return '?';
  return (
    (authStore.user.first_name?.[0] || '') + 
    (authStore.user.last_name?.[0] || '')
  ).toUpperCase();
})

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>

<style lang="scss">
.app-header {
  background: linear-gradient(135deg, $primary, $secondary);
  
  .q-toolbar {
    height: 64px;
  }
}

.app-sidebar {
  .q-drawer__content {
    background-color: white;
    padding-top: 12px;
  }
}
</style>