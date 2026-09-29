function createCell(row, column) {
  const cell = document.createElement("button");

  cell.classList.add("cell");

  cell.type = "button";

  cell.dataset.row = row;
  cell.dataset.column = column;

  return cell;
}

function renderBoard(gameboard, container, options = {}) {
  const {
    showShips = false,
    allowClicks = false,
    onCellClick = null,
    allowDrops = false,
    onDrop = null,
  } = options;

  container.innerHTML = "";

  for (let row = 0; row < gameboard.size; row += 1) {
    for (let column = 0; column < gameboard.size; column += 1) {
      const cell = createCell(row, column);

      const ship = gameboard.board[row][column];

      const attacked = gameboard.wasAttacked([row, column]);

      if (attacked && ship !== null) {
        cell.classList.add("hit");

        cell.textContent = "X";
      } else if (attacked) {
        cell.classList.add("miss");

        cell.textContent = "•";
      } else if (showShips && ship !== null) {
        cell.classList.add("ship");
      }

      if (allowDrops) {
        cell.classList.add("placement-cell");

        cell.addEventListener("dragover", (event) => {
          event.preventDefault();

          cell.classList.add("drop-target");
        });

        cell.addEventListener("dragleave", () => {
          cell.classList.remove("drop-target");
        });

        cell.addEventListener("drop", (event) => {
          event.preventDefault();

          cell.classList.remove("drop-target");

          const length = Number(event.dataTransfer.getData("text/plain"));

          if (Number.isNaN(length) || !onDrop) {
            return;
          }

          onDrop(length, [row, column]);
        });
      } else if (allowClicks && !attacked && onCellClick) {
        cell.addEventListener("click", () => {
          onCellClick([row, column]);
        });
      } else {
        cell.disabled = true;
      }

      container.appendChild(cell);
    }
  }
}

function renderShipDock(lengths, direction) {
  const dock = document.querySelector("#ship-dock");

  dock.innerHTML = "";

  if (lengths.length === 0) {
    const message = document.createElement("p");

    message.classList.add("fleet-complete-message");

    message.textContent = "Todos los barcos están colocados.";

    dock.appendChild(message);

    return;
  }

  lengths.forEach((length) => {
    const ship = document.createElement("div");

    ship.classList.add("dock-ship", direction);

    ship.draggable = true;

    ship.dataset.length = length;

    ship.title = `Barco de ${length} casillas`;

    ship.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", String(length));

      event.dataTransfer.effectAllowed = "move";
    });

    for (let i = 0; i < length; i += 1) {
      const segment = document.createElement("span");

      segment.classList.add("dock-segment");

      ship.appendChild(segment);
    }

    dock.appendChild(ship);
  });
}

export function showModeSelection() {
  document.querySelector("#mode-panel").hidden = false;

  document.querySelector("#game-panel").hidden = true;

  document.querySelector("#pass-screen").hidden = true;
}

export function showGameArea() {
  document.querySelector("#mode-panel").hidden = true;

  document.querySelector("#game-panel").hidden = false;
}

export function renderSetup(game, direction, onShipDrop) {
  const setupControls = document.querySelector("#setup-controls");

  const dockSection = document.querySelector("#dock-section");

  const ownWrapper = document.querySelector("#own-board-wrapper");

  const enemyWrapper = document.querySelector("#enemy-board-wrapper");

  setupControls.hidden = false;

  dockSection.hidden = false;

  ownWrapper.hidden = false;

  enemyWrapper.hidden = true;

  document.querySelector("#own-board-title").textContent =
    `Flota de ${game.getSetupPlayerName()}`;

  const playerBoard = document.querySelector("#player-board");

  renderBoard(game.setupPlayer.gameboard, playerBoard, {
    showShips: true,
    allowDrops: true,
    onDrop: onShipDrop,
  });

  renderShipDock(game.getRemainingFleetLengths(), direction);
}

export function renderBattle(game, onEnemyCellClick, allowAttack = true) {
  const setupControls = document.querySelector("#setup-controls");

  const dockSection = document.querySelector("#dock-section");

  const ownWrapper = document.querySelector("#own-board-wrapper");

  const enemyWrapper = document.querySelector("#enemy-board-wrapper");

  setupControls.hidden = true;

  dockSection.hidden = true;

  ownWrapper.hidden = false;

  enemyWrapper.hidden = false;

  document.querySelector("#own-board-title").textContent =
    `Tablero de ${game.getCurrentPlayerName()}`;

  document.querySelector("#enemy-board-title").textContent =
    `Objetivo: ${game.getEnemyPlayerName()}`;

  const playerBoard = document.querySelector("#player-board");

  const computerBoard = document.querySelector("#computer-board");

  renderBoard(game.currentPlayer.gameboard, playerBoard, {
    showShips: true,
  });

  renderBoard(game.enemyPlayer.gameboard, computerBoard, {
    showShips: false,
    allowClicks: allowAttack && !game.gameOver,
    onCellClick: onEnemyCellClick,
  });
}

export function setStatus(message) {
  document.querySelector("#status").textContent = message;
}

export function updateSetupButtons(direction, canConfirm) {
  const rotateButton = document.querySelector("#rotate-button");

  const readyButton = document.querySelector("#ready-button");

  rotateButton.textContent =
    direction === "horizontal"
      ? "Orientación: Horizontal"
      : "Orientación: Vertical";

  readyButton.disabled = !canConfirm;
}

export function showPassScreen(message, onContinue) {
  const passScreen = document.querySelector("#pass-screen");

  const passMessage = document.querySelector("#pass-message");

  const continueButton = document.querySelector("#continue-button");

  passMessage.textContent = message;

  passScreen.hidden = false;

  continueButton.onclick = () => {
    passScreen.hidden = true;

    continueButton.onclick = null;

    onContinue();
  };
}
