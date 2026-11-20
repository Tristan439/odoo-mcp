// Short user-facing messages. The AI relays them, so they must be plain and actionable.

const M = {
  fr: {
    no_config: "Odoo n'est pas encore configuré. Lance `npx -y odoo-connect-mcp setup` dans un terminal : une page s'ouvre pour connecter ton Odoo et choisir les accès.",
    bad_url: "L'adresse Odoo n'est pas valide. Exemple : https://monentreprise.odoo.com",
    network: "Impossible de joindre {url}. Vérifie l'adresse (copie-la depuis ton navigateur quand tu es connecté à Odoo) et ta connexion Internet.",
    not_odoo: "{url} répond, mais ça ne ressemble pas à un Odoo. Vérifie l'adresse.",
    auth: "Odoo refuse la connexion. Vérifie le courriel (celui que tu utilises pour te connecter à Odoo) et la clé API. Si la clé a expiré, crée-en une nouvelle : Odoo → ton avatar → Mon profil → Sécurité du compte → Nouvelle clé API.",
    db: "Odoo ne trouve pas la base de données « {db} ». Indique le nom exact dans le champ « Base de données » de la page de configuration (souvent le début de l'adresse, ex. monentreprise).",
    db_ambiguous: "Ce serveur Odoo contient plusieurs bases. Indique laquelle utiliser dans le champ « Base de données ».",
    odoo_access: "Ton utilisateur Odoo n'a pas le droit de faire ça dans Odoo ({detail}). C'est une permission Odoo : demande à ton administrateur Odoo.",
    policy_denied: "Accès non autorisé : « {model} » fait partie de l'app « {app} », qui est réglée sur « {level} » dans tes accès. Pour changer ça, la personne doit relancer `npx -y odoo-connect-mcp setup` (l'IA ne peut pas modifier ses propres accès).",
    blocked: "« {model} » est un modèle technique ou de sécurité. Il n'est jamais accessible par l'IA.",
    unknown_model: "Le modèle « {model} » n'existe pas dans cet Odoo (ou l'app n'est pas installée).",
    odoo_error: "Odoo a répondu par une erreur : {detail}",
  },
  en: {
    no_config: 'Odoo is not configured yet. Run `npx -y odoo-connect-mcp setup` in a terminal: a page opens to connect your Odoo and choose what the AI can access.',
    bad_url: 'The Odoo address is not valid. Example: https://mycompany.odoo.com',
    network: 'Cannot reach {url}. Check the address (copy it from your browser while logged in to Odoo) and your internet connection.',
    not_odoo: "{url} answers, but it doesn't look like Odoo. Check the address.",
    auth: 'Odoo refused the login. Check the email (the one you use to log in to Odoo) and the API key. If the key expired, create a new one: Odoo → your avatar → My Profile → Account Security → New API Key.',
    db: 'Odoo cannot find the database "{db}". Enter the exact name in the "Database" field of the setup page (often the start of the address, e.g. mycompany).',
    db_ambiguous: 'This Odoo server hosts several databases. Enter which one to use in the "Database" field.',
    odoo_access: "Your Odoo user isn't allowed to do this in Odoo ({detail}). This is an Odoo permission: ask your Odoo administrator.",
    policy_denied: 'Access not allowed: "{model}" belongs to the "{app}" app, which is set to "{level}" in your access settings. To change this, the person must run `npx -y odoo-connect-mcp setup` again (the AI cannot change its own access).',
    blocked: '"{model}" is a technical or security model. It is never available to the AI.',
    unknown_model: 'The model "{model}" does not exist in this Odoo (or the app is not installed).',
    odoo_error: 'Odoo returned an error: {detail}',
  },
};

let current = 'fr';

export function setLang(lang) {
  current = lang === 'en' ? 'en' : 'fr';
}

export function getLang() {
  return current;
}

export function t(key, vars = {}) {
  const str = M[current][key] ?? M.en[key] ?? key;
  return str.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
}
