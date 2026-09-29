import Gameboard from "./Gameboard.js";
import Ship from "./Ship.js";

export default class Player {
  constructor(type = "real", name = "Jugador") {
    this.type = type;
    this.name = name;

    this.gameboard = new Gameboard();

    this.targetQueue = [];
  }

  attack(enemyGameboard, coordinates) {
    return enemyGameboard.receiveAttack(coordinates);
  }

  placeShip(length, coordinates, direction = "horizontal") {
    const ship = new Ship(length);

    const placed = this.gameboard.placeShip(ship, coordinates, direction);

    if (!placed) {
      return null;
    }

    return ship;
  }

  resetBoard() {
    const size = this.gameboard.size;

    this.gameboard = new Gameboard(size);
  }

  placeRandomFleet(lengths = [5, 4, 3, 3, 2]) {
    const maxAttempts = 100;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      this.resetBoard();

      let success = true;

      for (const length of lengths) {
        const ship = new Ship(length);

        const possiblePlacements = [];

        for (let row = 0; row < this.gameboard.size; row += 1) {
          for (let column = 0; column < this.gameboard.size; column += 1) {
            const directions = ["horizontal", "vertical"];

            directions.forEach((direction) => {
              if (this.gameboard.canPlaceShip(ship, [row, column], direction)) {
                possiblePlacements.push({
                  coordinates: [row, column],
                  direction,
                });
              }
            });
          }
        }

        if (possiblePlacements.length === 0) {
          success = false;

          break;
        }

        const randomIndex = Math.floor(
          Math.random() * possiblePlacements.length,
        );

        const placement = possiblePlacements[randomIndex];

        this.gameboard.placeShip(
          ship,
          placement.coordinates,
          placement.direction,
        );
      }

      if (success) {
        return true;
      }
    }

    return false;
  }

  getAvailableCoordinates(enemyGameboard) {
    const availableCoordinates = [];

    for (let row = 0; row < enemyGameboard.size; row += 1) {
      for (let column = 0; column < enemyGameboard.size; column += 1) {
        if (!enemyGameboard.wasAttacked([row, column])) {
          availableCoordinates.push([row, column]);
        }
      }
    }

    return availableCoordinates;
  }

  makeRandomAttack(enemyGameboard) {
    const availableCoordinates = this.getAvailableCoordinates(enemyGameboard);

    if (availableCoordinates.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * availableCoordinates.length);

    const coordinates = availableCoordinates[randomIndex];

    const result = this.attack(enemyGameboard, coordinates);

    return {
      coordinates,
      ...result,
    };
  }

  getAdjacentCoordinates(enemyGameboard, [row, column]) {
    const possibleCoordinates = [
      [row - 1, column],
      [row + 1, column],
      [row, column - 1],
      [row, column + 1],
    ];

    return possibleCoordinates.filter((coordinates) =>
      enemyGameboard.isInsideBoard(coordinates),
    );
  }

  queueAdjacentTargets(enemyGameboard, coordinates) {
    const adjacentCoordinates = this.getAdjacentCoordinates(
      enemyGameboard,
      coordinates,
    );

    adjacentCoordinates.forEach((candidate) => {
      if (enemyGameboard.wasAttacked(candidate)) {
        return;
      }

      const alreadyQueued = this.targetQueue.some(
        (queuedCoordinates) =>
          queuedCoordinates[0] === candidate[0] &&
          queuedCoordinates[1] === candidate[1],
      );

      if (!alreadyQueued) {
        this.targetQueue.push(candidate);
      }
    });
  }

  makeSmartAttack(enemyGameboard) {
    let coordinates = null;

    while (this.targetQueue.length > 0 && coordinates === null) {
      const candidate = this.targetQueue.shift();

      if (!enemyGameboard.wasAttacked(candidate)) {
        coordinates = candidate;
      }
    }

    if (coordinates === null) {
      const availableCoordinates = this.getAvailableCoordinates(enemyGameboard);

      if (availableCoordinates.length === 0) {
        return null;
      }

      const randomIndex = Math.floor(
        Math.random() * availableCoordinates.length,
      );

      coordinates = availableCoordinates[randomIndex];
    }

    const result = this.attack(enemyGameboard, coordinates);

    if (result.hit) {
      this.queueAdjacentTargets(enemyGameboard, coordinates);
    }

    return {
      coordinates,
      ...result,
    };
  }
}
