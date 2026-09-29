import Ship from "../src/Ship.js";

describe("Ship", () => {
  test("stores its length and starts with zero hits", () => {
    const ship = new Ship(3);

    expect(ship.length).toBe(3);
    expect(ship.hits).toBe(0);
  });

  test("hit increases the number of hits", () => {
    const ship = new Ship(3);

    ship.hit();

    expect(ship.hits).toBe(1);
  });

  test("isSunk is false while the ship still has unhit sections", () => {
    const ship = new Ship(2);

    ship.hit();

    expect(ship.isSunk()).toBe(false);
  });

  test("isSunk is true when hits reach the ship length", () => {
    const ship = new Ship(2);

    ship.hit();
    ship.hit();

    expect(ship.isSunk()).toBe(true);
  });
});
