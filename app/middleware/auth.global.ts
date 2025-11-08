export default defineNuxtRouteMiddleware((to, _from) => {
  const authStore = useAuthStore()

  // Public routes that don't require authentication
  const publicRoutes = [
    '/login',
    '/login-basic',
    '/register',
    '/forgot-password',
    '/otp',
    '/otp-1',
    '/otp-2',
  ]

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => to.path.startsWith(route))

  // If not authenticated and trying to access protected route
  if (!authStore.isAuthenticated && !isPublicRoute) {
    return navigateTo('/login')
  }

  // If authenticated and trying to access auth pages, redirect to home
  if (authStore.isAuthenticated && isPublicRoute) {
    return navigateTo('/')
  }
})
