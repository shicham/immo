# Architecture du Système d'Authentification

## Flux d'authentification

```
┌─────────────────────────────────────────────────────────────────┐
│                      Utilisateur                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Pages d'authentification                        │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │  /login          │  │  /register       │                    │
│  │  SignIn.vue      │  │  SignUp.vue      │                    │
│  └──────────────────┘  └──────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Store Pinia (auth.ts)                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ State:                                                     │ │
│  │ - user: User | null                                       │ │
│  │ - accessToken: string | null                              │ │
│  │ - refreshToken: string | null                             │ │
│  │ - isAuthenticated: boolean                                │ │
│  │                                                            │ │
│  │ Actions:                                                  │ │
│  │ - login(email, password)                                  │ │
│  │ - register(name, email, password, confirmPassword)        │ │
│  │ - logout()                                                │ │
│  │ - refreshAccessToken()                                    │ │
│  │ - initializeAuth()                                        │ │
│  │                                                            │ │
│  │ Getters:                                                  │ │
│  │ - isAdmin                                                 │ │
│  │ - hasPermission(permission)                               │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Backend                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ POST /api/v1/auth/login                                   │ │
│  │ POST /api/v1/auth/register                                │ │
│  │ POST /api/v1/auth/refresh                                 │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Middleware                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ auth.global.ts - Protection des routes                   │ │
│  │ role.ts - Vérification des rôles et permissions          │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              Pages protégées de l'application                    │
│  - Dashboard (/)                                                 │
│  - Settings (/settings/*)                                        │
│  - Admin pages (avec vérification de rôle)                      │
└─────────────────────────────────────────────────────────────────┘
```

## Flux d'inscription

1. **Utilisateur remplit le formulaire** (`/register`)
   - Nom complet
   - Email
   - Mot de passe (avec indicateur de force)
   - Confirmation du mot de passe

2. **Validation côté client**
   - Format email valide
   - Nom minimum 2 caractères
   - Mot de passe: 8+ caractères, majuscule, minuscule, chiffre, caractère spécial
   - Correspondance des mots de passe

3. **Envoi à l'API** (`POST /api/v1/auth/register`)
   ```json
   {
     "name": "John Doe",
     "email": "john@example.com",
     "password": "SecureP@ss123"
   }
   ```

4. **Réponse de l'API**
   ```json
   {
     "success": true,
     "message": "Inscription réussie",
     "data": {
       "user": {
         "id": "123",
         "name": "John Doe",
         "email": "john@example.com",
         "role": "user",
         "permissions": []
       },
       "accessToken": "eyJhbG...",
       "refreshToken": "eyJhbG..."
     }
   }
   ```

5. **Stockage local**
   - accessToken → localStorage
   - refreshToken → localStorage
   - user → localStorage

6. **Redirection** vers `/`

## Flux de connexion

1. **Utilisateur remplit le formulaire** (`/login`)
   - Email
   - Mot de passe

2. **Validation côté client**
   - Email requis et format valide
   - Mot de passe requis (6+ caractères)

3. **Envoi à l'API** (`POST /api/v1/auth/login`)
   ```json
   {
     "email": "john@example.com",
     "password": "SecureP@ss123"
   }
   ```

4. **Réponse de l'API** (même format que register)

5. **Mise à jour du store Pinia**
   - user
   - accessToken
   - refreshToken
   - isAuthenticated = true

6. **Redirection** vers `/`

## Protection des routes

### Middleware global (`auth.global.ts`)

```typescript
Routes publiques (accès libre):
- /login
- /login-basic
- /register
- /forgot-password
- /otp, /otp-1, /otp-2

Toutes les autres routes:
- Vérifie isAuthenticated
- Si non authentifié → redirige vers /login
- Si authentifié → accès autorisé
```

### Middleware de rôle (`role.ts`)

```typescript
// Dans une page qui nécessite un rôle admin
definePageMeta({
  middleware: 'role',
  requiredRole: 'admin'
})

// Ou une permission spécifique
definePageMeta({
  middleware: 'role',
  requiredPermission: 'edit:users'
})
```

## Refresh Token

Le token d'accès expire après un certain temps. Le refresh token permet de renouveler l'accès sans redemander les identifiants.

```typescript
// Appelé automatiquement quand le token expire
async refreshAccessToken() {
  // POST /api/v1/auth/refresh
  // Body: { refreshToken: "..." }
  // Response: { accessToken: "new_token" }
}
```

## Types TypeScript

```typescript
interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user' | 'guest'
  avatar?: string
  permissions?: string[]
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}
```

## Sécurité

### ✅ Implémenté
- Validation des mots de passe forts
- Tokens stockés localement
- Refresh token automatique
- Middleware de protection des routes
- Système de rôles et permissions

### 🔄 À implémenter
- HttpOnly cookies (plus sécurisé que localStorage)
- Rate limiting côté serveur
- Vérification d'email
- 2FA (authentification à deux facteurs)
- Session timeout
- Protection CSRF
- Historique de connexion
