import Gameboard from "../src/Gameboard.js";
import Ship from "../src/Ship.js";

describe("Gameboard", () => {
  test("places a ship horizontally at specific coordinates", () => {
    const gameboard = new Gameboard();
    const ship = new Ship(3);

    const placed = gameboard.placeShip(ship, [0, 0], "horizontal");

    expect(placed).toBe(true);

    expect(gameboard.board[0][0]).toBe(ship);
    expect(gameboard.board[0][1]).toBe(ship);
    expect(gameboard.board[0][2]).toBe(ship);
  });

  test("places a ship vertically at specific coordinates", () => {
    const gameboard = new Gameboard();
    const ship = new Ship(3);

    const placed = gameboard.placeShip(ship, [1, 1], "vertical");

    expect(placed).toBe(true);

    expect(gameboard.board[1][1]).toBe(ship);
    expect(gameboard.board[2][1]).toBe(ship);
    expect(gameboard.board[3][1]).toBe(ship);
  });

  test("does not place a ship outside the board", () => {
    const gameboard = new Gameboard();
    const ship = new Ship(3);

    const placed = gameboard.placeShip(ship, [0, 9], "horizontal");

    expect(placed).toBe(false);
  });

  test("does not allow ships to overlap", () => {
    const gameboard = new Gameboard();

    const firstShip = new Ship(3);
    const secondShip = new Ship(2);

    gameboard.placeShip(firstShip, [0, 0], "horizontal");

    const placed = gameboard.placeShip(secondShip, [0, 1], "vertical");

    expect(placed).toBe(false);
  });

  test("receiveAttack hits the correct ship", () => {
    const gameboard = new Gameboard();
    const ship = new Ship(2);

    gameboard.placeShip(ship, [2, 2], "horizontal");

    const result = gameboard.receiveAttack([2, 2]);

    expect(result).toEqual({
      valid: true,
      hit: true,
    });

    expect(ship.hits).toBe(1);
  });

  test("receiveAttack records a missed attack", () => {
    const gameboard = new Gameboard();

    const result = gameboard.receiveAttack([5, 5]);

    expect(result).toEqual({
      valid: true,
      hit: false,
    });

    expect(gameboard.missedAttacks).toContainEqual([5, 5]);
  });

  test("does not allow the same coordinate to be attacked twice", () => {
    const gameboard = new Gameboard();

    gameboard.receiveAttack([4, 4]);

    const secondAttack = gameboard.receiveAttack([4, 4]);

    expect(secondAttack).toEqual({
      valid: false,
      hit: false,
    });
  });

  test("reports when all ships have been sunk", () => {
    const gameboard = new Gameboard();

    const shipOne = new Ship(1);
    const shipTwo = new Ship(1);

    gameboard.placeShip(shipOne, [0, 0], "horizontal");

    gameboard.placeShip(shipTwo, [1, 0], "horizontal");

    gameboard.receiveAttack([0, 0]);
    gameboard.receiveAttack([1, 0]);

    expect(gameboard.allShipsSunk()).toBe(true);
  });
});
