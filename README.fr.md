# Odoo Connect MCP

**Parle à ton Odoo depuis Claude, ChatGPT ou toute autre IA compatible MCP.**
Tu choisis exactement ce que l'IA peut voir, app par app. Ta clé reste sur ton ordinateur.

[English version](README.md)

> 🧪 **Version 0.1 : lecture seule.** L'IA peut consulter et analyser ton Odoo, mais pas encore le modifier.

---

## Installation en 3 étapes (5 minutes)

**Il te faut :** [Node.js](https://nodejs.org) (bouton « LTS ») et ton Odoo (Online, Odoo.sh ou auto-hébergé, version 16 à 19).

### 1. Lance la configuration

Ouvre un terminal (Mac : app *Terminal* · Windows : *PowerShell*) et colle :

```bash
npx -y odoo-connect-mcp setup
```

Une page s'ouvre dans ton navigateur.

### 2. Remplis la page

1. **Connexion** : l'adresse de ton Odoo, ton courriel et une **clé API**. La page explique comment créer la clé ([guide avec détails](docs/cle-api-odoo.md)).
2. **Accès** : pour chaque app installée (CRM, Ventes, Inventaire…), choisis **Aucun** ou **Lire**. Les apps sensibles (Comptabilité, Paie, Employés, Messages) sont désactivées par défaut.
3. **Connecter ton IA** : clique sur **Configurer Claude Desktop**, ou copie la commande pour Claude Code.

### 3. Redémarre ton IA et pose une question

> « Qu'est-ce que tu peux voir dans mon Odoo ? »

C'est tout. 🎉

### 🤖 Tu préfères te faire guider par ton IA ?

Copie le contenu de [SETUP-PROMPT.md](SETUP-PROMPT.md) dans Claude ou ChatGPT : l'IA t'accompagne une étape à la fois.

---

## Exemples de questions

- « Total des ventes confirmées ce mois-ci, par vendeur »
- « Quelles opportunités n'ont aucune activité prévue ? »
- « Quels produits sont en rupture de stock ? »
- « Retrouve la ferme de Cookshire qui a demandé un devis »

Prompts intégrés (menu « / » ou « + » de ton IA) : résumé des ventes, relances, stock bas, factures en retard.

## Changer les accès

Relance `npx -y odoo-connect-mcp setup`, modifie, enregistre, puis redémarre ton IA.
**L'IA ne peut jamais modifier ses propres accès.**

## Sécurité

- **Fermé par défaut** : les apps sensibles sont désactivées et les modèles techniques (`ir.*`, utilisateurs, groupes, paramètres) ne sont **jamais** accessibles.
- **Ne dépasse jamais Odoo** : l'IA a au plus les droits de ton utilisateur Odoo. La page ne fait que *réduire* ces droits.
- **Les choix sont appliqués côté serveur** : une app réglée sur « Aucun » est refusée, même si l'IA essaie de passer par un champ lié (ex. `employee_id.name`).
- **Ta clé reste chez toi** : elle est enregistrée dans un fichier lisible par toi seul (`~/.config/odoo-mcp/config.json`, ou `%APPDATA%\odoo-mcp\config.json` sur Windows). Rien n'est envoyé ailleurs qu'à ton Odoo.
- **Conseil** : crée une clé API dédiée à l'IA, avec une date d'expiration. Tu peux la révoquer en tout temps dans Odoo.

## Dépannage

```bash
npx -y odoo-connect-mcp doctor
```

| Message | Solution |
|---|---|
| « Odoo refuse la connexion » | Vérifie le courriel et la clé. Si la clé a expiré, crée-en une nouvelle. |
| « Impossible de joindre… » | Copie l'adresse exacte depuis ton navigateur. |
| « plusieurs bases » | Indique le nom de la base dans *Options avancées*. |
| L'IA ne voit pas Odoo | Quitte complètement l'app de l'IA (pas seulement la fenêtre) et rouvre-la. |
| « Accès non autorisé » | C'est ton réglage d'accès : relance `setup` si tu veux l'ouvrir. |

## Feuille de route

- [x] **0.1** : lecture, page d'accès par app, configuration automatique de Claude Desktop/Code, Odoo 16 à 19
- [ ] **0.2** : modifications avec confirmation (« Lire + Modifier »), réglage modèle par modèle, champs cachés, « seulement mes dossiers », installation en un clic pour Claude Desktop (`.mcpb`)
- [ ] **0.3** : version web pour ChatGPT et claude.ai (bouton « Deploy to Cloudflare », Docker)
- [ ] **0.4** : prompts métier, guides avec captures d'écran

## Pour les développeurs

```bash
git clone <ce dépôt> && cd odoo-mcp && npm install
npm test                    # tests avec un Odoo simulé (JSON-RPC 17 et JSON-2 19)
node bin/odoo-connect-mcp.js setup
```

Structure : `src/odoo.js` (client Odoo), `src/apps.js` (catalogue des apps), `src/access.js` (règles d'accès), `src/server.js` (outils MCP), `src/setup/` (page de configuration).

Licence MIT.
