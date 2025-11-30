import { RuleInterface } from '../RuleInterface'
import { GameConfig } from '../../config/GameConfig'

export class LoansRule extends RuleInterface {
  constructor() {
    super({
      id: 'loans',
      label: 'Loans',
      description: 'Players can take loans and repay them with interest.',
      metadata: { interestRate: 0.1 }
    })
  }

  extendConfig(config) {
    const base = config instanceof GameConfig ? config : new GameConfig(config)
    return new GameConfig({
      ...base.toJSON(),
      allowLoans: true,
      maxLoan: 3000
    })
  }
}

