// A tiny in-memory Odoo that answers like the real HTTP APIs.
// Supports: version_info, database/list, common.authenticate, execute_kw (JSON-RPC)
// and /json/2/<model>/<method> (JSON-2), for a handful of methods.

const FIELDS = {
  'res.users': { id: { type: 'integer', string: 'ID' }, name: { type: 'char', string: 'Name' }, login: { type: 'char', string: 'Login' } },
  'res.partner': {
    id: { type: 'integer', string: 'ID' },
    name: { type: 'char', string: 'Name' },
    email: { type: 'char', string: 'Email' },
    city: { type: 'char', string: 'City' },
    user_id: { type: 'many2one', string: 'Salesperson', relation: 'res.users' },
    image_1920: { type: 'binary', string: 'Image' },
    message_ids: { type: 'one2many', string: 'Messages', relation: 'mail.message' },
  },
  'sale.order': {
    id: { type: 'integer', string: 'ID' },
    name: { type: 'char', string: 'Order Reference' },
    partner_id: { type: 'many2one', string: 'Customer', relation: 'res.partner' },
    amount_total: { type: 'monetary', string: 'Total' },
    state: { type: 'selection', string: 'Status', selection: [['draft', 'Quotation'], ['sale', 'Sales Order']] },
    employee_id: { type: 'many2one', string: 'Employee', relation: 'hr.employee' },
  },
  'hr.employee': { id: { type: 'integer', string: 'ID' }, name: { type: 'char', string: 'Name' }, wage: { type: 'monetary', string: 'Wage' } },
};

const DATA = {
  'res.users': [{ id: 2, name: 'Marie Admin', login: 'marie@example.com' }],
  'res.partner': [
    { id: 1, name: 'Ferme Tremblay', email: 'info@tremblay.example', city: 'Cookshire', user_id: 2, image_1920: 'AAAA' },
    { id: 2, name: 'Agri Nord', email: 'contact@agrinord.example', city: 'Rimouski', user_id: 2, image_1920: false },
    { id: 3, name: 'Bergeron & fils', email: null, city: 'Cookshire', user_id: false, image_1920: false },
  ],
  'sale.order': [
    { id: 10, name: 'S00010', partner_id: 1, amount_total: 1500, state: 'sale', employee_id: 1 },
    { id: 11, name: 'S00011', partner_id: 1, amount_total: 500, state: 'sale', employee_id: 1 },
    { id: 12, name: 'S00012', partner_id: 2, amount_total: 900, state: 'draft', employee_id: 1 },
  ],
  'hr.employee': [{ id: 1, name: 'Jean', wage: 55000 }],
};

const MODULES = ['base', 'contacts', 'sale', 'hr', 'mail'];

function displayName(model, id) {
  const r = DATA[model]?.find((x) => x.id === id);
  return r ? r.name : String(id);
}

function match(rec, domain) {
  // Supports implicit AND of simple leaves, plus "|" for two leaves.
  const evalLeaf = ([f, op, v]) => {
    let val = rec[f];
    if (f.includes('.')) {
      const [rel, sub] = f.split('.');
      const relModel = FIELDS[Object.keys(FIELDS).find((m) => DATA[m] === Object.values(DATA).find((d) => d.includes(rec)))]?.[rel]?.relation;
      val = DATA[relModel]?.find((x) => x.id === rec[rel])?.[sub];
    }
    switch (op) {
      case '=': return val === v || (v === false && !val);
      case '!=': return val !== v;
      case '>': return val > v;
      case '<': return val < v;
      case 'in': return v.includes(val);
      case 'ilike': return String(val ?? '').toLowerCase().includes(String(v).toLowerCase());
      default: return true;
    }
  };
  const stack = [...domain];
  let ok = true;
  while (stack.length) {
    const el = stack.shift();
    if (el === '|') {
      const a = stack.shift();
      const b = stack.shift();
      ok = ok && (evalLeaf(a) || evalLeaf(b));
    } else if (el === '&') continue;
    else ok = ok && evalLeaf(el);
  }
  return ok;
}

function project(model, rec, fields) {
  const defs = FIELDS[model];
  const names = fields?.length ? fields : Object.keys(defs);
  const out = { id: rec.id };
  for (const n of names) {
    const d = defs[n];
    if (!d) continue;
    out[n] = d.type === 'many2one' ? (rec[n] ? [rec[n], displayName(d.relation, rec[n])] : false) : rec[n] ?? false;
  }
  return out;
}

