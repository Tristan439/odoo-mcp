# Créer ta clé API Odoo

[English](odoo-api-key.md)

Une clé API, c'est un mot de passe spécial pour les applications. Elle permet à l'IA de se connecter à Odoo **avec tes droits**, sans connaître ton vrai mot de passe. Tu peux la révoquer en tout temps.

## Étapes (1 minute)

1. Connecte-toi à Odoo.
2. Clique sur **ton avatar** en haut à droite → **Mon profil** (dans certaines versions : **Préférences**).
3. Ouvre l'onglet **Sécurité du compte**.
4. Clique sur **Nouvelle clé API**.
5. Confirme ton mot de passe.
6. Donne un nom à la clé, par exemple `IA`, et choisis une **durée** (90 jours est un bon choix).
7. **Copie la clé** et colle-la dans la page de configuration. Odoo ne la montre qu'**une seule fois**.

## Je ne vois pas « Sécurité du compte » ou « Nouvelle clé API »

- Active le **mode développeur** : Paramètres → tout en bas → *Activer le mode développeur*. Puis recommence.
- Ton utilisateur n'a peut-être pas le droit de créer des clés : demande à ton administrateur Odoo.

## Bonnes pratiques

- **Une clé par usage** (ex. `IA - ordinateur bureau`). C'est plus facile de révoquer seulement celle-là.
- **Mets une date d'expiration.** À l'expiration, l'IA te dira que la connexion est refusée : crée une nouvelle clé et relance `npx -y odoo-connect-mcp setup`.
- **Ne colle jamais ta clé dans une conversation avec une IA.** Elle se tape seulement dans la page de configuration, sur ton ordinateur.
- **Pour révoquer** : Mon profil → Sécurité du compte → icône de corbeille à côté de la clé.

## Utilisateur dédié (optionnel, recommandé en entreprise)

Pour limiter encore plus les accès, crée un utilisateur Odoo réservé à l'IA, avec seulement les droits nécessaires (ex. Ventes : *Utilisateur : ses propres documents*), et crée la clé API avec cet utilisateur.
