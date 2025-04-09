<template>
  <div>
    <q-form @submit="saveProfile" class="q-gutter-md">
      <div class="text-subtitle1 text-weight-bold q-mb-md">{{ title }}</div>
      
      <q-input
        v-model="form.first_name"
        label="First Name"
        placeholder="Enter your first name"
        :rules="[val => !!val || 'First name is required']"
        outlined
        stack-label
        bg-color="white"
        class="q-mb-md"
      >
        <template v-slot:prepend>
          <q-icon name="person" color="primary" />
        </template>
      </q-input>

      <q-input
        v-model="form.last_name"
        label="Last Name"
        placeholder="Enter your last name"
        :rules="[val => !!val || 'Last name is required']"
        outlined
        stack-label
        bg-color="white"
        class="q-mb-md"
      >
        <template v-slot:prepend>
          <q-icon name="badge" color="primary" />
        </template>
      </q-input>

      <div class="row justify-end q-mt-lg">
        <q-btn 
          label="Cancel" 
          color="grey-7" 
          @click="$emit('cancel')" 
          flat
          class="q-mx-sm" 
        />
        <q-btn 
          label="Save Changes" 
          type="submit" 
          color="primary" 
          :loading="loading" 
          unelevated
        />
      </div>
    </q-form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import personService from '@/services/person.service'
import { useAuthStore } from '@/stores/auth'

const emit = defineEmits(['saved', 'cancel'])
const $q = useQuasar()
const authStore = useAuthStore()

const loading = ref(false)
const form = ref({
  first_name: '',
  last_name: ''
})

onMounted(() => {
  // Initialize form with current user data
  if (authStore.user) {
    form.value.first_name = authStore.user.first_name || ''
    form.value.last_name = authStore.user.last_name || ''
  }
})

// Save profile changes
async function saveProfile() {
  if (!form.value.first_name || !form.value.last_name) {
    $q.notify({
      type: 'negative',
      message: 'Both first name and last name are required',
      icon: 'warning',
      position: 'top'
    })
    return
  }

  loading.value = true

  try {
    // Call API to update profile
    const updatedPerson = await personService.updateProfile({
      first_name: form.value.first_name,
      last_name: form.value.last_name
    })

    // Update the user in the auth store
    authStore.updateUser(updatedPerson)

    // Emit event to notify parent component
    emit('saved', updatedPerson)
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Failed to update profile: ' + (error?.response?.data?.message || error.message || 'Unknown error'),
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>