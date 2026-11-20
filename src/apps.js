// Catalogue of Odoo apps shown on the access page.
// Each model belongs to exactly one app. Resolution order: exact model match,
// then the longest matching prefix. Anything unmatched falls in "other".

/**
 * @typedef {object} App
 * @property {string} key
 * @property {{fr: string, en: string}} name
 * @property {{fr: string, en: string}} desc
 * @property {string} icon
 * @property {string[]} modules   Odoo technical module names (any installed => app installed)
 * @property {string[]} [models]  Exact model names
 * @property {string[]} [prefixes] Model name prefixes (e.g. "stock.")
 * @property {boolean} [sensitive]
 * @property {'none'|'read'} defaultLevel
 */

/** @type {App[]} */
export const APPS = [
  {
    key: 'base', icon: '🏢', modules: ['base'], defaultLevel: 'read',
    name: { fr: 'Données de base', en: 'Base data' },
    desc: { fr: 'Sociétés, devises, pays, unités de mesure', en: 'Companies, currencies, countries, units of measure' },
    models: ['res.company', 'res.currency', 'res.currency.rate', 'res.country', 'res.country.state', 'res.lang', 'uom.uom', 'uom.category'],
  },
  {
    key: 'contacts', icon: '📇', modules: ['contacts', 'base'], defaultLevel: 'read',
    name: { fr: 'Contacts', en: 'Contacts' },
    desc: { fr: 'Clients, fournisseurs, personnes', en: 'Customers, vendors, people' },
    models: ['res.partner', 'res.partner.category', 'res.partner.industry', 'res.partner.title'],
  },
  {
    key: 'crm', icon: '🤝', modules: ['crm'], defaultLevel: 'read',
    name: { fr: 'CRM', en: 'CRM' },
    desc: { fr: 'Pistes, opportunités, pipeline', en: 'Leads, opportunities, pipeline' },
    prefixes: ['crm.'],
  },
  {
    key: 'sales', icon: '🧾', modules: ['sale', 'sale_management'], defaultLevel: 'read',
    name: { fr: 'Ventes', en: 'Sales' },
    desc: { fr: 'Devis et commandes clients', en: 'Quotations and sales orders' },
    prefixes: ['sale.'],
    models: ['product.pricelist', 'product.pricelist.item'],
  },
  {
    key: 'products', icon: '🏷️', modules: ['product'], defaultLevel: 'read',
    name: { fr: 'Produits', en: 'Products' },
    desc: { fr: 'Articles, variantes, catégories', en: 'Products, variants, categories' },
    models: ['product.template', 'product.product', 'product.category', 'product.attribute', 'product.attribute.value', 'product.tag'],
  },
  {
    key: 'inventory', icon: '📦', modules: ['stock'], defaultLevel: 'read',
    name: { fr: 'Inventaire', en: 'Inventory' },
    desc: { fr: 'Stock, emplacements, transferts', en: 'Stock, locations, transfers' },
    prefixes: ['stock.'],
  },
  {
    key: 'purchase', icon: '🛒', modules: ['purchase'], defaultLevel: 'none',
    name: { fr: 'Achats', en: 'Purchase' },
    desc: { fr: 'Demandes de prix et commandes fournisseurs', en: 'RFQs and purchase orders' },
    prefixes: ['purchase.'],
    models: ['product.supplierinfo'],
  },
  {
    key: 'manufacturing', icon: '🏭', modules: ['mrp'], defaultLevel: 'none',
    name: { fr: 'Fabrication', en: 'Manufacturing' },
    desc: { fr: 'Nomenclatures, ordres de fabrication', en: 'Bills of materials, manufacturing orders' },
    prefixes: ['mrp.'],
  },
  {
    key: 'repair', icon: '🔧', modules: ['repair'], defaultLevel: 'none',
    name: { fr: 'Réparations', en: 'Repairs' },
    desc: { fr: 'Ordres de réparation', en: 'Repair orders' },
    prefixes: ['repair.'],
  },
  {
    key: 'projects', icon: '📋', modules: ['project'], defaultLevel: 'none',
    name: { fr: 'Projets', en: 'Projects' },
    desc: { fr: 'Projets, tâches, jalons', en: 'Projects, tasks, milestones' },
    prefixes: ['project.'],
  },
  {
    key: 'helpdesk', icon: '🎧', modules: ['helpdesk'], defaultLevel: 'none',
    name: { fr: 'Assistance', en: 'Helpdesk' },
    desc: { fr: 'Billets de support', en: 'Support tickets' },
    prefixes: ['helpdesk.'],
  },
  {
    key: 'calendar', icon: '📅', modules: ['calendar'], defaultLevel: 'none',
    name: { fr: 'Calendrier', en: 'Calendar' },
    desc: { fr: 'Rendez-vous et réunions', en: 'Meetings and appointments' },
    prefixes: ['calendar.'],
  },
  {
    key: 'activities', icon: '⏰', modules: ['mail'], defaultLevel: 'read',
    name: { fr: 'Activités', en: 'Activities' },
    desc: { fr: 'Rappels et tâches à faire planifiés', en: 'Scheduled reminders and to-dos' },
    models: ['mail.activity', 'mail.activity.type'],
  },
  {
    key: 'messages', icon: '💬', modules: ['mail'], defaultLevel: 'none', sensitive: true,
    name: { fr: 'Messages et notes', en: 'Messages and notes' },
    desc: { fr: 'Historique des échanges et notes internes', en: 'Chatter history and internal notes' },
    models: ['mail.message', 'mail.followers'],
  },
  {
    key: 'pos', icon: '🏪', modules: ['point_of_sale'], defaultLevel: 'none',
    name: { fr: 'Point de vente', en: 'Point of Sale' },
    desc: { fr: 'Ventes en magasin', en: 'In-store sales' },
    prefixes: ['pos.'],
  },
  {
    key: 'events', icon: '🎟️', modules: ['event'], defaultLevel: 'none',
    name: { fr: 'Événements', en: 'Events' },
    desc: { fr: 'Événements et inscriptions', en: 'Events and registrations' },
    prefixes: ['event.'],
  },
  {
    key: 'fleet', icon: '🚚', modules: ['fleet'], defaultLevel: 'none',
    name: { fr: 'Flotte', en: 'Fleet' },
    desc: { fr: 'Véhicules et contrats', en: 'Vehicles and contracts' },
    prefixes: ['fleet.'],
  },
  {
    key: 'accounting', icon: '💰', modules: ['account'], defaultLevel: 'none', sensitive: true,
    name: { fr: 'Facturation et comptabilité', en: 'Invoicing and accounting' },
    desc: { fr: 'Factures, paiements, écritures', en: 'Invoices, payments, journal entries' },
    prefixes: ['account.'],
  },
  {
    key: 'expenses', icon: '🧾', modules: ['hr_expense'], defaultLevel: 'none', sensitive: true,
    name: { fr: 'Notes de frais', en: 'Expenses' },
    desc: { fr: 'Dépenses des employés', en: 'Employee expenses' },
    prefixes: ['hr.expense'],
  },
  {
    key: 'recruitment', icon: '🧑‍💼', modules: ['hr_recruitment'], defaultLevel: 'none', sensitive: true,
    name: { fr: 'Recrutement', en: 'Recruitment' },
    desc: { fr: 'Candidats et postes', en: 'Applicants and job positions' },
    prefixes: ['hr.applicant', 'hr.candidate', 'hr.recruitment'],
  },
  {
    key: 'payroll', icon: '💵', modules: ['hr_payroll', 'hr_contract'], defaultLevel: 'none', sensitive: true,
    name: { fr: 'Paie et contrats', en: 'Payroll and contracts' },
    desc: { fr: 'Bulletins de paie, salaires, contrats', en: 'Payslips, salaries, contracts' },
    prefixes: ['hr.payslip', 'hr.contract', 'hr.salary', 'hr.payroll', 'hr.version'],
  },
  {
    key: 'employees', icon: '👥', modules: ['hr'], defaultLevel: 'none', sensitive: true,
    name: { fr: 'Employés et congés', en: 'Employees and time off' },
    desc: { fr: 'Fiches employés, départements, congés, présences', en: 'Employee records, departments, time off, attendance' },
    prefixes: ['hr.'],
  },
  {
    key: 'other', icon: '🧩', modules: [], defaultLevel: 'none',
    name: { fr: 'Autres modèles', en: 'Other models' },
    desc: { fr: 'Tout ce qui ne fait pas partie des apps ci-dessus', en: 'Anything not covered by the apps above' },
  },
];

