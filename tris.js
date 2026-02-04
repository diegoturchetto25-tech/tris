/* --- JavaScript Logic --- */

const grid = document.getElementById('grid');
const dragX = document.getElementById('drag-x');
const dragO = document.getElementById('drag-o');
const panelX = document.getElementById('panel-x');
const panelO = document.getElementById('panel-o');
const statusText = document.getElementById('statusText');
const modal = document.getElementById('endModal');
const winnerText = document.getElementById('winnerText');

let currentPlayer = 'X';
let gameState = ["", "", "", "", "", "", "", "", ""];
let gameActive = true;

// Initialize Grid
function initGrid() {
    grid.innerHTML = '';
    gameState.forEach((cell, index) => {
        const cellDiv = document.createElement('div');
        cellDiv.classList.add('cell');
        cellDiv.setAttribute('data-index', index);

        // Add event listeners for drop targets
        cellDiv.addEventListener('dragover', handleDragOver);
        cellDiv.addEventListener('dragleave', handleDragLeave);
        cellDiv.addEventListener('drop', handleDrop);

        // Touch support setup (basic)
        cellDiv.addEventListener('click', () => handleMobileClick(index));

        grid.appendChild(cellDiv);
    });
}

// --- Drag Events (Source) ---
dragX.addEventListener('dragstart', (e) => handleDragStart(e, 'X'));
dragO.addEventListener('dragstart', (e) => handleDragStart(e, 'O'));

function handleDragStart(e, type) {
    if (!gameActive) {
        e.preventDefault();
        return;
    }
    if (type !== currentPlayer) {
        e.preventDefault(); // Prevent dragging wrong player
        statusText.innerText = `It is ${currentPlayer}'s turn!`;
        statusText.style.color = 'red';
        setTimeout(() => {
            statusText.innerText = `Current Turn: ${currentPlayer}`;
            statusText.style.color = '#555';
        }, 1000);
        return;
    }
    e.dataTransfer.setData('text/plain', type);
    e.dataTransfer.effectAllowed = 'copy';
}

// --- Drop Events (Grid) ---
function handleDragOver(e) {
    e.preventDefault(); // Necessary to allow dropping
    if (!gameActive) return;
    e.dataTransfer.dropEffect = 'copy';
    e.target.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.target.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.target.classList.remove('drag-over');

    const playerType = e.dataTransfer.getData('text/plain');
    const cellIndex = e.target.getAttribute('data-index');

    makeMove(cellIndex, playerType);
}

// --- Game Logic ---

// Mobile fallback: since standard HTML5 drag/drop is hard on mobile,
// we allow clicking the grid if the turn matches.
function handleMobileClick(index) {
    // For better UX on mobile, just clicking the empty square places the current player's piece
    // Simulating the "drag" result
    if (window.innerWidth < 800) { // Simple check for likely touch device/small screen
        makeMove(index, currentPlayer);
    }
}

function makeMove(index, player) {
    if (gameState[index] !== "" || !gameActive || player !== currentPlayer) {
        return;
    }

    // Update State
    gameState[index] = player;

    // Update UI
    const cells = document.querySelectorAll('.cell');
    const cell = cells[index];
    cell.innerText = player;
    cell.classList.add('piece', player.toLowerCase());

    checkResult();
}

function checkResult() {
    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    let roundWon = false;
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (gameState[a] === '' || gameState[b] === '' || gameState[c] === '') {
            continue;
        }
        if (gameState[a] === gameState[b] && gameState[b] === gameState[c]) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        endGame(false);
        return;
    }

    if (!gameState.includes("")) {
        endGame(true);
        return;
    }

    // Switch Turn
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    updateTurnUI();
}

function updateTurnUI() {
    statusText.innerText = `È il turno di: ${currentPlayer}`;

    if (currentPlayer === 'X') {
        panelX.classList.remove('inactive');
        panelX.classList.add('active', 'p1');
        panelO.classList.add('inactive');
        panelO.classList.remove('active');
    } else {
        panelO.classList.remove('inactive');
        panelO.classList.add('active');
        panelX.classList.add('inactive');
        panelX.classList.remove('active', 'p1');
    }
}

function endGame(draw) {
    gameActive = false;
    if (draw) {
        winnerText.innerText = "Pareggio!";
    } else {
        winnerText.innerText = `Tris! Il giocatore ${currentPlayer} vince!`;
        winnerText.style.color = currentPlayer === 'X' ? 'var(--x-color)' : 'var(--o-color)';
    }
    modal.classList.add('show');
}

function resetGame() {
    gameState = ["", "", "", "", "", "", "", "", ""];
    gameActive = true;
    currentPlayer = "X";
    modal.classList.remove('show');
    initGrid();
    updateTurnUI();
}

// Start
initGrid();