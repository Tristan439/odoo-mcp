# Create your Odoo API key

[Français](cle-api-odoo.md)

An API key is a special password for applications. It lets the AI connect to Odoo **with your rights**, without knowing your real password. You can revoke it at any time.

## Steps (1 minute)

1. Log in to Odoo.
2. Click **your avatar** (top right) → **My Profile** (in some versions: **Preferences**).
3. Open the **Account Security** tab.
4. Click **New API Key**.
5. Confirm your password.
6. Name the key, e.g. `AI`, and choose a **duration** (90 days is a good choice).
7. **Copy the key** and paste it into the setup page. Odoo shows it **only once**.

## I don't see "Account Security" or "New API Key"

- Enable **developer mode**: Settings → bottom of the page → *Activate the developer mode*. Then try again.
- Your user may not be allowed to create keys: ask your Odoo administrator.

## Good practices

- **One key per use** (e.g. `AI - office laptop`), so you can revoke just that one.
- **Set an expiry date.** When it expires, the AI will say the login is refused: create a new key and run `npx -y odoo-connect-mcp setup` again.
- **Never paste your key into a chat with an AI.** Type it only into the setup page, on your computer.
- **To revoke**: My Profile → Account Security → trash icon next to the key.

## Dedicated user (optional, recommended for companies)

To limit access further, create an Odoo user just for the AI, with only the rights it needs (e.g. Sales: *User: Own Documents Only*), and create the API key with that user.
