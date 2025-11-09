import tailwindcss from '@tailwindcss/vite'
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  css: ['~/assets/css/tailwind.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  hooks: {
    'vite:extendConfig'(config, { isClient }) {
      if (isClient) {
        // Find and modify the i18n plugin to exclude non-locale JSON files
        const plugins = config.plugins || []
        const i18nPluginIndex = plugins.findIndex((p: any) => p?.name === '@intlify/unplugin-vue-i18n')
        if (i18nPluginIndex !== -1) {
          const originalPlugin = plugins[i18nPluginIndex] as any
          if (originalPlugin.transform) {
            const originalTransform = originalPlugin.transform.bind(originalPlugin)
            originalPlugin.transform = async function (code: string, id: string) {
              // Skip transformation for non-locale JSON files
              if (id.endsWith('.json') && !id.includes('/locales/') && !id.includes('\\locales\\')) {
                return null
              }
              return originalTransform(code, id)
            }
          }
        }
      }
    },
  },

  components: [
    {
      path: '~/components',
      extensions: ['.vue'],
    },
  ],

  modules: [
    'shadcn-nuxt',
    '@vueuse/nuxt',
    '@nuxt/eslint',
    '@nuxt/icon',
    '@pinia/nuxt',
    '@nuxtjs/color-mode',
    '@nuxt/fonts',
    '@nuxtjs/i18n',
  ],

  i18n: {
    locales: [
      { code: 'en', name: 'English' },
      { code: 'fr', name: 'Français' },
      { code: 'ar', name: 'العربية' },
    ],
    defaultLocale: 'en',
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
      alwaysRedirect: false,
      fallbackLocale: 'en',
    },
    vueI18n: './i18n.config.ts',
    experimental: {
      jsTsFormatResource: true,
    },
  },

  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * @default "~/components/ui"
     */
    componentDir: '~/components/ui',
  },

  colorMode: {
    classSuffix: '',
  },

  eslint: {
    config: {
      standalone: false,
    },
  },

  fonts: {
    defaults: {
      weights: [300, 400, 500, 600, 700, 800],
    },
  },

  routeRules: {
    '/components': { redirect: '/components/accordion' },
    '/settings': { redirect: '/settings/profile' },
  },

  imports: {
    dirs: [
      './lib',
    ],
  },

  runtimeConfig: {
    public: {
      apiBaseUrl: 'https://api.viridial.com',
      apiLoginEndpoint: '/api/v1/auth/login',
      apiRegisterEndpoint: '/api/v1/auth/register',
      apiRefreshEndpoint: '/api/v1/auth/refresh',
    },
  },

  compatibilityDate: '2024-12-14',
})
