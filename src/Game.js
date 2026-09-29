import Player from "./Player.js";

export default class Game {
  constructor(mode = "computer") {
    this.mode = mode === "two-player" ? "two-player" : "computer";

    this.fleetLengths = [5, 4, 3, 3, 2];

    this.players = [
      new Player("real", "Jugador 1"),

      new Player(
        this.mode === "computer" ? "computer" : "real",
        this.mode === "computer" ? "Computadora" : "Jugador 2",
      ),
    ];

    this.setupPlayerIndex = 0;

    this.currentPlayerIndex = 0;

    this.started = false;

    this.gameOver = false;

    this.winnerIndex = null;

    if (this.mode === "computer") {
      this.players[1].placeRandomFleet(this.fleetLengths);
    }
  }

  get player() {
    return this.players[0];
  }

  get computer() {
    if (this.mode !== "computer") {
      return null;
    }

    return this.players[1];
  }

  get setupPlayer() {
    return this.players[this.setupPlayerIndex];
  }

  get currentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  get enemyPlayer() {
    const enemyIndex = this.currentPlayerIndex === 0 ? 1 : 0;

    return this.players[enemyIndex];
  }

  getSetupPlayerName() {
    return this.setupPlayer.name;
  }

  getCurrentPlayerName() {
    return this.currentPlayer.name;
  }

  getEnemyPlayerName() {
    return this.enemyPlayer.name;
  }

  getWinnerName() {
    if (this.winnerIndex === null) {
      return null;
    }

    return this.players[this.winnerIndex].name;
  }

  getRemainingFleetLengths() {
    const remaining = [...this.fleetLengths];

    this.setupPlayer.gameboard.ships.forEach((ship) => {
      const index = remaining.indexOf(ship.length);

      if (index !== -1) {
        remaining.splice(index, 1);
      }
    });

    return remaining;
  }

  isSetupFleetComplete() {
    return this.getRemainingFleetLengths().length === 0;
  }

  placeSetupShip(length, coordinates, direction) {
    if (this.started) {
      return false;
    }

    const remaining = this.getRemainingFleetLengths();

    if (!remaining.includes(length)) {
      return false;
    }

    const ship = this.setupPlayer.placeShip(length, coordinates, direction);

    return ship !== null;
  }

  clearSetupFleet() {
    if (this.started) {
      return false;
    }

    this.setupPlayer.resetBoard();

    return true;
  }

  randomizeSetupFleet() {
    if (this.started) {
      return false;
    }

    return this.setupPlayer.placeRandomFleet(this.fleetLengths);
  }

  confirmSetup() {
    if (!this.isSetupFleetComplete()) {
      return "incomplete";
    }

    if (this.mode === "two-player" && this.setupPlayerIndex === 0) {
      this.setupPlayerIndex = 1;

      return "next-player";
    }

    this.started = true;

    this.currentPlayerIndex = 0;

    return "started";
  }

  attack(coordinates) {
    if (!this.started || this.gameOver) {
      return {
        valid: false,
        hit: false,
      };
    }

    const result = this.currentPlayer.attack(
      this.enemyPlayer.gameboard,
      coordinates,
    );

    if (!result.valid) {
      return result;
    }

    if (this.enemyPlayer.gameboard.allShipsSunk()) {
      this.gameOver = true;

      this.winnerIndex = this.currentPlayerIndex;
    }

    return result;
  }

  computerAttack() {
    if (this.mode !== "computer" || !this.started || this.gameOver) {
      return null;
    }

    const computer = this.players[1];

    const human = this.players[0];

    const result = computer.makeSmartAttack(human.gameboard);

    if (human.gameboard.allShipsSunk()) {
      this.gameOver = true;

      this.winnerIndex = 1;
    }

    return result;
  }

  advanceTurn() {
    if (!this.started || this.gameOver) {
      return false;
    }

    this.currentPlayerIndex = this.currentPlayerIndex === 0 ? 1 : 0;

    return true;
  }
}
