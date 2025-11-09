export default defineNuxtPlugin(() => {
  const { locale } = useI18n()

  // Set initial direction based on current locale
  if (import.meta.client) {
    const setDirection = (lang: string) => {
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    }

    // Set initial direction
    setDirection(locale.value)

    // Watch for locale changes
    watch(locale, (newLocale) => {
      setDirection(newLocale)
    })
  }
})
