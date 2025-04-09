<template>
  <q-dialog v-model="dialogVisible" persistent>
    <q-card class="welcome-dialog" style="min-width: 450px">
      <q-card-section class="bg-primary text-white">
        <div class="text-h5 text-weight-bold">Welcome to Rococo</div>
      </q-card-section>
      
      <div v-if="!isEditing">
        <q-card-section class="q-pt-lg">
          <div class="row items-center">
            <div class="col-auto q-mr-md">
              <q-icon name="waving_hand" color="warning" size="64px" />
            </div>
            <div class="col">
              <div class="text-h6 q-mb-sm">Hello there!</div>
              <p class="q-mb-xs">
                Welcome to your new account! Let's take a moment to personalize your profile.
              </p>
              <p class="q-mb-none text-weight-medium">
                Would you like to set or update your name now?
              </p>
            </div>
          </div>
        </q-card-section>
        
        <q-card-actions align="right" class="q-pb-md q-px-md">
          <q-btn 
            flat 
            label="Skip for now" 
            color="grey-7" 
            @click="skipUpdate" 
            class="q-mx-sm"
          />
          <q-btn 
            flat 
            label="Update Profile" 
            color="primary" 
            @click="startEditing" 
            unelevated
          />
        </q-card-actions>
      </div>

      <q-card-section v-if="isEditing" class="q-pa-md">
        <ProfileEdit 
          title="Set Your Name" 
          @saved="onProfileSaved" 
          @cancel="isEditing = false"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
  
<script setup>
import { ref, watch } from 'vue'
import ProfileEdit from '@/components/ProfileEdit.vue'
import localStorageService from '@/services/localStorage.service'
import { useQuasar } from 'quasar'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'completed'])
const $q = useQuasar()
const isEditing = ref(false)
const dialogVisible = ref(props.modelValue)

// Watch for changes in model value
watch(() => props.modelValue, (newVal) => {
  dialogVisible.value = newVal
})

// Watch for changes in dialog visibility
watch(dialogVisible, (newVal) => {
  emit('update:modelValue', newVal)
})

// Start editing profile
function startEditing() {
  isEditing.value = true
}

// Skip profile update
function skipUpdate() {
  // Mark as welcomed so we don't show the dialog again
  localStorageService.setItem('welcomed', true)
  
  // Close the dialog
  dialogVisible.value = false
  emit('completed', false)
  
  $q.notify({
    message: 'You can update your profile anytime from the profile page',
    color: 'info',
    icon: 'info',
    position: 'bottom-right',
    timeout: 3000
  })
}

// Handle profile save completion
function onProfileSaved() {
  // Mark as welcomed
  localStorageService.setItem('welcomed', true)
  
  // Close dialog
  dialogVisible.value = false
  isEditing.value = false
  emit('completed', true)
  
  $q.notify({
    message: 'Profile updated successfully! Welcome aboard!',
    color: 'positive',
    icon: 'check_circle',
    position: 'top',
    timeout: 2000
  })
}
</script>

<style lang="scss" scoped>
.welcome-dialog {
  border-radius: 12px;
  
  .q-card__section {
    padding: 20px;
  }
}
</style>