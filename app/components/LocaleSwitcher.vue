<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const locales = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'ar', name: 'العربية' },
]

function changeLocale(newLocale: string) {
  locale.value = newLocale
  if (import.meta.client) {
    localStorage.setItem('locale', newLocale)
    document.dir = newLocale === 'ar' ? 'rtl' : 'ltr'
  }
}
</script>

<template>
  <div class="flex gap-2">
    <Button
      v-for="loc in locales"
      :key="loc.code"
      :variant="locale === loc.code ? 'default' : 'outline'"
      size="sm"
      @click="changeLocale(loc.code)"
    >
      {{ loc.name }}
    </Button>
  </div>
</template>
