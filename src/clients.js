// Registers this server in AI apps installed on the computer.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BIN = fileURLToPath(new URL('../bin/odoo-connect-mcp.js', import.meta.url));

/** How the AI app should start the server. */
export function launchCommand() {
  // Started through npx => keep using npx so updates are picked up.
  if (/[\\/]_npx[\\/]/.test(BIN)) return { command: 'npx', args: ['-y', 'odoo-connect-mcp'] };
  return { command: process.execPath, args: [BIN] };
}

export function claudeDesktopConfigPath() {
  const home = os.homedir();
  if (process.platform === 'darwin') return path.join(home, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
  if (process.platform === 'win32') return path.join(process.env.APPDATA || path.join(home, 'AppData', 'Roaming'), 'Claude', 'claude_desktop_config.json');
  return path.join(process.env.XDG_CONFIG_HOME || path.join(home, '.config'), 'Claude', 'claude_desktop_config.json');
}

/** Adds (or updates) the "odoo" server in Claude Desktop, keeping a backup. */
export function installClaudeDesktop(file = claudeDesktopConfigPath()) {
  let cfg = {};
  let existed = false;
  try {
    cfg = JSON.parse(fs.readFileSync(file, 'utf8'));
    existed = true;
  } catch (e) {
    if (e.code !== 'ENOENT') throw new Error(`Claude Desktop config is not valid JSON (${file}). Fix or delete it, then retry.`);
  }
  if (existed) fs.copyFileSync(file, `${file}.bak`);
  cfg.mcpServers = cfg.mcpServers || {};
  cfg.mcpServers.odoo = launchCommand();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(cfg, null, 2) + '\n');
  return { file, backup: existed ? `${file}.bak` : null };
}

export function claudeCodeCommand() {
  const { command, args } = launchCommand();
  const quote = (s) => (/[\s"]/.test(s) ? `"${s}"` : s);
  return `claude mcp add odoo --scope user -- ${[command, ...args].map(quote).join(' ')}`;
}
