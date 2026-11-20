// Minimal Odoo client.
// - Odoo 19+: JSON-2 API (POST /json/2/<model>/<method>, bearer API key)
// - Odoo 16-18: JSON-RPC (POST /jsonrpc, execute_kw)
// All calls take named arguments: execute(model, method, { ids, ...kwargs }).

import { t } from './i18n.js';

export class OdooError extends Error {
  /** @param {string} code @param {string} message @param {string} [detail] */
  constructor(code, message, detail) {
    super(message);
    this.code = code;
    this.detail = detail;
  }
}

export function normalizeUrl(raw) {
  let s = String(raw || '').trim();
  if (!s) throw new OdooError('bad_url', t('bad_url'));
  if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
  let u;
  try {
    u = new URL(s);
  } catch {
    throw new OdooError('bad_url', t('bad_url'));
  }
  if (!u.hostname.includes('.') && u.hostname !== 'localhost') throw new OdooError('bad_url', t('bad_url'));
  return `${u.protocol}//${u.host}`;
}

function guessDbFromHost(url) {
  const host = new URL(url).hostname;
  const m = host.match(/^([a-z0-9-]+)\.(odoo\.com|dev\.odoo\.com)$/i);
  return m ? m[1] : null;
}

const TIMEOUT_MS = 30_000;

export class OdooClient {
  /**
   * @param {{url: string, db?: string, login: string, apiKey: string, fetch?: typeof fetch}} opts
   */
  constructor({ url, db, login, apiKey, fetch: f }) {
    this.url = normalizeUrl(url);
    this.db = db || null;
    this.login = login;
    this.apiKey = apiKey;
    this.fetch = f || globalThis.fetch;
    this.major = null;
    this.version = null;
    this.uid = null;
    this.userName = null;
    this.ready = null;
  }

  get mode() {
    return this.major >= 19 ? 'json2' : 'jsonrpc';
  }

