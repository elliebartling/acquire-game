import { StandardRules } from './StandardRules'

/**
 * Coordinates the active ruleset (standard + optional variations) and exposes
 * lifecycle hooks for the game state to consume.
 */
export class RulesEngine {
  constructor({ baseRules = [new StandardRules()], variations = [] } = {}) {
    this.activeRules = [...baseRules, ...variations]
  }

  extendConfig(config) {
    return this.activeRules.reduce((cfg, rule) => rule.extendConfig(cfg), config)
  }

  runHook(hookName, context) {
    this.activeRules.forEach((rule) => {
      if (typeof rule[hookName] === 'function') {
        rule[hookName](context)
      }
    })
  }

  serialize() {
    return this.activeRules.map((rule) => rule.serialize())
  }
}

