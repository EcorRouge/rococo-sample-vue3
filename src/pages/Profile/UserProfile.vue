<template>
  <q-page class="flex flex-center q-pa-md">
    <q-card class="q-pa-md" style="max-width: 500px; width: 100%; border-radius: 10px; box-shadow: 0 10px 20px rgba(0,0,0,0.1)">
      <q-card-section class="q-pt-none text-center">
        <div class="text-h5 text-primary q-mb-md">Profile</div>

        <!-- First Name Field -->
        <q-input
          outlined
          v-model="firstName"
          label="First Name"
          dense
          class="q-mb-md"
          :rules="[val => val && val.length > 0 || 'First Name is required']"
        />

        <!-- Last Name Field -->
        <q-input
          outlined
          v-model="lastName"
          label="Last Name"
          dense
          class="q-mb-md"
          :rules="[val => val && val.length > 0 || 'Last Name is required']"
        />

        <!-- Save Button -->
<!--        <q-btn-->
<!--          label="Save"-->
<!--          color="primary"-->
<!--          class="full-width q-mt-lg"-->
<!--          @click="saveProfile"-->
<!--          :disabled="!firstName || !lastName"-->
<!--        />-->
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import localStorageService from 'services/localStorage.service.js'

// Get the user data from localStorage
const user = localStorageService.getItem('user')

// Initialize reactive variables for first name and last name
const firstName = ref(user ? user.first_name : '')
const lastName = ref(user ? user.last_name : '')

// Save profile function (this can be replaced with actual logic for updating the profile)
// function saveProfile() {
//   console.log('Saving profile...', {
//     firstName: firstName.value,
//     lastName: lastName.value
//   })
//   // Update the local storage or make an API call to save the changes
//   localStorageService.setItem('user', {
//     first_name: firstName.value,
//     last_name: lastName.value
//   })
// }
</script>

<style scoped>
/* Customizing the layout for a more polished UI */
.q-card {
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.text-h5 {
  font-weight: bold;
  color: #3e4e5e;
}

.q-input {
  max-width: 100%;
}

.q-btn {
  font-weight: bold;
  padding: 12px;
  border-radius: 8px;
}

.q-card-section {
  padding: 20px;
}

/* Optional: Add some spacing between elements */
.q-mb-md {
  margin-bottom: 16px;
}

/* Add a little hover effect for the button */
.q-btn:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  background-color: #1e88e5;
}

.q-btn:disabled {
  background-color: #b0bec5;
  cursor: not-allowed;
}
</style>
