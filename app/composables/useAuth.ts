export function useAuth() {
  const token = ref(localStorage.getItem('accessToken') || null)
  const user = ref(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null)

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    navigateTo('/login')
  }

  return { token, user, logout }
}