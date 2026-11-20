# Odoo Connect MCP

**Talk to your Odoo from Claude, ChatGPT or any MCP-compatible AI.**
You choose exactly what the AI can see, app by app. Your key stays on your computer.

[Version française](README.fr.md)

> 🧪 **Version 0.1: read-only.** The AI can look up and analyze your Odoo, but cannot change it yet.

---

## Setup in 3 steps (5 minutes)

**You need:** [Node.js](https://nodejs.org) (the "LTS" button) and your Odoo (Online, Odoo.sh or self-hosted, version 16 to 19).

### 1. Start the setup

Open a terminal (Mac: *Terminal* app · Windows: *PowerShell*) and paste:

```bash
npx -y odoo-connect-mcp setup
```

A page opens in your browser.

### 2. Fill in the page

1. **Connection**: your Odoo address, your email and an **API key**. The page explains how to create the key ([detailed guide](docs/odoo-api-key.md)).
2. **Access**: for each installed app (CRM, Sales, Inventory…), pick **None** or **Read**. Sensitive apps (Accounting, Payroll, Employees, Messages) are off by default.
3. **Connect your AI**: click **Set up Claude Desktop**, or copy the command for Claude Code.

### 3. Restart your AI and ask

> "What can you see in my Odoo?"

That's it. 🎉

### 🤖 Prefer to be guided by your AI?

Paste the content of [SETUP-PROMPT.md](SETUP-PROMPT.md) into Claude or ChatGPT: it walks you through one step at a time.

---

## Example questions

- "Confirmed sales this month, by salesperson"
- "Which opportunities have no planned activity?"
- "Which products are out of stock?"
- "Find the farm in Cookshire that asked for a quote"

Built-in prompts (the "/" or "+" menu of your AI): sales summary, follow-ups, low stock, overdue invoices.

## Changing access

Run `npx -y odoo-connect-mcp setup` again, change, save, then restart your AI.
**The AI can never change its own access.**

## Security

- **Closed by default**: sensitive apps are off, and technical models (`ir.*`, users, groups, settings) are **never** reachable.
- **Never more than Odoo allows**: the AI has at most your Odoo user's rights. The page can only *reduce* them.
- **Enforced server-side**: an app set to "None" is refused, even through a related field (e.g. `employee_id.name`).
- **Your key stays with you**: stored in a file only you can read (`~/.config/odoo-mcp/config.json`, or `%APPDATA%\odoo-mcp\config.json` on Windows). Nothing is sent anywhere except your Odoo.
- **Tip**: create an API key just for the AI, with an expiry date. You can revoke it any time in Odoo.

## Troubleshooting

```bash
npx -y odoo-connect-mcp doctor
```

| Message | Fix |
|---|---|
| "Odoo refused the login" | Check the email and key. If the key expired, create a new one. |
| "Cannot reach…" | Copy the exact address from your browser. |
| "several databases" | Enter the database name under *Advanced options*. |
| The AI doesn't see Odoo | Fully quit the AI app (not just the window) and open it again. |
| "Access not allowed" | That's your access setting: run `setup` again to open it. |

## Roadmap

- [x] **0.1**: read access, per-app access page, automatic Claude Desktop/Code setup, Odoo 16–19
- [ ] **0.2**: changes with confirmation ("Read + Edit"), per-model settings, hidden fields, "only my records", one-click Claude Desktop install (`.mcpb`)
- [ ] **0.3**: web version for ChatGPT and claude.ai ("Deploy to Cloudflare" button, Docker)
- [ ] **0.4**: business prompts, guides with screenshots

## Developers

```bash
git clone <this repo> && cd odoo-mcp && npm install
npm test                    # tests against a simulated Odoo (JSON-RPC 17 and JSON-2 19)
node bin/odoo-connect-mcp.js setup
```

Layout: `src/odoo.js` (Odoo client), `src/apps.js` (app catalogue), `src/access.js` (access rules), `src/server.js` (MCP tools), `src/setup/` (setup page).

Environment variables (`ODOO_URL`, `ODOO_DB`, `ODOO_USER`, `ODOO_API_KEY`, `ODOO_MCP_LANG`, `ODOO_MCP_CONFIG`) override the config file.

MIT License.
