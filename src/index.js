import "./styles.css";

import Game from "./Game.js";

import {
  renderBattle,
  renderSetup,
  setStatus,
  showGameArea,
  showModeSelection,
  showPassScreen,
  updateSetupButtons,
} from "./dom.js";

let game = null;

let placementDirection = "horizontal";

let turnLocked = false;

let pendingTimer = null;

const computerModeButton = document.querySelector("#computer-mode-button");

const twoPlayerModeButton = document.querySelector("#two-player-mode-button");

const randomizeButton = document.querySelector("#randomize-button");

const clearButton = document.querySelector("#clear-button");

const rotateButton = document.querySelector("#rotate-button");

const readyButton = document.querySelector("#ready-button");

const restartButton = document.querySelector("#restart-button");

const menuButton = document.querySelector("#menu-button");

function clearPendingTimer() {
  if (pendingTimer !== null) {
    window.clearTimeout(pendingTimer);

    pendingTimer = null;
  }
}

function startMode(mode) {
  clearPendingTimer();

  game = new Game(mode);

  placementDirection = "horizontal";

  turnLocked = false;

  showGameArea();

  renderSetupPhase();
}

function renderSetupPhase(customMessage = null) {
  renderSetup(game, placementDirection, handleShipDrop);

  updateSetupButtons(placementDirection, game.isSetupFleetComplete());

  if (customMessage) {
    setStatus(customMessage);

    return;
  }

  setStatus(
    `${game.getSetupPlayerName()}: arrastrá los barcos al tablero o usá Generar flota.`,
  );
}

function handleShipDrop(length, coordinates) {
  const placed = game.placeSetupShip(length, coordinates, placementDirection);

  if (!placed) {
    renderSetupPhase(
      "Ese barco no entra ahí o se superpone con otro. Probá otra casilla.",
    );

    return;
  }

  if (game.isSetupFleetComplete()) {
    renderSetupPhase("Flota completa. Ya podés confirmar.");

    return;
  }

  renderSetupPhase("Barco colocado correctamente.");
}

function renderBattlePhase(customMessage = null) {
  renderBattle(game, handleBattleAttack, !turnLocked);

  if (game.gameOver) {
    setStatus(`¡${game.getWinnerName()} ganó la partida!`);

    return;
  }

  if (customMessage) {
    setStatus(customMessage);

    return;
  }

  setStatus(
    `Turno de ${game.getCurrentPlayerName()}: atacá una casilla del tablero enemigo.`,
  );
}

function handleBattleAttack(coordinates) {
  if (turnLocked) {
    return;
  }

  const attackerName = game.getCurrentPlayerName();

  const result = game.attack(coordinates);

  if (!result.valid) {
    return;
  }

  if (game.gameOver) {
    renderBattlePhase();

    return;
  }

  if (game.mode === "computer") {
    turnLocked = true;

    renderBattle(game, handleBattleAttack, false);

    setStatus(
      result.hit
        ? "¡Impacto! Ahora dispara la computadora..."
        : "Agua. Ahora dispara la computadora...",
    );

    pendingTimer = window.setTimeout(() => {
      const computerResult = game.computerAttack();

      pendingTimer = null;

      turnLocked = false;

      if (game.gameOver) {
        renderBattlePhase();

        return;
      }

      const computerMessage = computerResult.hit
        ? "La computadora acertó. Tu turno."
        : "La computadora falló. Tu turno.";

      renderBattlePhase(computerMessage);
    }, 600);

    return;
  }

  turnLocked = true;

  renderBattle(game, handleBattleAttack, false);

  setStatus(
    result.hit ? `${attackerName} acertó.` : `${attackerName} disparó al agua.`,
  );

  pendingTimer = window.setTimeout(() => {
    pendingTimer = null;

    game.advanceTurn();

    showPassScreen(
      `Pasá el dispositivo a ${game.getCurrentPlayerName()}. El otro jugador no debe mirar la pantalla.`,
      () => {
        turnLocked = false;

        renderBattlePhase();
      },
    );
  }, 800);
}

computerModeButton.addEventListener("click", () => {
  startMode("computer");
});

twoPlayerModeButton.addEventListener("click", () => {
  startMode("two-player");
});

randomizeButton.addEventListener("click", () => {
  game.randomizeSetupFleet();

  renderSetupPhase("Se generó una nueva flota aleatoria.");
});

clearButton.addEventListener("click", () => {
  game.clearSetupFleet();

  renderSetupPhase("Tablero limpio. Arrastrá tus barcos nuevamente.");
});

rotateButton.addEventListener("click", () => {
  placementDirection =
    placementDirection === "horizontal" ? "vertical" : "horizontal";

  renderSetupPhase(
    placementDirection === "horizontal"
      ? "Orientación horizontal."
      : "Orientación vertical.",
  );
});

readyButton.addEventListener("click", () => {
  const finishedPlayer = game.getSetupPlayerName();

  const result = game.confirmSetup();

  if (result === "incomplete") {
    setStatus("Primero tenés que colocar todos los barcos.");

    return;
  }

  if (result === "next-player") {
    placementDirection = "horizontal";

    showPassScreen(
      `La flota de ${finishedPlayer} está lista. Pasá el dispositivo a ${game.getSetupPlayerName()}.`,
      () => {
        renderSetupPhase();
      },
    );

    return;
  }

  if (result === "started" && game.mode === "two-player") {
    showPassScreen(
      `Las dos flotas están listas. Pasá el dispositivo a ${game.getCurrentPlayerName()}, que empieza la partida.`,
      () => {
        renderBattlePhase();
      },
    );

    return;
  }

  renderBattlePhase();
});

restartButton.addEventListener("click", () => {
  startMode(game.mode);
});

menuButton.addEventListener("click", () => {
  clearPendingTimer();

  game = null;

  turnLocked = false;

  showModeSelection();
});

showModeSelection();
