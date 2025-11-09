import en from './locales/en'
import fr from './locales/fr'
import ar from './locales/ar'

export default defineI18nConfig(() => ({
  legacy: false,
  fallbackLocale: 'en',
  messages: {
    en,
    fr,
    ar,
  },
}))
