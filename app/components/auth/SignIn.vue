<script setup lang="ts">
import { useRouter } from '#app'
import { Loader2 } from 'lucide-vue-next'
import { ref } from 'vue'

const authStore = useAuthStore()
const router = useRouter()
const { t } = useI18n()

// state
const email = ref('')
const password = ref('')
const errorMessage = ref('')

// Form validation
const emailError = ref('')
const passwordError = ref('')

function validateEmail() {
  const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/
  if (!email.value) {
    emailError.value = t('auth.signIn.emailRequired')
    return false
  }
  if (!emailRegex.test(email.value)) {
    emailError.value = t('auth.signIn.emailInvalid')
    return false
  }
  emailError.value = ''
  return true
}

function validatePassword() {
  if (!password.value) {
    passwordError.value = t('auth.signIn.passwordRequired')
    return false
  }
  if (password.value.length < 6) {
    passwordError.value = t('auth.signIn.passwordMinLength')
    return false
  }
  passwordError.value = ''
  return true
}

async function onSubmit(event: Event) {
  event.preventDefault()
  errorMessage.value = ''
  emailError.value = ''
  passwordError.value = ''

  // Validate form
  const isEmailValid = validateEmail()
  const isPasswordValid = validatePassword()

  if (!isEmailValid || !isPasswordValid) {
    return
  }

  const result = await authStore.login(email.value, password.value)

  if (result.success) {
    // Redirect to home page
    await router.push('/')
  }
  else {
    errorMessage.value = result.error || t('auth.signIn.connectionError')
  }
}
</script>

<template>
  <form class="grid gap-6" novalidate @submit="onSubmit">
    <div class="flex flex-col gap-4">
      <Button variant="outline" class="w-full gap-2">
        {{ t('auth.signIn.loginWith', { provider: 'Apple' }) }}
      </Button>
      <Button variant="outline" class="w-full gap-2">
        {{ t('auth.signIn.loginWith', { provider: 'Google' }) }}
      </Button>
    </div>

    <Separator :label="t('auth.signIn.orContinueWith')" />

    <div class="grid gap-2">
      <Label for="email">{{ t('auth.signIn.email') }}</Label>
      <Input
        id="email"
        v-model="email"
        type="email"
        :placeholder="t('auth.signIn.emailPlaceholder')"
        :disabled="authStore.isLoading"
        autocomplete="email"
        @blur="validateEmail"
      />
      <p v-if="emailError" class="text-sm text-red-500">
        {{ emailError }}
      </p>
    </div>

    <div class="grid gap-2">
      <div class="flex items-center justify-between">
        <Label for="password">{{ t('auth.signIn.password') }}</Label>
        <NuxtLink
          to="/forgot-password"
          class="text-sm underline text-muted-foreground"
        >
          {{ t('auth.signIn.forgotPassword') }}
        </NuxtLink>
      </div>
      <PasswordInput
        id="password"
        v-model="password"
        :disabled="authStore.isLoading"
        @blur="validatePassword"
      />
      <p v-if="passwordError" class="text-sm text-red-500">
        {{ passwordError }}
      </p>
    </div>

    <!-- message d'erreur général -->
    <p v-if="errorMessage" class="text-sm text-red-500">
      {{ errorMessage }}
    </p>

    <!-- bouton -->
    <Button type="submit" class="w-full" :disabled="authStore.isLoading">
      <Loader2 v-if="authStore.isLoading" class="mr-2 h-4 w-4 animate-spin" />
      <span v-else>{{ t('auth.signIn.submit') }}</span>
    </Button>
  </form>

  <div class="mt-4 text-center text-sm text-muted-foreground">
    {{ t('auth.signIn.noAccount') }}
    <NuxtLink to="/register" class="underline">
      {{ t('auth.signIn.signUpLink') }}
    </NuxtLink>
  </div>
</template>
