// Detects which apps are installed in an Odoo database.
// 1) ir.module.module (needs admin-ish rights on some setups)
// 2) ir.model lookup of one characteristic model per app
// 3) give up: every app is shown as "maybe installed"

import { APPS } from './apps.js';

export const PROBES = {
  base: 'res.company', contacts: 'res.partner', crm: 'crm.lead', sales: 'sale.order',
  products: 'product.template', inventory: 'stock.quant', purchase: 'purchase.order',
  manufacturing: 'mrp.production', repair: 'repair.order', projects: 'project.task',
  helpdesk: 'helpdesk.ticket', calendar: 'calendar.event', activities: 'mail.activity',
  messages: 'mail.message', pos: 'pos.order', events: 'event.event', fleet: 'fleet.vehicle',
  accounting: 'account.move', expenses: 'hr.expense', recruitment: 'hr.applicant',
  payroll: 'hr.payslip', employees: 'hr.employee',
};

/**
 * @param {import('./odoo.js').OdooClient} client
 * @returns {Promise<{method: string, installed: Record<string, boolean|null>}>}
 */
export async function detectApps(client) {
  const installed = {};
  try {
    const modules = [...new Set(APPS.flatMap((a) => a.modules))];
    const rows = await client.execute('ir.module.module', 'search_read', {
      domain: [['state', '=', 'installed'], ['name', 'in', modules]],
      fields: ['name'],
    });
    const names = new Set(rows.map((r) => r.name));
    for (const app of APPS) installed[app.key] = app.key === 'other' ? true : app.modules.some((m) => names.has(m));
    return { method: 'modules', installed };
  } catch {
    /* try next method */
  }
  try {
    const rows = await client.execute('ir.model', 'search_read', {
      domain: [['model', 'in', Object.values(PROBES)]],
      fields: ['model'],
    });
    const names = new Set(rows.map((r) => r.model));
    for (const app of APPS) installed[app.key] = app.key === 'other' ? true : names.has(PROBES[app.key]);
    return { method: 'models', installed };
  } catch {
    for (const app of APPS) installed[app.key] = null;
    return { method: 'unknown', installed };
  }
}
