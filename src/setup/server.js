// Local setup page: connect Odoo, choose access, register in AI apps.
// Listens on 127.0.0.1 only, protected by a one-time random token.

import crypto from 'node:crypto';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { APPS, PRESETS, presetLevels } from '../apps.js';
import { AccessPolicy } from '../access.js';
import { claudeCodeCommand, claudeDesktopConfigPath, installClaudeDesktop } from '../clients.js';
import { configPath, loadConfig, saveConfig } from '../config.js';
import { detectApps } from '../detect.js';
import { setLang } from '../i18n.js';
import { OdooClient, OdooError } from '../odoo.js';
import { renderPage } from './page.js';

const MAX_BODY = 64 * 1024;

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) {
        reject(new Error('Body too large'));
        req.destroy();
      } else chunks.push(c);
    });
    req.on('end', () => {
      try {
        resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {});
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function send(res, status, body, type = 'application/json') {
  res.writeHead(status, {
    'Content-Type': `${type}; charset=utf-8`,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    ...(type === 'text/html' && { 'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; img-src data:" }),
  });
  res.end(type === 'application/json' ? JSON.stringify(body) : body);
}

function openBrowser(url) {
  const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'cmd' : 'xdg-open';
  const args = process.platform === 'win32' ? ['/c', 'start', '', url] : [url];
  try {
    const child = spawn(cmd, args, { stdio: 'ignore', detached: true });
    child.on('error', () => {});
    child.unref();
  } catch {
    /* the URL is printed anyway */
  }
}

/**
 * @param {{port?: number, open?: boolean, fetch?: typeof fetch, file?: string, log?: (s: string) => void}} [opts]
 * @returns {Promise<{url: string, close: () => Promise<void>, done: Promise<void>}>}
 */
export async function startSetup({ port = 0, open = true, fetch: f, file = configPath(), log = console.log } = {}) {
  const token = crypto.randomBytes(24).toString('base64url');
  let finish;
  const done = new Promise((r) => (finish = r));

  const server = http.createServer(async (req, res) => {
    try {
      const host = req.headers.host || '';
      const { port: p } = server.address();
      if (host !== `127.0.0.1:${p}` && host !== `localhost:${p}`) return send(res, 403, { error: 'Forbidden host' });
      const url = new URL(req.url, `http://${host}`);

      if (req.method === 'GET' && url.pathname === '/') {
        if (url.searchParams.get('k') !== token) return send(res, 403, 'Lien expiré ou invalide. Relance « npx -y odoo-connect-mcp setup ». / Invalid link: run the setup again.', 'text/plain');
        return send(res, 200, renderPage(token), 'text/html');
      }
      if (!url.pathname.startsWith('/api/')) return send(res, 404, { error: 'Not found' });
      if (req.headers['x-setup-token'] !== token) return send(res, 403, { error: 'Forbidden' });
      if (req.method === 'POST') {
        const origin = req.headers.origin;
        if (origin && origin !== `http://${host}`) return send(res, 403, { error: 'Forbidden origin' });
      }

      const cfg = loadConfig(file);
      const route = `${req.method} ${url.pathname}`;

      if (route === 'GET /api/state') {
        const c = cfg.connection || {};
        return send(res, 200, {
          lang: cfg.lang || 'fr',
          configFile: file,
          connection: { url: c.url || '', db: c.db || '', login: c.login || '', hasKey: Boolean(c.apiKey) },
          access: new AccessPolicy(cfg.access).toJSON(),
          apps: APPS.map(({ key, icon, name, desc, sensitive }) => ({ key, icon, name, desc, sensitive: Boolean(sensitive) })),
          presets: Object.fromEntries(Object.entries(PRESETS).map(([k, label]) => [k, { label, levels: presetLevels(k) }])),
          claudeDesktopFile: claudeDesktopConfigPath(),
          claudeCodeCommand: claudeCodeCommand(),
        });
      }

      if (route === 'POST /api/test') {
        const body = await readBody(req);
        setLang(body.lang || cfg.lang);
        const apiKey = body.apiKey || cfg.connection?.apiKey;
        try {
          const client = new OdooClient({ url: body.url, db: body.db || undefined, login: String(body.login || '').trim(), apiKey, fetch: f });
          const info = await client.connect();
          const detected = await detectApps(client);
          return send(res, 200, { ok: true, info, ...detected });
        } catch (e) {
          return send(res, 200, { ok: false, code: e.code || 'error', message: e instanceof OdooError ? e.message : String(e.message || e) });
        }
      }

      if (route === 'POST /api/save') {
        const body = await readBody(req);
        const lang = body.lang === 'en' ? 'en' : 'fr';
        const conn = body.connection || {};
        const next = {
          lang,
          connection: {
            url: String(conn.url || '').trim(),
            db: String(conn.db || '').trim() || undefined,
            login: String(conn.login || '').trim(),
            apiKey: conn.apiKey || cfg.connection?.apiKey,
          },
          access: new AccessPolicy(body.access).toJSON(),
        };
        // Write levels are not available yet in this version.
        for (const k of Object.keys(next.access.apps)) if (next.access.apps[k] !== 'none') next.access.apps[k] = 'read';
        const saved = saveConfig(next, file);
        return send(res, 200, { ok: true, file: saved });
      }

      if (route === 'POST /api/claude-desktop') {
        try {
          return send(res, 200, { ok: true, ...installClaudeDesktop() });
        } catch (e) {
          return send(res, 200, { ok: false, message: e.message });
        }
      }

      if (route === 'POST /api/quit') {
        send(res, 200, { ok: true });
        finish();
        return;
      }

      return send(res, 404, { error: 'Not found' });
    } catch (e) {
      return send(res, 500, { error: String(e.message || e) });
    }
  });

  await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve));
  const { port: actual } = server.address();
  const url = `http://127.0.0.1:${actual}/?k=${token}`;
  log(`\n  Odoo MCP — configuration\n\n  ${url}\n\n  (La page s'ouvre dans ton navigateur. Sinon, copie ce lien. / Open this link if the page did not open.)\n`);
  if (open) openBrowser(url);

  const close = () => new Promise((r) => server.close(() => r()));
  done.then(() => setTimeout(close, 200));
  return { url, close, done };
}
