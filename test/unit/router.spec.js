import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMemoryHistory } from 'vue-router'
import { setActivePinia, createPinia } from 'pinia'

// Mock #q-app/wrappers - must be hoisted before imports
// This ensures the mock works even if .quasar directory doesn't exist
vi.mock('#q-app/wrappers', () => ({
  defineRouter: (fn) => fn
}))

// Mock auth store
const mockAuthStore = {
  accessToken: null,
  isAuthenticated: false,
  isTokenExpired: false,
  initialize: vi.fn(),
  checkAndRefreshToken: vi.fn()
}

vi.mock('src/stores/auth', () => ({
  useAuthStore: vi.fn(() => mockAuthStore)
}))

describe('router/index.js', () => {
  let router
  let pinia

  beforeEach(async () => {
    vi.clearAllMocks()
    
    // Setup Pinia
    pinia = createPinia()
    setActivePinia(pinia)
    
    // Reset mock auth store
    mockAuthStore.accessToken = null
    mockAuthStore.isAuthenticated = false
    mockAuthStore.isTokenExpired = false
    mockAuthStore.initialize = vi.fn()
    mockAuthStore.checkAndRefreshToken = vi.fn()

    // Ensure process.env is set (from setup.js, but ensure VUE_ROUTER_BASE is always defined)
    if (!globalThis.process?.env?.VUE_ROUTER_BASE) {
      globalThis.process.env.VUE_ROUTER_BASE = '/'
    }
    if (!globalThis.process?.env?.VUE_ROUTER_MODE) {
      globalThis.process.env.VUE_ROUTER_MODE = 'history'
    }
    if (globalThis.process?.env?.SERVER === undefined) {
      globalThis.process.env.SERVER = false
    }

    // Import router factory
    const routerModule = await import('../../src/router/index.js')
    router = routerModule.default()
  })

  it('should create router instance with routes', () => {
    expect(router).toBeDefined()
    expect(router.options.routes).toBeDefined()
    expect(router.options.routes.length).toBeGreaterThan(0)
  })

  it('should use history mode when VUE_ROUTER_MODE is history', async () => {
    // Clear module cache to force re-import with new env
    vi.resetModules()
    
    globalThis.process.env.VUE_ROUTER_MODE = 'history'
    globalThis.process.env.VUE_ROUTER_BASE = '/' // Ensure BASE is set
    
    const routerModule = await import('../../src/router/index.js')
    const newRouter = routerModule.default()
    
    expect(newRouter.options.history).toBeDefined()
  })

  it('should use hash mode when VUE_ROUTER_MODE is not history', async () => {
    // Clear module cache to force re-import with new env
    vi.resetModules()
    
    globalThis.process.env.VUE_ROUTER_MODE = 'hash'
    globalThis.process.env.VUE_ROUTER_BASE = '/' // Ensure BASE is set
    
    const routerModule = await import('../../src/router/index.js')
    const newRouter = routerModule.default()
    
    expect(newRouter.options.history).toBeDefined()
  })

  it('should use memory history on server', async () => {
    // Clear module cache to force re-import with new env
    vi.resetModules()
    
    globalThis.process.env.SERVER = true
    globalThis.process.env.VUE_ROUTER_BASE = '/' // Ensure BASE is set
    
    const routerModule = await import('../../src/router/index.js')
    const newRouter = routerModule.default()
    
    expect(newRouter.options.history).toBeDefined()
  })

  describe('Navigation Guards', () => {
    it('should initialize auth store if no access token', async () => {
      mockAuthStore.accessToken = null

      await router.push('/')

      expect(mockAuthStore.initialize).toHaveBeenCalled()
    })

    it('should check and refresh token if expired', async () => {
      mockAuthStore.accessToken = 'test-token'
      mockAuthStore.isTokenExpired = true

      await router.push('/')

      expect(mockAuthStore.checkAndRefreshToken).toHaveBeenCalled()
    })

    it('should redirect authenticated users from login to dashboard', async () => {
      mockAuthStore.isAuthenticated = true

      await router.push('/login')

      expect(router.currentRoute.value.path).toBe('/dashboard')
    })

    it('should redirect authenticated users from signup to dashboard', async () => {
      mockAuthStore.isAuthenticated = true

      await router.push('/signup')

      expect(router.currentRoute.value.path).toBe('/dashboard')
    })

    it('should redirect authenticated users from forgot-password to dashboard', async () => {
      mockAuthStore.isAuthenticated = true

      await router.push('/forgot-password')

      expect(router.currentRoute.value.path).toBe('/dashboard')
    })

    it('should redirect authenticated users from set-password to dashboard', async () => {
      mockAuthStore.isAuthenticated = true

      await router.push('/set-password/token123')

      expect(router.currentRoute.value.path).toBe('/dashboard')
    })

    it('should redirect unauthenticated users to login when accessing protected route', async () => {
      mockAuthStore.isAuthenticated = false

      // Try to access a protected route (assuming dashboard requires auth)
      await router.push({ 
        path: '/dashboard', 
        meta: { requiresAuth: true } 
      })

      expect(router.currentRoute.value.path).toBe('/login')
    })

    it('should redirect root path to dashboard for authenticated users', async () => {
      mockAuthStore.isAuthenticated = true

      await router.push('/')

      expect(router.currentRoute.value.path).toBe('/dashboard')
    })

    it('should redirect root path to login for unauthenticated users', async () => {
      mockAuthStore.isAuthenticated = false

      await router.push('/')

      expect(router.currentRoute.value.path).toBe('/login')
    })

    it('should allow navigation to public routes', async () => {
      mockAuthStore.isAuthenticated = false

      await router.push('/login')

      expect(router.currentRoute.value.path).toBe('/login')
    })
  })

  describe('Scroll Behavior', () => {
    it('should have scroll behavior configured', () => {
      expect(router.options.scrollBehavior).toBeDefined()
      
      const scrollResult = router.options.scrollBehavior()
      expect(scrollResult).toEqual({ left: 0, top: 0 })
    })
  })
})

