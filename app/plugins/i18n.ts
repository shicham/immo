import { createI18n } from 'vue-i18n'
import ar from '../../locales/ar.json'
import en from '../../locales/en.json'
import fr from '../../locales/fr.json'

export default defineNuxtPlugin((nuxtApp) => {
  // Determine the initial locale
  let initialLocale = 'en'

  if (import.meta.client) {
    // Check localStorage first
    const storedLocale = localStorage.getItem('locale')
    if (storedLocale && ['en', 'fr', 'ar'].includes(storedLocale)) {
      initialLocale = storedLocale
    }
    else {
      // Fall back to browser language
      const browserLang = navigator.language.substring(0, 2)
      if (['en', 'fr', 'ar'].includes(browserLang)) {
        initialLocale = browserLang
      }
    }

    // Set RTL for Arabic
    document.dir = initialLocale === 'ar' ? 'rtl' : 'ltr'
  }

  const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: initialLocale,
    fallbackLocale: 'en',
    messages: {
      en,
      fr,
      ar,
    },
  })

  nuxtApp.vueApp.use(i18n)

  // Make $t available globally
  return {
    provide: {
      t: i18n.global.t,
      i18n,
    },
  }
})
