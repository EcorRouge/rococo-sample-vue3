import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { Notify } from 'quasar'
import AuthCallback from '../../src/pages/Auth/AuthCallback.vue'

// Mock auth service
const mockAuthService = {
  getStateDataValue: vi.fn(),
  getCodeVerifier: vi.fn()
}

vi.mock('../../src/services/auth.service.js', () => ({
  default: mockAuthService
}))

// Mock Quasar Notify
vi.mock('quasar', async () => {
  const actual = await vi.importActual('quasar')
  return {
    ...actual,
    Notify: {
      create: vi.fn()
    }
  }
})

describe('AuthCallback.vue', () => {
  let router
  let pinia
  let authStore

  beforeEach(async () => {
    vi.clearAllMocks()
    
    // Setup Pinia
    pinia = createPinia()
    setActivePinia(pinia)
    
    // Setup router
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/auth/callback', component: AuthCallback },
        { path: '/login', component: { template: '<div>Login</div>' } },
        { path: '/dashboard', component: { template: '<div>Dashboard</div>' } }
      ]
    })

    // Setup auth store mock
    const { useAuthStore } = await import('../../src/stores/auth.js')
    authStore = useAuthStore()
    
    // Mock auth store methods
    authStore.loginWithOAuth = vi.fn()
    authStore.clearInvitationToken = vi.fn()
    authStore.clearOAuthErrorMessage = vi.fn()
    
    // Reset globalThis.location
    globalThis.location = {
      origin: 'http://localhost:3000',
      search: '?state=test-state&code=test-auth-code'
    }

    // Reset console.log to avoid noise
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('should handle successful OAuth callback', async () => {
    // Mock successful OAuth flow
    mockAuthService.getStateDataValue
      .mockResolvedValueOnce('google') // provider
      .mockResolvedValueOnce('test-invitation-token') // invitation_token
    mockAuthService.getCodeVerifier.mockResolvedValue('test-code-verifier')
    
    authStore.loginWithOAuth.mockResolvedValue({ success: true })

    // Navigate to callback route
    await router.push('/auth/callback')
    
    const wrapper = mount(AuthCallback, {
      global: {
        plugins: [router, pinia],
        stubs: {
          QSpinnerDots: true
        }
      }
    })

    // Wait for async operations
    await flushPromises()

    expect(mockAuthService.getStateDataValue).toHaveBeenCalledWith('provider')
    expect(mockAuthService.getStateDataValue).toHaveBeenCalledWith('invitation_token', false)
    expect(mockAuthService.getCodeVerifier).toHaveBeenCalled()
    
    expect(authStore.loginWithOAuth).toHaveBeenCalledWith('google', {
      redirect_uri: 'http://localhost:3000/auth/callback',
      code_verifier: 'test-code-verifier',
      provider: 'google',
      invitation_token: 'test-invitation-token',
      code: 'test-auth-code'
    })

    expect(authStore.clearInvitationToken).toHaveBeenCalled()
    expect(authStore.clearOAuthErrorMessage).toHaveBeenCalled()
    expect(Notify.create).toHaveBeenCalledWith({
      message: 'Successfully signed in with google!',
      color: 'positive',
      position: 'top',
      timeout: 3000
    })

    wrapper.unmount()
  })

  it('should handle OAuth callback without invitation token', async () => {
    mockAuthService.getStateDataValue
      .mockResolvedValueOnce('microsoft') // provider
      .mockResolvedValueOnce(null) // invitation_token (null)
    mockAuthService.getCodeVerifier.mockResolvedValue('test-code-verifier')
    
    authStore.loginWithOAuth.mockResolvedValue({ success: true })

    await router.push('/auth/callback')
    
    const wrapper = mount(AuthCallback, {
      global: {
        plugins: [router, pinia],
        stubs: {
          QSpinnerDots: true
        }
      }
    })

    await flushPromises()

    // Verify invitation_token is not included in request body
    expect(authStore.loginWithOAuth).toHaveBeenCalledWith('microsoft', 
      expect.not.objectContaining({
        invitation_token: expect.anything()
      })
    )

    wrapper.unmount()
  })

  it('should handle access_denied error', async () => {
    globalThis.location.search = '?error=access_denied'

    await router.push('/auth/callback')
    
    const wrapper = mount(AuthCallback, {
      global: {
        plugins: [router, pinia],
        stubs: {
          QSpinnerDots: true
        }
      }
    })

    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/login')
    expect(router.currentRoute.value.query.error).toBe('oauth_cancelled')

    wrapper.unmount()
  })

  it('should handle missing authorization code', async () => {
    globalThis.location.search = '?state=test-state' // No code parameter

    mockAuthService.getStateDataValue
      .mockResolvedValueOnce('google')
      .mockResolvedValueOnce(null)
    mockAuthService.getCodeVerifier.mockResolvedValue('test-code-verifier')

    await router.push('/auth/callback')
    
    const wrapper = mount(AuthCallback, {
      global: {
        plugins: [router, pinia],
        stubs: {
          QSpinnerDots: true
        }
      }
    })

    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/login')
    expect(router.currentRoute.value.query.error).toBe('oauth_no_code')

    wrapper.unmount()
  })

  it('should handle OAuth login failure', async () => {
    mockAuthService.getStateDataValue
      .mockResolvedValueOnce('google')
      .mockResolvedValueOnce(null)
    mockAuthService.getCodeVerifier.mockResolvedValue('test-code-verifier')
    
    authStore.loginWithOAuth.mockResolvedValue({ 
      success: false, 
      error: 'Invalid credentials' 
    })

    await router.push('/auth/callback')
    
    const wrapper = mount(AuthCallback, {
      global: {
        plugins: [router, pinia],
        stubs: {
          QSpinnerDots: true
        }
      }
    })

    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/login')
    expect(router.currentRoute.value.query.error).toBe('oauth_failed')

    wrapper.unmount()
  })

  it('should handle OAuth login failure without error message', async () => {
    mockAuthService.getStateDataValue
      .mockResolvedValueOnce('microsoft')
      .mockResolvedValueOnce(null)
    mockAuthService.getCodeVerifier.mockResolvedValue('test-code-verifier')
    
    authStore.loginWithOAuth.mockResolvedValue({ 
      success: false
    })

    await router.push('/auth/callback')
    
    const wrapper = mount(AuthCallback, {
      global: {
        plugins: [router, pinia],
        stubs: {
          QSpinnerDots: true
        }
      }
    })

    await flushPromises()

    expect(authStore.oauthErrorMessage).toBe('Failed to sign in with microsoft. Please try again.')

    wrapper.unmount()
  })

  it('should handle unexpected errors during callback', async () => {
    mockAuthService.getStateDataValue.mockRejectedValue(new Error('State retrieval failed'))

    await router.push('/auth/callback')
    
    const wrapper = mount(AuthCallback, {
      global: {
        plugins: [router, pinia],
        stubs: {
          QSpinnerDots: true
        }
      }
    })

    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/login')

    wrapper.unmount()
  })

  it('should not process callback twice', async () => {
    mockAuthService.getStateDataValue
      .mockResolvedValueOnce('google')
      .mockResolvedValueOnce(null)
    mockAuthService.getCodeVerifier.mockResolvedValue('test-code-verifier')
    
    authStore.loginWithOAuth.mockResolvedValue({ success: true })

    await router.push('/auth/callback')
    
    const wrapper = mount(AuthCallback, {
      global: {
        plugins: [router, pinia],
        stubs: {
          QSpinnerDots: true
        }
      }
    })

    await flushPromises()

    // Verify loginWithOAuth was called only once despite multiple renders
    expect(authStore.loginWithOAuth).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })
})

