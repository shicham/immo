export default defineNuxtPlugin(async () => {
  const { $i18n } = useNuxtApp()

  // Dynamically import locale messages
  const en = (await import('../locales/en')).default
  const fr = (await import('../locales/fr')).default
  const ar = (await import('../locales/ar')).default

  // Set messages for each locale
  $i18n.setLocaleMessage('en', en)
  $i18n.setLocaleMessage('fr', fr)
  $i18n.setLocaleMessage('ar', ar)
})
