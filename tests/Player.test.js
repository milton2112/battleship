import Player from "../src/Player.js";
import Gameboard from "../src/Gameboard.js";
import Ship from "../src/Ship.js";

describe("Player", () => {
  test("each player owns a gameboard", () => {
    const player = new Player("real");

    expect(player.gameboard).toBeInstanceOf(Gameboard);
  });

  test("two players have different gameboards", () => {
    const player = new Player("real");
    const computer = new Player("computer");

    expect(player.gameboard).not.toBe(computer.gameboard);
  });

  test("a player can attack the enemy gameboard", () => {
    const player = new Player("real");
    const enemyBoard = new Gameboard();
    const ship = new Ship(1);

    enemyBoard.placeShip(ship, [0, 0], "horizontal");

    const result = player.attack(enemyBoard, [0, 0]);

    expect(result).toEqual({
      valid: true,
      hit: true,
    });

    expect(ship.isSunk()).toBe(true);
  });

  test("the computer does not attack the same coordinate twice", () => {
    const computer = new Player("computer");
    const enemyBoard = new Gameboard();

    const firstAttack = computer.makeSmartAttack(enemyBoard);

    const secondAttack = computer.makeSmartAttack(enemyBoard);

    expect(secondAttack.coordinates).not.toEqual(firstAttack.coordinates);
  });

  test("after a hit the computer attacks an adjacent coordinate", () => {
    const computer = new Player("computer");
    const enemyBoard = new Gameboard(3);

    const ship = new Ship(2);

    enemyBoard.placeShip(ship, [1, 1], "horizontal");

    const randomSpy = jest.spyOn(Math, "random").mockReturnValue(0.45);

    const firstAttack = computer.makeSmartAttack(enemyBoard);

    expect(firstAttack.coordinates).toEqual([1, 1]);

    expect(firstAttack.hit).toBe(true);

    const secondAttack = computer.makeSmartAttack(enemyBoard);

    const rowDifference = Math.abs(
      secondAttack.coordinates[0] - firstAttack.coordinates[0],
    );

    const columnDifference = Math.abs(
      secondAttack.coordinates[1] - firstAttack.coordinates[1],
    );

    expect(rowDifference + columnDifference).toBe(1);

    randomSpy.mockRestore();
  });

  test("can place a complete random fleet without overlapping ships", () => {
    const player = new Player("real");

    player.placeRandomFleet();

    const occupiedCells = player.gameboard.board
      .flat()
      .filter((cell) => cell !== null);

    expect(player.gameboard.ships).toHaveLength(5);

    expect(occupiedCells).toHaveLength(17);
  });
});
