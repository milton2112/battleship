import Game from "../src/Game.js";

describe("Game", () => {
  test("computer mode creates one real player and one computer", () => {
    const game = new Game("computer");

    expect(game.players[0].type).toBe("real");

    expect(game.players[1].type).toBe("computer");
  });

  test("two-player mode creates two real players", () => {
    const game = new Game("two-player");

    expect(game.players[0].type).toBe("real");

    expect(game.players[1].type).toBe("real");
  });

  test("game cannot start with an incomplete fleet", () => {
    const game = new Game("computer");

    expect(game.confirmSetup()).toBe("incomplete");

    expect(game.started).toBe(false);
  });

  test("two-player setup moves from player 1 to player 2 before starting", () => {
    const game = new Game("two-player");

    game.randomizeSetupFleet();

    expect(game.confirmSetup()).toBe("next-player");

    expect(game.setupPlayerIndex).toBe(1);

    expect(game.started).toBe(false);

    game.randomizeSetupFleet();

    expect(game.confirmSetup()).toBe("started");

    expect(game.started).toBe(true);
  });

  test("two-player game changes turns manually", () => {
    const game = new Game("two-player");

    game.randomizeSetupFleet();
    game.confirmSetup();

    game.randomizeSetupFleet();
    game.confirmSetup();

    expect(game.currentPlayerIndex).toBe(0);

    game.attack([0, 0]);

    expect(game.currentPlayerIndex).toBe(0);

    game.advanceTurn();

    expect(game.currentPlayerIndex).toBe(1);
  });
});
