<template>
  <q-page class="flex flex-center bg-grey-1">
    <div class="row full-width justify-center">
      <div class="col-xs-11 col-sm-8 col-md-6 col-lg-4 col-xl-3">
        <!-- Forgot Password Card -->
        <q-card class="forgot-password-card q-pa-lg">
          <!-- Logo/Brand Header -->
          <div class="text-center q-mb-xl">
            <div class="text-h4 text-primary text-weight-bold q-mb-xs">Rococo</div>
            <div class="text-subtitle1 text-grey-7">Task Management System</div>
          </div>
          
          <!-- Page Header -->
          <div class="text-center q-mb-lg">
            <div class="text-h5 text-weight-bold">Reset Password</div>
            <div class="text-body2 text-grey-7 q-mt-sm">
              Enter your email address and we'll send you instructions to reset your password
            </div>
          </div>

          <!-- Form -->
          <q-form @submit.prevent="onSubmit" class="q-gutter-md">
            <!-- Email Input -->
            <q-input 
              v-model="email" 
              type="email" 
              label="Email Address"
              outlined
              stack-label
              class="q-mb-lg"
              :rules="[
                val => !!val || 'Email is required', 
                val => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(val) || 'Please enter a valid email'
              ]"
            >
              <template v-slot:prepend>
                <q-icon name="email" color="primary" />
              </template>
            </q-input>

            <!-- Reset Button -->
            <q-btn 
              label="Send Reset Instructions" 
              color="primary" 
              type="submit" 
              class="full-width q-py-sm" 
              :loading="isLoading"
              unelevated
            />

            <!-- Login Link -->
            <div class="text-center q-mt-lg">
              <router-link to="/login" class="text-primary text-weight-medium">
                <q-icon name="arrow_back" size="xs" class="q-mr-xs" />
                Back to Login
              </router-link>
            </div>
            
            <!-- Signup Link -->
            <div class="text-center q-mt-md">
              <span class="text-grey-7">Don't have an account? </span>
              <router-link to="/signup" class="text-primary text-weight-medium">
                Create Account
              </router-link>
            </div>
          </q-form>
        </q-card>
        
        <!-- Footer -->
        <div class="text-center text-grey-6 text-caption q-mt-md">
          &copy; {{ new Date().getFullYear() }} Rococo Task Manager. All rights reserved.
        </div>
      </div>
    </div>
  </q-page>
</template>
  
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useQuasar } from 'quasar'

// State
const email = ref('')
const isLoading = ref(false)
const router = useRouter()
const authStore = useAuthStore()
const $q = useQuasar()

// Methods
async function onSubmit() {
  if (!email.value) return
  
  try {
    isLoading.value = true
    
    // Call the auth store's requestPasswordReset method
    const result = await authStore.requestPasswordReset({ email: email.value })
    
    if (result) {
      $q.notify({
        message: 'Password reset instructions have been sent to your email',
        color: 'positive',
        icon: 'email',
        position: 'top',
        timeout: 3000
      })
      
      // Delay navigation slightly to allow notification to be visible
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    }
  } catch (error) {
    console.error('Error requesting password reset:', error)
    $q.notify({
      message: error.response?.data?.message || 'An error occurred while requesting password reset',
      color: 'negative',
      icon: 'error',
      position: 'top'
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.forgot-password-card {
  border-radius: 16px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }
}

a {
  text-decoration: none;
  transition: color 0.2s ease;
  
  &:hover {
    text-decoration: underline;
  }
}
</style>