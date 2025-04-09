<template>
  <q-page class="flex flex-center bg-grey-1">
    <div class="row full-width justify-center">
      <div class="col-xs-11 col-sm-8 col-md-6 col-lg-4 col-xl-3">
        <!-- Login Card -->
        <q-card class="login-card q-pa-lg">
          <!-- Logo/Brand Header -->
          <div class="text-center q-mb-xl">
            <div class="text-h4 text-primary text-weight-bold q-mb-xs">Rococo</div>
            <div class="text-subtitle1 text-grey-7">Task Management System</div>
          </div>
          
          <!-- Welcome Message -->
          <div class="text-center q-mb-lg">
            <div class="text-h5 text-weight-bold">Welcome Back</div>
            <div class="text-body2 text-grey-7 q-mt-sm">Sign in to access your account</div>
          </div>

          <!-- Login Form -->
          <q-form @submit.prevent="onSubmit" class="q-gutter-md">
            <!-- Email Input -->
            <q-input 
              v-model="email" 
              type="email" 
              label="Email Address"
              outlined
              stack-label
              class="q-mb-md"
              :rules="[
                val => !!val || 'Email is required', 
                val => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(val) || 'Please enter a valid email'
              ]"
            >
              <template v-slot:prepend>
                <q-icon name="email" color="primary" />
              </template>
            </q-input>

            <!-- Password Input -->
            <q-input
              v-model="password"
              :type="isPwdVisible ? 'text' : 'password'"
              label="Password"
              outlined
              stack-label
              class="q-mb-sm"
              :rules="[val => !!val || 'Password is required']"
            >
              <template v-slot:prepend>
                <q-icon name="lock" color="primary" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="isPwdVisible ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isPwdVisible = !isPwdVisible"
                />
              </template>
            </q-input>

            <!-- Forgot Password Link -->
            <div class="text-right q-mb-lg">
              <router-link to="/forgot-password" class="text-primary text-weight-medium">
                Forgot Password?
              </router-link>
            </div>

            <!-- Login Button -->
            <q-btn 
              label="Sign In" 
              color="primary" 
              type="submit" 
              class="full-width q-py-sm" 
              :loading="loading"
              unelevated
            />

            <!-- Signup Link -->
            <div class="text-center q-mt-lg">
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
import { useAuthStore } from '@/stores/auth'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const $q = useQuasar()
const router = useRouter()

const email = ref('')
const password = ref('')
const isPwdVisible = ref(false)
const loading = ref(false)

// Login function
async function onSubmit() {
  if (!email.value || !password.value) return
  
  loading.value = true
  
  try {
    // Implement actual login logic here
    await authStore.login({ email: email.value, password: password.value })
    
    $q.notify({
      type: 'positive',
      message: 'Login successful! Redirecting to dashboard...',
      icon: 'check_circle',
      position: 'top',
      timeout: 2000
    })
    
    // Navigate to dashboard
    router.push('/dashboard')
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error?.response?.data?.message || error.message || 'Login failed. Please check your credentials.',
      icon: 'error',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-card {
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