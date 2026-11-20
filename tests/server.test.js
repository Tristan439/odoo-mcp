import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../src/server.js';
import { createFakeOdoo } from './fake-odoo.js';

async function connect({ major = 17, access, connection, lang = 'en', fake: fakeOpts } = {}) {
  const fake = createFakeOdoo({ major, ...fakeOpts });
  const config = {
    lang,
    connection: connection ?? { url: 'https://demo.example.com', login: 'marie@example.com', apiKey: 'secret-key' },
    access: access ?? {},
  };
  const { server } = createServer({ config, fetch: fake.fetch });
  const [a, b] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: 'test', version: '1' });
  await Promise.all([server.connect(a), client.connect(b)]);
  const call = async (name, args = {}) => {
    const r = await client.callTool({ name, arguments: args });
    const text = r.content[0].text;
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    return { isError: Boolean(r.isError), data, text };
  };
  return { client, call, fake };
}

for (const major of [17, 19]) {
  describe(`Odoo ${major} (${major >= 19 ? 'JSON-2' : 'JSON-RPC'})`, () => {
    it('connects and reports version, db and user', async () => {
      const { call } = await connect({ major });
      const r = await call('check_connection');
      assert.equal(r.isError, false, r.text);
      assert.equal(r.data.user, 'Marie Admin');
      assert.equal(r.data.db, 'demo');
      assert.equal(r.data.mode, major >= 19 ? 'json2' : 'jsonrpc');
    });

    it('searches with default fields, skipping binary and one2many', async () => {
      const { call } = await connect({ major });
      const r = await call('search_records', { model: 'res.partner', domain: [['city', '=', 'Cookshire']] });
      assert.equal(r.isError, false, r.text);
      assert.equal(r.data.total, 2);
      assert.equal(r.data.has_more, false);
      assert.ok(!('image_1920' in r.data.records[0]));
      assert.ok(!('message_ids' in r.data.records[0]));
      assert.deepEqual(r.data.records[0].user_id, [2, 'Marie Admin']);
    });

    it('aggregates per group', async () => {
      const { call } = await connect({ major });
      const r = await call('aggregate_records', {
        model: 'sale.order',
        domain: [['state', '=', 'sale']],
        group_by: ['partner_id'],
        measures: ['amount_total:sum'],
      });
      assert.equal(r.isError, false, r.text);
      assert.equal(r.data.groups.length, 1);
      assert.equal(r.data.groups[0].count, 2);
      assert.equal(r.data.groups[0]['amount_total:sum'], 2000);
    });

    it('explains a wrong API key in plain words', async () => {
      const { call } = await connect({ major, connection: { url: 'https://demo.example.com', login: 'marie@example.com', apiKey: 'bad' } });
      const r = await call('check_connection');
      assert.equal(r.isError, true);
      assert.match(r.text, /API key/);
    });
  });
}

describe('access policy', () => {
  it('refuses apps set to none and tells how to change it', async () => {
    const { call, fake } = await connect({ access: { apps: { sales: 'none' } } });
    const r = await call('search_records', { model: 'sale.order' });
    assert.equal(r.isError, true);
    assert.match(r.text, /Sales/);
    assert.match(r.text, /odoo-connect-mcp setup/);
    assert.ok(!fake.calls.some((c) => c.model === 'sale.order'), 'Odoo must not be called');
  });

  it('sensitive apps are off by default', async () => {
    const { call } = await connect();
    const r = await call('search_records', { model: 'hr.employee' });
    assert.equal(r.isError, true);
  });

  it('never exposes technical models, even with "other" enabled', async () => {
    const { call } = await connect({ access: { apps: { other: 'read' } } });
    for (const model of ['res.users', 'ir.config_parameter', 'ir.model']) {
      const r = await call('search_records', { model });
      assert.equal(r.isError, true, model);
      assert.match(r.text, /technical/);
    }
  });

  it('blocks domains that walk into a forbidden model', async () => {
    const { call } = await connect();
    const r = await call('search_records', { model: 'sale.order', domain: [['employee_id.name', '=', 'Jean']] });
    assert.equal(r.isError, true);
    assert.match(r.text, /Employees/);
  });

  it('blocks explicit fields pointing to a forbidden model, and hides them by default', async () => {
    const { call } = await connect();
    const r1 = await call('search_records', { model: 'sale.order', fields: ['name', 'employee_id'] });
    assert.equal(r1.isError, true);
    const r2 = await call('search_records', { model: 'sale.order' });
    assert.equal(r2.isError, false, r2.text);
    assert.ok(!('employee_id' in r2.data.records[0]));
    const r3 = await call('describe_model', { model: 'sale.order' });
    assert.ok(!('employee_id' in r3.data.fields));
  });

  it('blocks group_by on a forbidden relation', async () => {
    const { call } = await connect();
    const r = await call('aggregate_records', { model: 'sale.order', group_by: ['employee_id'] });
    assert.equal(r.isError, true);
  });

  it('only lists tools that read', async () => {
    const { client } = await connect();
    const { tools } = await client.listTools();
    assert.ok(tools.length >= 8);
    for (const tool of tools) assert.equal(tool.annotations?.readOnlyHint, true, tool.name);
  });
});

describe('without configuration', () => {
  it('explains how to set up', async () => {
    const { call } = await connect({ connection: {} });
    const r = await call('check_connection');
    assert.equal(r.isError, true);
    assert.match(r.text, /npx -y odoo-connect-mcp setup/);
  });
});

describe('Odoo permissions', () => {
  it('reports an Odoo access error as an Odoo permission problem', async () => {
    const { call } = await connect({ fake: { deny: ['res.partner'] } });
    const r = await call('search_records', { model: 'res.partner' });
    assert.equal(r.isError, true);
    assert.match(r.text, /Odoo administrator/);
  });
});

describe('salesperson labels', () => {
  it('shows user names but never lets the AI dig into user accounts', async () => {
    const { call } = await connect();
    const ok = await call('search_records', { model: 'res.partner', domain: [['user_id.name', '=', 'Marie Admin']] });
    assert.equal(ok.isError, false, ok.text);
    const bad = await call('search_records', { model: 'res.partner', domain: [['user_id.login', '=', 'x']] });
    assert.equal(bad.isError, true);
  });
});
