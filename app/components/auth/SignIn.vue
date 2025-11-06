<script setup lang="ts">
import { useRouter } from '#app'
import { Loader2 } from 'lucide-vue-next'
import { ref } from 'vue'

const authStore = useAuthStore()
const router = useRouter()

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
    emailError.value = 'L\'email est requis.'
    return false
  }
  if (!emailRegex.test(email.value)) {
    emailError.value = 'Email invalide.'
    return false
  }
  emailError.value = ''
  return true
}

function validatePassword() {
  if (!password.value) {
    passwordError.value = 'Le mot de passe est requis.'
    return false
  }
  if (password.value.length < 6) {
    passwordError.value = 'Le mot de passe doit contenir au moins 6 caractères.'
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
    errorMessage.value = result.error || 'Erreur de connexion.'
  }
}
</script>

<template>
  <form class="grid gap-6" novalidate @submit="onSubmit">
    <div class="flex flex-col gap-4">
      <Button variant="outline" class="w-full gap-2">
        Login with Apple
      </Button>
      <Button variant="outline" class="w-full gap-2">
        Login with Google
      </Button>
    </div>

    <Separator label="Ou continuer avec" />

    <div class="grid gap-2">
      <Label for="email">Email</Label>
      <Input
        id="email"
        v-model="email"
        type="email"
        placeholder="name@example.com"
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
        <Label for="password">Mot de passe</Label>
        <NuxtLink
          to="/forgot-password"
          class="text-sm underline text-muted-foreground"
        >
          Mot de passe oublié ?
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
      <span v-else>Se connecter</span>
    </Button>
  </form>

  <div class="mt-4 text-center text-sm text-muted-foreground">
    Pas encore de compte ?
    <NuxtLink to="/register" class="underline">
      Inscrivez-vous
    </NuxtLink>
  </div>
</template>
