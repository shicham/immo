# Guide Rapide - Système d'Authentification

## 🚀 Démarrage Rapide

### Installation
Le système est déjà configuré. Assurez-vous d'avoir les dépendances installées :
```bash
pnpm install
```

### Configuration
Les endpoints API sont dans `nuxt.config.ts` :
```typescript
apiBaseUrl: 'https://api.viridial.com'
apiLoginEndpoint: '/api/v1/auth/login'
apiRegisterEndpoint: '/api/v1/auth/register'
apiRefreshEndpoint: '/api/v1/auth/refresh'
```

## 📝 Utilisation

### Dans un composant Vue

```typescript
<script setup lang="ts">
const authStore = useAuthStore()

// Connexion
const login = async () => {
  const result = await authStore.login(email, password)
  if (result.success) {
    navigateTo('/')
  }
}

// Vérifier les permissions
const canEdit = authStore.hasPermission('edit:users')
const isAdmin = authStore.isAdmin

// Déconnexion
const logout = () => authStore.logout()
</script>
```

### Protéger une route

```typescript
// pages/admin/dashboard.vue
definePageMeta({
  middleware: 'role',
  requiredRole: 'admin'
})
```

## 🔐 Validation des Mots de Passe

Le système valide automatiquement :
- ✅ Minimum 8 caractères
- ✅ Au moins 1 majuscule
- ✅ Au moins 1 minuscule
- ✅ Au moins 1 chiffre
- ✅ Au moins 1 caractère spécial (@$!%*?&)

## 🎨 Composants

### Formulaire de Connexion
- Chemin : `/login`
- Composant : `app/components/auth/SignIn.vue`
- Validation en temps réel
- Messages d'erreur par champ

### Formulaire d'Inscription
- Chemin : `/register`
- Composant : `app/components/auth/SignUp.vue`
- Indicateur de force du mot de passe
- Validation complète
- Auto-login après inscription

## 📊 Structure des Données

### Utilisateur
```typescript
interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user' | 'guest'
  avatar?: string
  permissions?: string[]
}
```

### Réponse API
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": { ... },
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG..."
  }
}
```

## 🛡️ Middleware

### Middleware Global (auth.global.ts)
Protège automatiquement toutes les routes sauf :
- `/login`
- `/register`
- `/forgot-password`
- `/otp*`

### Middleware de Rôle (role.ts)
Vérifie les rôles et permissions spécifiques.

## 🔄 Flux d'Authentification

1. **Inscription/Connexion** → Store Pinia
2. **Store** → API Backend
3. **API** → Retour tokens + user
4. **Store** → Sauvegarde localStorage
5. **Middleware** → Vérifie authentification
6. **Application** → Accès autorisé

## 📚 Documentation Complète

- `docs/AUTH_IMPROVEMENTS.md` - Fonctionnalités détaillées
- `docs/AUTH_ARCHITECTURE.md` - Architecture et diagrammes

## 🎯 Fonctionnalités Clés

- ✅ Store Pinia centralisé
- ✅ Middleware de protection automatique
- ✅ Validation en temps réel
- ✅ Indicateur de force du mot de passe
- ✅ Refresh token automatique
- ✅ Système de rôles et permissions
- ✅ Types TypeScript complets
- ✅ Messages d'erreur contextuels

## 🔧 Personnalisation

### Ajouter un nouveau rôle
```typescript
// app/stores/auth.ts
type UserRole = 'admin' | 'user' | 'guest' | 'moderator' // Ajouter ici
```

### Ajouter une permission
```typescript
// Dans le composant
if (authStore.checkPermission('custom:action')) {
  // Action personnalisée
}
```

### Modifier les routes publiques
```typescript
// middleware/auth.global.ts
const publicRoutes = [
  '/login',
  '/register',
  '/custom-public-page' // Ajouter ici
]
```

## 🐛 Dépannage

### Problème : Redirection infinie
- Vérifier que l'utilisateur est bien dans localStorage
- Vérifier l'initialisation du store dans `app/plugins/auth.client.ts`

### Problème : Token expiré
- Le refresh est automatique
- Vérifier l'endpoint `/api/v1/auth/refresh`

### Problème : Validation échoue
- Vérifier le format des données envoyées
- Consulter les messages d'erreur du formulaire

## 📞 Support

Pour plus d'informations :
- Documentation Nuxt 3 : https://nuxt.com
- Documentation Pinia : https://pinia.vuejs.org
- Shadcn Vue : https://shadcn-vue.com
