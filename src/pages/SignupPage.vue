<template>
  <q-page class="flex flex-center bg-grey-1">
    <div class="row full-width justify-center">
      <div class="col-xs-11 col-sm-8 col-md-6 col-lg-4 col-xl-3">
        <!-- Signup Success Dialog -->
        <q-dialog v-model="successDialog" persistent>
          <q-card class="text-center" style="min-width: 350px">
            <q-card-section class="bg-positive text-white">
              <div class="text-h6">
                <q-icon name="check_circle" class="q-mr-sm" />
                Signup Successful
              </div>
            </q-card-section>

            <q-card-section class="q-pt-lg q-pb-md">
              <q-icon name="mark_email_read" size="64px" color="positive" class="q-mb-md" />
              <div class="text-body1 q-mb-md">Your account has been created successfully!</div>
              <p class="text-body2 text-grey-7">
                Please check your email for a verification link and follow the link
                to set a password for your account.
              </p>
            </q-card-section>

            <q-card-actions align="center" class="q-pb-md">
              <q-btn 
                flat 
                label="Back to Login" 
                color="primary" 
                @click="backToLogin" 
                class="q-px-md"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>
        
        <!-- Signup Card -->
        <q-card class="signup-card q-pa-lg">
          <!-- Logo/Brand Header -->
          <div class="text-center q-mb-lg">
            <div class="text-h4 text-primary text-weight-bold q-mb-xs">Rococo</div>
            <div class="text-subtitle1 text-grey-7">Task Management System</div>
          </div>
          
          <!-- Form Header -->
          <div class="text-center q-mb-lg">
            <div class="text-h5 text-weight-bold">Create an Account</div>
            <div class="text-body2 text-grey-7 q-mt-sm">Sign up to get started</div>
          </div>

          <!-- Signup Form -->
          <q-form @submit.prevent="onSubmit" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <!-- First Name -->
              <div class="col-12 col-sm-6">
                <q-input 
                  v-model="firstName" 
                  type="text" 
                  label="First Name" 
                  outlined
                  stack-label
                  class="q-mb-sm"
                  :rules="[val => !!val || 'First Name is required']"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" color="primary" />
                  </template>
                </q-input>
              </div>
              
              <!-- Last Name -->
              <div class="col-12 col-sm-6">
                <q-input 
                  v-model="lastName" 
                  type="text" 
                  label="Last Name" 
                  outlined
                  stack-label
                  class="q-mb-sm"
                  :rules="[val => !!val || 'Last Name is required']"
                >
                  <template v-slot:prepend>
                    <q-icon name="badge" color="primary" />
                  </template>
                </q-input>
              </div>
            </div>

            <!-- Email Address -->
            <q-input 
              v-model="emailAddress" 
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

            <!-- Terms Checkbox -->
            <q-checkbox
              v-model="acceptTerms"
              label="I agree to the Terms of Service and Privacy Policy"
              color="primary"
              :rules="[val => val || 'You must accept the terms to continue']"
              class="q-mb-md"
            />

            <!-- Signup Button -->
            <q-btn
              label="Create Account"
              color="primary"
              type="submit"
              class="full-width q-py-sm"
              :loading="signupLoading"
              unelevated
            />

            <!-- Login Link -->
            <div class="text-center q-mt-lg">
              <span class="text-grey-7">Already have an account? </span>
              <router-link to="/login" class="text-primary text-weight-medium">
                Sign In
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
import { useQuasar } from 'quasar'
import { useAuthStore } from 'stores/auth'

const $q = useQuasar()
const firstName = ref('')
const lastName = ref('')
const emailAddress = ref('')
const acceptTerms = ref(false)

const successDialog = ref(false)
const signupLoading = ref(false)

const router = useRouter()
const authStore = useAuthStore()

// Signup function
async function onSubmit() {
  if (!firstName.value || !lastName.value || !emailAddress.value || !acceptTerms.value) {
    return
  }
  
  signupLoading.value = true

  try {
    let success = await authStore.signup({
      first_name: firstName.value,
      last_name: lastName.value,
      email_address: emailAddress.value,
    })

    if (success) {
      successDialog.value = true
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error?.response?.data?.message || error.message || 'Signup failed. Please try again.',
      icon: 'error',
      position: 'top'
    })
  } finally {
    signupLoading.value = false
  }
}

function backToLogin() {
  router.push('/login')
}
</script>

<style lang="scss" scoped>
.signup-card {
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