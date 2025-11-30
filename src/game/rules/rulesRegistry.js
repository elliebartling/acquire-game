import { StandardRules } from './StandardRules'
import { ExtraHotelsRule } from './variations/ExtraHotelsRule'
import { LoansRule } from './variations/LoansRule'

export const RULES_REGISTRY = [
  {
    id: 'standard',
    label: 'Standard Rules',
    description: 'Classic ruleset – always enabled.',
    create: () => new StandardRules(),
    required: true
  },
  {
    id: 'extra-hotels',
    label: 'More Hotels',
    description: 'Adds three additional hotels to the tile bag.',
    create: () => new ExtraHotelsRule()
  },
  {
    id: 'loans',
    label: 'Loans',
    description: 'Players may take loans to fund stock purchases.',
    create: () => new LoansRule()
  }
]

export function getRuleById(ruleId) {
  return RULES_REGISTRY.find((rule) => rule.id === ruleId)
}

export function buildRules(ruleIds = []) {
  return ruleIds
    .map((id) => getRuleById(id))
    .filter(Boolean)
    .map((entry) => entry.create())
}

