export class RuleInterface {
  constructor({
    id,
    label,
    description,
    incompatibleWith = [],
    phases = ['setup', 'turn'],
    metadata = {}
  }) {
    if (!id) throw new Error('RuleInterface requires an id')
    this.id = id
    this.label = label || id
    this.description = description || ''
    this.incompatibleWith = incompatibleWith
    this.phases = phases
    this.metadata = metadata
  }

  extendConfig(config) {
    return config
  }

  beforeMove(_context) {}

  afterMove(_context) {}

  serialize() {
    return {
      id: this.id,
      label: this.label,
      description: this.description,
      incompatibleWith: this.incompatibleWith,
      phases: this.phases,
      metadata: this.metadata
    }
  }
}