  async #post(path, body, headers = {}) {
    let res;
    try {
      res = await this.fetch(this.url + path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...headers },
        body: JSON.stringify(body),
        redirect: 'follow',
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch (e) {
      throw new OdooError('network', t('network', { url: this.url }), e?.message);
    }
    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      if (res.status === 404 && path.startsWith('/json/2/')) {
        throw new OdooError('unknown_model', t('unknown_model', { model: path.split('/')[3] }));
      }
      throw new OdooError('not_odoo', t('not_odoo', { url: this.url }), `HTTP ${res.status}`);
    }
    return { status: res.status, data };
  }

  async #rpc(path, params) {
    const { data } = await this.#post(path, { jsonrpc: '2.0', method: 'call', id: Date.now(), params });
    if (!data || data.jsonrpc !== '2.0') throw new OdooError('not_odoo', t('not_odoo', { url: this.url }));
    if (data.error) throw mapRpcError(data.error, this);
    return data.result;
  }

  /** Detects version, database and user. Safe to call several times. */
  connect() {
    if (!this.ready) {
      this.ready = this.#connect().catch((e) => {
        this.ready = null;
        throw e;
      });
    }
    return this.ready;
  }

  async #connect() {
    const info = await this.#rpc('/web/webclient/version_info', {});
    const vi = info?.server_version_info;
    if (!Array.isArray(vi)) throw new OdooError('not_odoo', t('not_odoo', { url: this.url }));
    this.version = info.server_version || String(vi[0]);
    // Odoo SaaS versions look like "saas~18.3": vi[0] is then "saas~18"
    this.major = parseInt(String(vi[0]).replace(/^saas~/, ''), 10) || 0;

    if (!this.db) this.db = await this.#detectDb();

    if (this.mode === 'jsonrpc') {
      if (!this.db) throw new OdooError('db_ambiguous', t('db_ambiguous'));
      const uid = await this.#rpc('/jsonrpc', {
        service: 'common',
        method: 'authenticate',
        args: [this.db, this.login, this.apiKey, {}],
      });
      if (!uid) throw new OdooError('auth', t('auth'));
      this.uid = uid;
      const [u] = await this.execute('res.users', 'read', { ids: [uid], fields: ['name'] });
      this.userName = u?.name || this.login;
    } else {
      const users = await this.execute('res.users', 'search_read', {
        domain: [['login', '=', this.login]],
        fields: ['id', 'name'],
        limit: 1,
      });
      if (!users?.length) throw new OdooError('auth', t('auth'));
      this.uid = users[0].id;
      this.userName = users[0].name;
    }
    return this.info();
  }

  async #detectDb() {
    try {
      const list = await this.#rpc('/web/database/list', {});
      if (Array.isArray(list)) {
        if (list.length === 1) return list[0];
        const guess = guessDbFromHost(this.url);
        if (guess && list.includes(guess)) return guess;
        if (list.length > 1) throw new OdooError('db_ambiguous', t('db_ambiguous'));
      }
    } catch (e) {
      if (e instanceof OdooError && e.code === 'db_ambiguous') throw e;
      if (e instanceof OdooError && e.code === 'network') throw e;
      // Listing is disabled on most hosted Odoo: fall through.
    }
    // JSON-2 can work without a db name when the server maps host -> db.
    return guessDbFromHost(this.url);
  }

  info() {
    return { url: this.url, db: this.db, version: this.version, major: this.major, mode: this.mode, uid: this.uid, user: this.userName, login: this.login };
  }

  /**
   * @param {string} model
   * @param {string} method
   * @param {Record<string, any>} [kw] named args; `ids` is the record set
   */
  async execute(model, method, kw = {}) {
    if (this.major === null) await this.connect();
    const { ids, ...kwargs } = kw;
    if (this.mode === 'json2') {
      const headers = { Authorization: `bearer ${this.apiKey}` };
      if (this.db) headers['X-Odoo-Database'] = this.db;
      const body = { ...kwargs };
      if (ids) body.ids = ids;
      const { status, data } = await this.#post(`/json/2/${model}/${method}`, body, headers);
      if (status >= 400) throw mapJson2Error(status, data, this, model);
      return data;
    }
    const args = ids ? [ids] : [];
    return this.#rpc('/jsonrpc', {
      service: 'object',
      method: 'execute_kw',
      args: [this.db, this.uid, this.apiKey, model, method, args, kwargs],
    });
  }
}

function classify(name = '', message = '', client, model) {
  const s = `${name} ${message}`;
  if (/AccessDenied|Access Denied|invalid api key|SessionExpired/i.test(s)) return new OdooError('auth', t('auth'), message);
  if (/AccessError|not allowed|n'êtes pas autorisé|vous n'avez pas/i.test(s)) return new OdooError('odoo_access', t('odoo_access', { detail: short(message) }), message);
  if (/database .* does not exist|KeyError: '?db|No database/i.test(s)) return new OdooError('db', t('db', { db: client.db }), message);
  if (/Object .* doesn't exist|Model not found|object.*does not exist|KeyError: '[a-z_.]+'$/i.test(s)) {
    return new OdooError('unknown_model', t('unknown_model', { model: model || '?' }), message);
  }
  return new OdooError('odoo_error', t('odoo_error', { detail: short(message) }), message);
}

function short(m) {
  const s = String(m || '').split('\n')[0];
  return s.length > 300 ? s.slice(0, 300) + '…' : s;
}

function mapRpcError(err, client) {
  const d = err.data || {};
  return classify(d.name, d.message || err.message, client);
}

function mapJson2Error(status, data, client, model) {
  const name = data?.name || '';
  const message = data?.message || `HTTP ${status}`;
  if (status === 401) return new OdooError('auth', t('auth'), message);
  if (status === 403) return new OdooError('odoo_access', t('odoo_access', { detail: short(message) }), message);
  if (status === 404) return new OdooError('unknown_model', t('unknown_model', { model }), message);
  return classify(name, message, client, model);
}
