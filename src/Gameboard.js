export default class Gameboard {
  constructor(size = 10) {
    this.size = size;

    this.board = Array.from({ length: size }, () => Array(size).fill(null));

    this.ships = [];

    this.missedAttacks = [];

    this.attacks = new Set();
  }

  isInsideBoard([row, column]) {
    return row >= 0 && row < this.size && column >= 0 && column < this.size;
  }

  canPlaceShip(ship, [row, column], direction = "horizontal") {
    if (direction !== "horizontal" && direction !== "vertical") {
      return false;
    }

    for (let i = 0; i < ship.length; i += 1) {
      const currentRow = direction === "vertical" ? row + i : row;

      const currentColumn = direction === "horizontal" ? column + i : column;

      if (!this.isInsideBoard([currentRow, currentColumn])) {
        return false;
      }

      if (this.board[currentRow][currentColumn] !== null) {
        return false;
      }
    }

    return true;
  }

  placeShip(ship, [row, column], direction = "horizontal") {
    if (!this.canPlaceShip(ship, [row, column], direction)) {
      return false;
    }

    for (let i = 0; i < ship.length; i += 1) {
      const currentRow = direction === "vertical" ? row + i : row;

      const currentColumn = direction === "horizontal" ? column + i : column;

      this.board[currentRow][currentColumn] = ship;
    }

    this.ships.push(ship);

    return true;
  }

  receiveAttack([row, column]) {
    if (!this.isInsideBoard([row, column])) {
      return {
        valid: false,
        hit: false,
      };
    }

    const key = `${row},${column}`;

    if (this.attacks.has(key)) {
      return {
        valid: false,
        hit: false,
      };
    }

    this.attacks.add(key);

    const ship = this.board[row][column];

    if (ship !== null) {
      ship.hit();

      return {
        valid: true,
        hit: true,
      };
    }

    this.missedAttacks.push([row, column]);

    return {
      valid: true,
      hit: false,
    };
  }

  wasAttacked([row, column]) {
    return this.attacks.has(`${row},${column}`);
  }

  allShipsSunk() {
    return this.ships.length > 0 && this.ships.every((ship) => ship.isSunk());
  }
}
