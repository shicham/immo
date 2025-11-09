# Améliorations de l'Authentification et de l'Autorisation

## Vue d'ensemble

Ce document décrit les améliorations apportées au système d'authentification et d'autorisation de l'application admin.

## Nouvelles fonctionnalités

### 1. Store Pinia pour l'authentification (`app/stores/auth.ts`)

Un store centralisé qui gère l'état d'authentification avec:

- **État**: utilisateur, tokens (access/refresh), statut d'authentification, état de chargement
- **Getters**: 
  - `isAdmin`: vérifie si l'utilisateur a le rôle admin
  - `hasPermission`: vérifie si l'utilisateur a une permission spécifique
  - `userInitials`: génère les initiales de l'utilisateur
- **Actions**:
  - `login`: authentifie l'utilisateur
  - `register`: inscription avec validation complète
  - `logout`: déconnexion et nettoyage
  - `refreshAccessToken`: renouvellement automatique du token
  - `initializeAuth`: initialisation depuis localStorage
  - `checkPermission`: vérification de permission
  - `hasRole`: vérification de rôle

### 2. Middleware d'authentification

#### `middleware/auth.global.ts`
- Middleware global qui protège automatiquement toutes les routes
- Redirige vers `/login` si non authentifié
- Redirige vers `/` si déjà authentifié et accès aux pages d'auth
- Liste des routes publiques configurables

#### `middleware/role.ts`
- Middleware pour la vérification des rôles et permissions
- Utilisation via meta de route:
  ```typescript
  definePageMeta({
    middleware: 'role',
    requiredRole: 'admin',
    // ou
    requiredPermission: 'edit:users'
  })
  ```

### 3. Composants améliorés

#### SignIn (`app/components/auth/SignIn.vue`)
- Validation en temps réel des champs
- Messages d'erreur spécifiques par champ
- Intégration avec le store Pinia
- Support OAuth (Apple, Google) - prêt pour l'implémentation

#### SignUp (`app/components/auth/SignUp.vue`)
- Validation complète du formulaire:
  - Nom: minimum 2 caractères
  - Email: format valide
  - Mot de passe: 
    - Minimum 8 caractères
    - Au moins 1 majuscule
    - Au moins 1 minuscule
    - Au moins 1 chiffre
    - Au moins 1 caractère spécial
  - Confirmation du mot de passe
- Indicateur de force du mot de passe avec barre visuelle
- Messages de succès/erreur
- Auto-login après inscription réussie

### 4. Types TypeScript

Interface `User`:
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

### 5. Plugin d'initialisation

`app/plugins/auth.client.ts` initialise automatiquement l'état d'authentification au chargement de l'application.

## Configuration API

Les endpoints sont configurés dans `nuxt.config.ts`:
```typescript
runtimeConfig: {
  public: {
    apiBaseUrl: 'https://api.viridial.com',
    apiLoginEndpoint: '/api/v1/auth/login',
    apiRegisterEndpoint: '/api/v1/auth/register',
    apiRefreshEndpoint: '/api/v1/auth/refresh',
  },
}
```

## Utilisation

### Dans un composant:
```typescript
const authStore = useAuthStore()

// Connexion
await authStore.login(email, password)

// Vérifier si admin
if (authStore.isAdmin) {
  // Actions admin
}

// Vérifier permission
if (authStore.checkPermission('edit:users')) {
  // Action autorisée
}

// Déconnexion
authStore.logout()
```

### Protéger une route avec un rôle:
```typescript
// pages/admin/users.vue
definePageMeta({
  middleware: 'role',
  requiredRole: 'admin'
})
```

## Sécurité

1. **Tokens stockés dans localStorage**: Pour une sécurité accrue, considérer httpOnly cookies
2. **Validation côté client**: Ne remplace pas la validation serveur
3. **Refresh token**: Mécanisme automatique de renouvellement
4. **Protection CSRF**: À implémenter côté serveur

## Prochaines étapes recommandées

1. **Vérification d'email**: Ajouter un flux de confirmation par email
2. **Authentification à deux facteurs (2FA)**: Support OTP
3. **Session timeout**: Déconnexion automatique après inactivité
4. **HttpOnly cookies**: Migration depuis localStorage pour plus de sécurité
5. **Rate limiting**: Protection contre les attaques par force brute
6. **Historique de connexion**: Traçabilité des connexions

## Tests

Pour tester le système:

1. Accéder à `/register` pour créer un compte
2. Le formulaire valide:
   - Format email
   - Force du mot de passe
   - Correspondance des mots de passe
3. Après inscription réussie, redirection automatique vers `/`
4. Tenter d'accéder à une page protégée sans authentification → redirection vers `/login`
5. Se connecter avec les identifiants créés
6. Test de déconnexion

## Support

Pour toute question ou problème, consulter la documentation Nuxt 3 et Pinia.

## Internationalization (i18n)

Ce projet utilise le module `@nuxtjs/i18n` pour la gestion multilingue de l'application.

### Configuration

Le module est configuré dans `nuxt.config.ts` avec les locales suivantes :
- **Anglais (en)** - langue par défaut
- **Français (fr)**
- **Arabe (ar)** - avec support RTL automatique

### Fichiers de traduction

Les traductions sont stockées dans le répertoire `/locales` :
- `locales/en.json` - Traductions anglaises
- `locales/fr.json` - Traductions françaises
- `locales/ar.json` - Traductions arabes

### Structure des traductions

Les traductions sont organisées par namespace :
```json
{
  "auth": {
    "signIn": { ... },
    "signUp": { ... }
  },
  "common": { ... }
}
```

### Ajouter de nouvelles traductions

1. Ouvrir les trois fichiers de locale dans `/locales`
2. Ajouter la nouvelle clé de traduction dans la même structure dans chaque fichier
3. Utiliser dans le code avec `$t('cle.de.traduction')` ou `t('cle.de.traduction')` après avoir appelé `useI18n()`

### Changer de langue

La langue peut être changée en utilisant :
```javascript
const { locale } = useI18n()
locale.value = 'fr' // ou 'en' ou 'ar'
```

Ou via localStorage pour persister la préférence :
```javascript
localStorage.setItem('locale', 'fr')
// Puis recharger la page
```

### Support RTL

Le support RTL pour l'arabe est automatique grâce au plugin `app/plugins/i18n-rtl.client.ts` qui surveille les changements de locale et ajuste la direction du document.

