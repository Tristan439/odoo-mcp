// Access policy: the user's choices on the access page, enforced server-side.
// The policy can only narrow what the Odoo user is already allowed to do.

import { APPS, appForModel, defaultLevels, isBlocked } from './apps.js';

export const LEVELS = ['none', 'read', 'write', 'full'];
const RANK = { none: 0, read: 1, write: 2, full: 3 };

export class AccessPolicy {
  /** @param {{apps?: Record<string,string>}} [access] */
  constructor(access = {}) {
    const defaults = defaultLevels();
    this.levels = {};
    for (const app of APPS) {
      const lvl = access.apps?.[app.key];
      this.levels[app.key] = LEVELS.includes(lvl) ? lvl : defaults[app.key];
    }
  }

  levelForApp(appKey) {
    return this.levels[appKey] || 'none';
  }

  levelForModel(model) {
    if (typeof model !== 'string' || !/^[a-z0-9_.]+$/.test(model)) return 'none';
    if (isBlocked(model)) return 'none';
    return this.levelForApp(appForModel(model));
  }

  allows(model, operation = 'read') {
    const need = operation === 'read' ? 1 : operation === 'delete' ? 3 : 2;
    return RANK[this.levelForModel(model)] >= need;
  }

  enabledApps() {
    return APPS.filter((a) => RANK[this.levels[a.key]] >= 1);
  }

  toJSON() {
    return { apps: { ...this.levels } };
  }
}
