export class PlayerState {
  constructor({
    id,
    username = '',
    cash = 6000,
    netWorth = 6000,
    stocks = {},
    hand = [],
    loans = 0,
    metadata = {}
  }) {
    this.id = id
    this.username = username
    this.cash = cash
    this.netWorth = netWorth
    this.stocks = stocks
    this.hand = hand
    this.loans = loans
    this.metadata = metadata
  }

  addTile(tile) {
    this.hand = [...this.hand, tile]
  }

  removeTile(tile) {
    this.hand = this.hand.filter((t) => t !== tile)
  }

  adjustCash(amount) {
    this.cash += amount
    this.netWorth += amount
  }

  toPublicJSON() {
    return {
      id: this.id,
      username: this.username,
      netWorth: this.netWorth,
      cash: this.cash,
      stocks: this.stocks,
      loans: this.loans
    }
  }

  toPrivateJSON() {
    return {
      ...this.toPublicJSON(),
      hand: this.hand,
      metadata: this.metadata
    }
  }

  static fromJSON(json) {
    return new PlayerState(json)
  }
}