export function createFakeOdoo({ major = 17, apiKey = 'secret-key', db = 'demo', dbList = true, deny = [] } = {}) {
  const calls = [];

  function run(model, method, kw) {
    calls.push({ model, method, kw });
    if (deny.includes(model)) {
      const e = new Error(`You are not allowed to access '${model}' records.`);
      e.odooName = 'odoo.exceptions.AccessError';
      throw e;
    }
    if (model === 'ir.module.module' && method === 'search_read') {
      const names = kw.domain.find((l) => l[0] === 'name')[2];
      return MODULES.filter((m) => names.includes(m)).map((name, i) => ({ id: i + 1, name }));
    }
    if (model === 'ir.model' && method === 'search_read') {
      return Object.keys(FIELDS).map((m, i) => ({ id: i + 1, model: m, name: m }));
    }
    if (!FIELDS[model]) {
      const e = new Error(`Object ${model} doesn't exist`);
      e.odooName = 'builtins.KeyError';
      throw e;
    }
    const rows = DATA[model];
    switch (method) {
      case 'fields_get':
        return FIELDS[model];
      case 'search_read': {
        const found = rows.filter((r) => match(r, kw.domain || []));
        const off = kw.offset || 0;
        return found.slice(off, off + (kw.limit || 80)).map((r) => project(model, r, kw.fields));
      }
      case 'search_count':
        return rows.filter((r) => match(r, kw.domain || [])).length;
      case 'read':
        return rows.filter((r) => kw.ids.includes(r.id)).map((r) => project(model, r, kw.fields));
      case 'read_group':
      case 'formatted_read_group': {
        const g = kw.groupby[0];
        const measures = method === 'read_group' ? kw.fields : kw.aggregates.filter((a) => a !== '__count');
        const groups = new Map();
        for (const r of rows.filter((x) => match(x, kw.domain || []))) {
          const key = r[g];
          if (!groups.has(key)) groups.set(key, []);
          groups.get(key).push(r);
        }
        return [...groups.entries()].map(([key, recs]) => {
          const d = FIELDS[model][g];
          const out = { [g]: d.type === 'many2one' ? [key, displayName(d.relation, key)] : key, __count: recs.length };
          for (const m of measures) {
            const [f] = m.split(':');
            const sum = recs.reduce((s, r) => s + (r[f] || 0), 0);
            out[method === 'read_group' ? f : m] = sum;
          }
          return out;
        });
      }
      default:
        throw new Error(`Method ${method} not supported by fake`);
    }
  }

  async function fetch(url, init) {
    const u = new URL(url);
    const body = JSON.parse(init.body || '{}');
    const json = (status, data) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
    const rpcOk = (result) => json(200, { jsonrpc: '2.0', id: body.id, result });
    const rpcErr = (name, message) => json(200, { jsonrpc: '2.0', id: body.id, error: { code: 200, message: 'Odoo Server Error', data: { name, message } } });

    if (u.pathname === '/web/webclient/version_info') {
      return rpcOk({ server_version: `${major}.0`, server_version_info: [major, 0, 0, 'final', 0, ''] });
    }
    if (u.pathname === '/web/database/list') {
      return dbList ? rpcOk([db]) : rpcErr('odoo.exceptions.AccessDenied', 'Access Denied');
    }
    if (u.pathname === '/jsonrpc') {
      if (major >= 19) return new Response('Not found', { status: 404 });
      const { service, method, args } = body.params;
      if (service === 'common' && method === 'authenticate') {
        const [d, login, key] = args;
        if (d !== db) return rpcErr('psycopg2.OperationalError', `database "${d}" does not exist`);
        return rpcOk(login === 'marie@example.com' && key === apiKey ? 2 : false);
      }
      if (service === 'object' && method === 'execute_kw') {
        const [d, uid, key, model, m, posArgs, kwargs] = args;
        if (d !== db || uid !== 2 || key !== apiKey) return rpcErr('odoo.exceptions.AccessDenied', 'Access Denied');
        try {
          const kw = { ...kwargs };
          if (posArgs.length) kw.ids = posArgs[0];
          return rpcOk(run(model, m, kw));
        } catch (e) {
          return rpcErr(e.odooName || 'builtins.Exception', e.message);
        }
      }
    }
    if (u.pathname.startsWith('/json/2/')) {
      if (major < 19) return new Response('<html>404</html>', { status: 404 });
      const auth = init.headers?.Authorization || '';
      if (auth !== `bearer ${apiKey}`) return json(401, { name: 'werkzeug.exceptions.Unauthorized', message: 'Invalid apikey' });
      const [, , , model, method] = u.pathname.split('/');
      try {
        return json(200, run(model, method, body));
      } catch (e) {
        const status = e.odooName === 'odoo.exceptions.AccessError' ? 403 : e.odooName === 'builtins.KeyError' ? 404 : 422;
        return json(status, { name: e.odooName, message: e.message });
      }
    }
    return new Response('<html>Not found</html>', { status: 404 });
  }

  return { fetch, calls };
}
