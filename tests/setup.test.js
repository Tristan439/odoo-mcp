import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import { startSetup } from '../src/setup/server.js';
import { createFakeOdoo } from './fake-odoo.js';

describe('setup page', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'odoo-mcp-'));
  const file = path.join(dir, 'config.json');
  let setup;
  let base;
  let token;

  before(async () => {
    const fake = createFakeOdoo({ major: 18 });
    setup = await startSetup({ open: false, fetch: fake.fetch, file, log: () => {} });
    const u = new URL(setup.url);
    base = u.origin;
    token = u.searchParams.get('k');
  });
  after(() => setup.close());

  const api = (p, body, headers = {}) =>
    fetch(base + p, {
      method: body ? 'POST' : 'GET',
      headers: { 'Content-Type': 'application/json', 'X-Setup-Token': token, ...headers },
      body: body ? JSON.stringify(body) : undefined,
    });

  it('serves the page only with the token', async () => {
    assert.equal((await fetch(setup.url)).status, 200);
    assert.equal((await fetch(base + '/')).status, 403);
    assert.equal((await fetch(base + '/?k=wrong')).status, 403);
  });

  it('rejects API calls without the token or from another origin', async () => {
    assert.equal((await api('/api/state', null, { 'X-Setup-Token': 'nope' })).status, 403);
    assert.equal((await api('/api/save', {}, { Origin: 'https://evil.example' })).status, 403);
  });

  it('tests the connection and detects installed apps', async () => {
    const r = await (await api('/api/test', { url: 'demo.example.com', login: 'marie@example.com', apiKey: 'secret-key' })).json();
    assert.equal(r.ok, true, r.message);
    assert.equal(r.info.user, 'Marie Admin');
    assert.equal(r.installed.sales, true);
    assert.equal(r.installed.inventory, false);
  });

  it('returns a friendly message on a bad key', async () => {
    const r = await (await api('/api/test', { url: 'demo.example.com', login: 'marie@example.com', apiKey: 'bad', lang: 'fr' })).json();
    assert.equal(r.ok, false);
    assert.match(r.message, /clé API/);
  });

  it('saves the config with owner-only permissions and never returns the key', async () => {
    const r = await (
      await api('/api/save', {
        lang: 'fr',
        connection: { url: 'https://demo.example.com', login: 'marie@example.com', apiKey: 'secret-key' },
        access: { apps: { crm: 'read', accounting: 'full', sales: 'none' } },
      })
    ).json();
    assert.equal(r.ok, true);
    const saved = JSON.parse(fs.readFileSync(file, 'utf8'));
    assert.equal(saved.connection.apiKey, 'secret-key');
    assert.equal(saved.access.apps.sales, 'none');
    assert.equal(saved.access.apps.accounting, 'read', 'write levels are not available yet');
    if (process.platform !== 'win32') assert.equal(fs.statSync(file).mode & 0o777, 0o600);

    const state = await (await api('/api/state')).json();
    assert.equal(state.connection.hasKey, true);
    assert.ok(!JSON.stringify(state).includes('secret-key'));
  });

  it('keeps the saved key when the field is left empty', async () => {
    await api('/api/save', { lang: 'fr', connection: { url: 'https://demo.example.com', login: 'marie@example.com', apiKey: '' }, access: {} });
    assert.equal(JSON.parse(fs.readFileSync(file, 'utf8')).connection.apiKey, 'secret-key');
  });
});