// Technical / security-critical models. Never reachable, whatever the settings.
export const BLOCKED_PREFIXES = ['ir.', 'res.users', 'res.groups', 'res.config', 'base.', 'bus.', 'auth', 'iap.', 'mail.mail', 'fetchmail.', 'payment.provider', 'res.device'];

export const APP_BY_KEY = Object.fromEntries(APPS.map((a) => [a.key, a]));

export function isBlocked(model) {
  return BLOCKED_PREFIXES.some((p) => model === p || model.startsWith(p));
}

/** @returns {string} app key ("other" if unmatched). */
export function appForModel(model) {
  let best = null;
  let bestLen = -1;
  for (const app of APPS) {
    if (app.models?.includes(model)) return app.key;
    for (const p of app.prefixes || []) {
      if (model.startsWith(p) && p.length > bestLen) {
        best = app.key;
        bestLen = p.length;
      }
    }
  }
  return best || 'other';
}

/** Models we know by name for an app (used when ir.model is not readable). */
export function knownModels(appKey) {
  const app = APP_BY_KEY[appKey];
  return app?.models ? [...app.models] : [];
}

export const PRESETS = {
  readonly: { fr: 'Tout en lecture (sauf sensible)', en: 'Read everything (except sensitive)' },
  sales: { fr: 'Commercial', en: 'Sales team' },
  inventory: { fr: 'Inventaire', en: 'Inventory' },
  accounting: { fr: 'Comptable', en: 'Accountant' },
  minimal: { fr: 'Le minimum', en: 'Minimal' },
};

/** @returns {Record<string, 'none'|'read'>} */
export function presetLevels(preset) {
  const levels = Object.fromEntries(APPS.map((a) => [a.key, 'none']));
  const on = (...keys) => keys.forEach((k) => (levels[k] = 'read'));
  switch (preset) {
    case 'readonly':
      APPS.filter((a) => !a.sensitive && a.key !== 'other').forEach((a) => (levels[a.key] = 'read'));
      break;
    case 'sales':
      on('base', 'contacts', 'crm', 'sales', 'products', 'activities', 'calendar');
      break;
    case 'inventory':
      on('base', 'contacts', 'products', 'inventory', 'purchase', 'manufacturing', 'repair');
      break;
    case 'accounting':
      on('base', 'contacts', 'sales', 'purchase', 'products', 'accounting', 'expenses');
      break;
    case 'minimal':
      on('base', 'contacts');
      break;
    default:
      return defaultLevels();
  }
  return levels;
}

export function defaultLevels() {
  return Object.fromEntries(APPS.map((a) => [a.key, a.defaultLevel]));
}
