<template>
  <q-page class="flex flex-center bg-grey-1">
    <div class="row full-width justify-center">
      <div class="col-xs-11 col-sm-8 col-md-6 col-lg-4 col-xl-3">
        <!-- Set Password Card -->
        <q-card class="set-password-card q-pa-lg">
          <!-- Logo/Brand Header -->
          <div class="text-center q-mb-xl">
            <div class="text-h4 text-primary text-weight-bold q-mb-xs">Rococo</div>
            <div class="text-subtitle1 text-grey-7">Task Management System</div>
          </div>
          
          <!-- Page Header -->
          <div class="text-center q-mb-lg">
            <div class="text-h5 text-weight-bold">Set Password</div>
            <div class="text-body2 text-grey-7 q-mt-sm">
              Set a strong password for your account to gain access to all features
            </div>
          </div>

          <!-- Form -->
          <q-form @submit.prevent="onSubmit" class="q-gutter-md">
            <!-- Password Input -->
            <q-input
              v-model="password"
              :type="isPwdVisible ? 'text' : 'password'"
              label="Password"
              outlined
              stack-label
              class="q-mb-md"
              :rules="passwordRules"
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

            <!-- Password Strength Indicator -->
            <div class="q-mb-md">
              <div class="row items-center q-mb-xs">
                <div class="col">
                  <div class="text-caption text-grey-7">Password Strength</div>
                </div>
                <div class="col-auto">
                  <div class="text-caption" :class="passwordStrengthColor">{{ passwordStrengthText }}</div>
                </div>
              </div>
              <q-linear-progress
                :value="passwordStrength"
                size="8px"
                :color="
                  passwordStrength < 0.3 
                    ? 'negative' 
                    : passwordStrength < 0.6 
                      ? 'warning' 
                      : 'positive'
                "
                class="rounded-borders"
              />
            </div>

            <!-- Password Requirements -->
            <div class="bg-grey-2 q-pa-sm rounded-borders q-mb-md">
              <div class="text-caption text-weight-medium q-mb-xs">Password Requirements:</div>
              <div class="row q-col-gutter-sm">
                <div class="col-12 col-sm-6">
                  <div class="text-caption flex items-center" :class="password.length >= 8 ? 'text-positive' : 'text-grey-6'">
                    <q-icon :name="password.length >= 8 ? 'check_circle' : 'circle'" size="xs" class="q-mr-xs" />
                    Minimum 8 characters
                  </div>
                </div>
                <div class="col-12 col-sm-6">
                  <div class="text-caption flex items-center" :class="containsUppercase ? 'text-positive' : 'text-grey-6'">
                    <q-icon :name="containsUppercase ? 'check_circle' : 'circle'" size="xs" class="q-mr-xs" />
                    Uppercase letter
                  </div>
                </div>
                <div class="col-12 col-sm-6">
                  <div class="text-caption flex items-center" :class="containsLowercase ? 'text-positive' : 'text-grey-6'">
                    <q-icon :name="containsLowercase ? 'check_circle' : 'circle'" size="xs" class="q-mr-xs" />
                    Lowercase letter
                  </div>
                </div>
                <div class="col-12 col-sm-6">
                  <div class="text-caption flex items-center" :class="containsNumber ? 'text-positive' : 'text-grey-6'">
                    <q-icon :name="containsNumber ? 'check_circle' : 'circle'" size="xs" class="q-mr-xs" />
                    Number
                  </div>
                </div>
              </div>
            </div>

            <!-- Confirm Password Input -->
            <q-input
              v-model="passwordConfirm"
              :type="isConfirmPwdVisible ? 'text' : 'password'"
              label="Confirm password"
              outlined
              stack-label
              lazy-rules
              :rules="confirmPasswordRules"
              class="q-mb-lg"
            >
              <template v-slot:prepend>
                <q-icon name="lock_reset" color="primary" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="isConfirmPwdVisible ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isConfirmPwdVisible = !isConfirmPwdVisible"
                />
              </template>
            </q-input>

            <!-- Set Password Button -->
            <q-btn 
              label="Set Password" 
              color="primary" 
              type="submit" 
              class="full-width q-py-sm" 
              :loading="loading"
              :disable="!isFormValid"
              unelevated
            />
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
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'stores/auth'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()

const token = route.params.token
const uidb64 = route.params.uidb64

const password = ref('')
const passwordConfirm = ref('')
const isPwdVisible = ref(false)
const isConfirmPwdVisible = ref(false)
const loading = ref(false)

// Password validation
const containsUppercase = computed(() => /[A-Z]/.test(password.value))
const containsLowercase = computed(() => /[a-z]/.test(password.value))
const containsNumber = computed(() => /[0-9]/.test(password.value))

// Password strength calculation (0-1)
const passwordStrength = computed(() => {
  if (!password.value) return 0
  
  let strength = 0
  
  // Length contribution (up to 40%)
  strength += Math.min(0.4, (password.value.length / 20) * 0.4)
  
  // Character variety contribution (up to 60%)
  if (containsUppercase.value) strength += 0.15
  if (containsLowercase.value) strength += 0.15
  if (containsNumber.value) strength += 0.15
  if (/[^A-Za-z0-9]/.test(password.value)) strength += 0.15 // Special character
  
  return Math.min(1, strength)
})

// Password strength text
const passwordStrengthText = computed(() => {
  if (!password.value) return 'None'
  if (passwordStrength.value < 0.3) return 'Weak'
  if (passwordStrength.value < 0.6) return 'Moderate'
  if (passwordStrength.value < 0.8) return 'Strong'
  return 'Very Strong'
})

// Password strength color
const passwordStrengthColor = computed(() => {
  if (!password.value) return 'text-grey-7'
  if (passwordStrength.value < 0.3) return 'text-negative'
  if (passwordStrength.value < 0.6) return 'text-warning'
  return 'text-positive'
})

// Form validity check
const isFormValid = computed(() => {
  return (
    password.value.length >= 8 &&
    containsUppercase.value &&
    containsLowercase.value &&
    containsNumber.value &&
    password.value === passwordConfirm.value
  )
})

// Password validation rules
const passwordRules = [
  (v) => !!v || 'Password is required',
  (v) => v.length >= 8 || 'Min 8 characters',
  (v) => /[A-Z]/.test(v) || 'Must contain uppercase letter',
  (v) => /[a-z]/.test(v) || 'Must contain lowercase letter',
  (v) => /[0-9]/.test(v) || 'Must contain a number'
]

// Confirm password validation rules
const confirmPasswordRules = [
  (v) => !!v || 'Please confirm your password',
  (v) => v === password.value || 'Passwords do not match'
]

onMounted(() => {
  if (!token || !uidb64) {
    $q.notify({
      type: 'negative',
      message: 'Invalid password reset link',
      icon: 'error',
      position: 'top'
    })
    router.push('/login')
  }
})

// Set password function
async function onSubmit() {
  if (!isFormValid.value) return
  
  loading.value = true
  
  try {
    await authStore.setPassword(token, uidb64, {
      password: password.value,
    })
    
    $q.notify({
      type: 'positive',
      message: 'Password set successfully! You can now log in with your new password.',
      icon: 'check_circle',
      position: 'top',
      timeout: 3000
    })
    
    // Delay navigation slightly to allow notification to be visible
    setTimeout(() => {
      router.push('/login')
    }, 1500)
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error?.response?.data?.message || error.message || 'Failed to set password. Please try again or request a new link.',
      icon: 'error',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.set-password-card {
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