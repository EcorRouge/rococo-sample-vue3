<template>
  <div class="flex flex-center full-height">
    <div class="text-center">
      <q-spinner-dots size="50px" color="primary" />
      <div class="text-h6 q-mt-md">Signing you in…</div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import { storeToRefs } from 'pinia'
import authService from 'src/services/auth.service'

const router = useRouter()
const authStore = useAuthStore()
const { oauthErrorMessage } = storeToRefs(authStore)

const hasProcessed = ref(false)

onMounted(async () => {
  if (hasProcessed.value) return
  hasProcessed.value = true
  
  try {
    // Check for access_denied error in URL params
    const urlParams = new URLSearchParams(window.location.search)
    const error = urlParams.get('error')
    
    if (error === 'access_denied') {
      // Redirect to login with error message
      router.push({
        path: '/login',
        query: { error: 'oauth_cancelled' }
      })
      return
    }
    
    let provider = await authService.getStateDataValue('provider')
    let stateInvitationToken = await authService.getStateDataValue('invitation_token', false)
    
    // Prepare the request body with available fields
    const requestBody = {
      redirect_uri: window.location.origin + '/auth/callback',
      code_verifier: await authService.getCodeVerifier(), // Get the code verifier from authService
      provider
    }
    
    // Include invitation token if present
    if (stateInvitationToken) {
      requestBody.invitation_token = stateInvitationToken
    }
    
    // Get the authorization code from URL params if available
    const code = urlParams.get('code')
    if (code) requestBody.code = code
    
    // Exchange tokens with Flask backend
    const result = await authStore.loginWithOAuth(provider, requestBody)
    if (!result.success) {
      oauthErrorMessage.value = result.error
      router.push({
        path: '/login',
      })
      return
    } else {
      authStore.clearInvitationToken()
    }
    
  } catch (error) {
    console.error('Authentication callback error:', error)
    // Redirect to login on error
    router.push('/login')
  }
})
</script>
