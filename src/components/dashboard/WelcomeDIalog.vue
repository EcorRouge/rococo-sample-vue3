<template>
  <q-dialog v-model="localModelValue" persistent>
    <q-card style="min-width: 350px">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">Welcome to Rococo Task Manager</div>
      </q-card-section>

      <q-card-section>
        <p class="q-mb-md">We're glad to have you on board! Let's set up your profile quickly.</p>
        
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input
            v-model="profileData.first_name"
            label="First Name"
            outlined
            :rules="[val => !!val || 'First name is required']"
          />
          
          <q-input
            v-model="profileData.last_name"
            label="Last Name"
            outlined
            :rules="[val => !!val || 'Last name is required']"
          />
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn 
          flat 
          label="Skip" 
          color="grey-7" 
          @click="skipWelcome" 
          :disable="loading"
        />
        <q-btn 
          flat 
          label="Save Profile" 
          color="primary" 
          @click="onSubmit" 
          :loading="loading"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import personService from '@/services/person.service'
import localStorageService from '@/services/localStorage.service'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'completed'])

const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const localModelValue = ref(props.modelValue)
const loading = ref(false)
const profileData = ref({
  first_name: authStore.user?.first_name || '',
  last_name: authStore.user?.last_name || ''
})

// Watch for prop changes
watch(() => props.modelValue, (newVal) => {
  localModelValue.value = newVal
})

// Watch for local changes
watch(localModelValue, (newVal) => {
  emit('update:modelValue', newVal)
})

async function onSubmit() {
  if (!profileData.value.first_name || !profileData.value.last_name) return
  
  loading.value = true
  
  try {
    const updatedProfile = await personService.updateProfile(profileData.value)
    
    if (updatedProfile) {
      // Update the auth store with new data
      authStore.updateUser({
        first_name: profileData.value.first_name,
        last_name: profileData.value.last_name
      })
      
      notificationStore.showNotification({
        type: 'positive',
        message: 'Profile updated successfully!',
        icon: 'check_circle'
      })
      
      // Mark as welcomed
      localStorageService.setItem('welcomed', true)
      
      // Close dialog
      localModelValue.value = false
      
      // Signal completion with profile change
      emit('completed', true)
    }
  } catch {
    notificationStore.showNotification({
      type: 'negative',
      message: 'Failed to update profile',
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}

function skipWelcome() {
  // Mark as welcomed without changing profile
  localStorageService.setItem('welcomed', true)
  localModelValue.value = false
  emit('completed', false)
}
</script>