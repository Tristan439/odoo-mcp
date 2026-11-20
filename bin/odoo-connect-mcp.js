#!/usr/bin/env node
// odoo-mcp            → MCP server over stdio (what AI apps start)
// odoo-mcp setup      → opens the setup page in the browser
// odoo-mcp doctor     → tests the connection from the terminal

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { configPath, isConfigured, loadConfig } from '../src/config.js';
import { detectApps } from '../src/detect.js';
import { setLang, t } from '../src/i18n.js';
import { OdooClient } from '../src/odoo.js';
import { createServer, VERSION } from '../src/server.js';
import { startSetup } from '../src/setup/server.js';

const [cmd] = process.argv.slice(2);

async function main() {
  if (cmd === '--version' || cmd === '-v') return console.log(VERSION);

  if (cmd === 'help' || cmd === '--help' || cmd === '-h') {
    return console.log(`odoo-connect-mcp ${VERSION}

  npx -y odoo-connect-mcp setup    Connect your Odoo and choose access (opens a page)
  npx -y odoo-connect-mcp doctor   Test the connection
  npx -y odoo-connect-mcp          Start the MCP server (used by your AI app)

Config file: ${configPath()}`);
  }

  if (cmd === 'setup') {
    const { done } = await startSetup({ open: !process.argv.includes('--no-open') });
    await done;
    console.log('  ✓ Terminé / Done.');
    return;
  }

  if (cmd === 'doctor') {
    const cfg = loadConfig();
    setLang(cfg.lang);
    if (!isConfigured(cfg)) {
      console.log(t('no_config'));
      process.exitCode = 1;
      return;
    }
    try {
      const client = new OdooClient(cfg.connection);
      const info = await client.connect();
      const { installed } = await detectApps(client);
      console.log(`✓ Odoo ${info.version} · ${info.db || '—'} · ${info.user} (${info.mode})`);
      console.log(`  Apps: ${Object.entries(installed).filter(([, v]) => v).map(([k]) => k).join(', ')}`);
    } catch (e) {
      console.log(`✗ ${e.message}`);
      process.exitCode = 1;
    }
    return;
  }

  if (cmd) {
    console.error(`Unknown command "${cmd}". Try: npx -y odoo-connect-mcp help`);
    process.exitCode = 1;
    return;
  }

  const { server } = createServer({ config: loadConfig() });
  await server.connect(new StdioServerTransport());
}

main().catch((e) => {
  console.error(e?.message || e);
  process.exit(1);
});
