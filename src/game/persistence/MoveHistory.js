export class MoveHistory {
  constructor(moves = []) {
    this.moves = moves
  }

  add(move) {
    this.moves = [move, ...this.moves]
  }

  toJSON() {
    return this.moves
  }
}

