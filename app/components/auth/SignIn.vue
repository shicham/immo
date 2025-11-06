<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from '#app'
import { Loader2 } from 'lucide-vue-next'

// state
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const router = useRouter()

// runtime config
const config = useRuntimeConfig()
const API_URL = `${config.public.apiBaseUrl}${config.public.apiLoginEndpoint}`

// simulate full login flow
async function onSubmit(event: Event) {
  event.preventDefault()
  errorMessage.value = ''

  if (!email.value || !password.value) {
    errorMessage.value = 'Veuillez entrer votre email et mot de passe.'
    return
  }

  isLoading.value = true

  try {
    const { data, error, status } = await useFetch(API_URL, {
      method: 'POST',
      body: { email: email.value, password: password.value },
      headers: { 'Content-Type': 'application/json' }
    })

    if (error.value || !data.value) {
      errorMessage.value =
        error.value?.data?.message || 'Erreur de connexion au serveur.'
      return
    }

    const response = data.value as {
      success: boolean
      message: string
      data?: {
        user: Record<string, any>
        accessToken: string
        refreshToken: string
      }
    }

    // ✅ Cas KO
    if (!response.success) {
      errorMessage.value = response.message || 'Identifiants incorrects.'
      return
    }

    // ✅ Cas OK
    const tokens = response.data
    if (tokens?.accessToken) {
      // Stockage local sécurisé
      localStorage.setItem('accessToken', tokens.accessToken)
      localStorage.setItem('refreshToken', tokens.refreshToken)

      // (Optionnel) Stocker les infos user
      localStorage.setItem('user', JSON.stringify(response.data.user))

      // Redirection post-login
      await router.push('/')
    } else {
      errorMessage.value = 'Réponse inattendue du serveur.'
    }
  } catch (err: any) {
    errorMessage.value =
      err.message || 'Une erreur est survenue. Veuillez réessayer.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <form class="grid gap-6" @submit="onSubmit" novalidate>
    <div class="flex flex-col gap-4">
      <Button variant="outline" class="w-full gap-2">Login with Apple</Button>
      <Button variant="outline" class="w-full gap-2">Login with Google</Button>
    </div>

    <Separator label="Ou continuer avec" />

    <div class="grid gap-2">
      <Label for="email">Email</Label>
      <Input
        id="email"
        v-model="email"
        type="email"
        placeholder="name@example.com"
        :disabled="isLoading"
        autocomplete="email"
      />
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
      <PasswordInput id="password" v-model="password" />
    </div>

    <!-- message d'erreur -->
    <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>

    <!-- bouton -->
    <Button type="submit" class="w-full" :disabled="isLoading">
      <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
      <span v-else>Se connecter</span>
    </Button>
  </form>

  <div class="mt-4 text-center text-sm text-muted-foreground">
    Pas encore de compte ?
    <NuxtLink to="/register" class="underline">Inscrivez-vous</NuxtLink>
  </div>
</template>