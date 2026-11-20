// Local configuration file: connection + access choices + language.
// Stored in the user's config dir with owner-only permissions.
// Environment variables override the file (useful for Docker / desktop extensions).

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export function configPath() {
  if (process.env.ODOO_MCP_CONFIG) return process.env.ODOO_MCP_CONFIG;
  const base =
    process.platform === 'win32'
      ? process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming')
      : process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config');
  return path.join(base, 'odoo-mcp', 'config.json');
}

/**
 * @typedef {object} Config
 * @property {{url?: string, db?: string, login?: string, apiKey?: string}} connection
 * @property {{apps?: Record<string,string>}} access
 * @property {'fr'|'en'} lang
 */

/** @returns {Config} */
export function loadConfig(file = configPath()) {
  let cfg = { connection: {}, access: {}, lang: 'fr' };
  try {
    cfg = { ...cfg, ...JSON.parse(fs.readFileSync(file, 'utf8')) };
  } catch (e) {
    if (e.code !== 'ENOENT') throw new Error(`Cannot read ${file}: ${e.message}`);
  }
  const env = process.env;
  cfg.connection = {
    ...cfg.connection,
    ...(env.ODOO_URL && { url: env.ODOO_URL }),
    ...(env.ODOO_DB && { db: env.ODOO_DB }),
    ...(env.ODOO_USER && { login: env.ODOO_USER }),
    ...(env.ODOO_API_KEY && { apiKey: env.ODOO_API_KEY }),
  };
  if (env.ODOO_MCP_LANG) cfg.lang = env.ODOO_MCP_LANG;
  return cfg;
}

export function isConfigured(cfg) {
  const c = cfg.connection || {};
  return Boolean(c.url && c.login && c.apiKey);
}

/** Writes the file atomically, readable by the owner only. */
export function saveConfig(cfg, file = configPath()) {
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(cfg, null, 2) + '\n', { mode: 0o600 });
  fs.renameSync(tmp, file);
  try {
    fs.chmodSync(file, 0o600);
  } catch {
    /* not supported on some filesystems */
  }
  return file;
}
