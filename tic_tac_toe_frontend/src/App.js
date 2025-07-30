import React, { useState, useEffect } from "react";
import "./App.css";

// --- THEME COLORS ---
const COLORS = {
  primary: "#1976D2",
  secondary: "#424242",
  accent: "#FFC107",
  lightBg: "#FFFFFF",
  lightBoard: "#F5F9FF",
  border: "#E0E0E0",
  x: "#1976D2",
  o: "#FFC107",
  text: "#232323",
};

// --- GAME MODES ---
const GAME_MODES = {
  PvP: "2 Players",
  PvC: "Vs Computer",
};

// --- HELPERS ---
function getEmptyBoard() {
  return Array(9).fill(null);
}
function getWinner(board) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6], // diags
  ];
  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c])
      return board[a];
  }
  return null;
}
function isBoardFull(board) {
  return board.every((cell) => cell !== null);
}
function getAvailableMoves(board) {
  return board.map((cell, i) => (cell === null ? i : null)).filter((x) => x !== null);
}

// --- COMPUTER MOVE (Dumb AI, can be replaced with minimax for harder AI) ---
function computerMove(board) {
  // Try to win, block, or move randomly
  // First, check for a winning move or block in one move
  // 'O' is computer, 'X' is player
  const opponent = 'X';
  const ai = 'O';
  const avail = getAvailableMoves(board);

  // try to win
  for (let idx of avail) {
    const copy = [...board];
    copy[idx] = ai;
    if (getWinner(copy) === ai) return idx;
  }
  // block opponent win
  for (let idx of avail) {
    const copy = [...board];
    copy[idx] = opponent;
    if (getWinner(copy) === opponent) return idx;
  }
  // take center if available
  if (avail.includes(4)) return 4;
  // take a random
  return avail[Math.floor(Math.random() * avail.length)];
}

// --- COMPONENTS ---

// PUBLIC_INTERFACE
function ScoreBoard({ scores, currentPlayer, mode }) {
  /** Displays player scores and current turn. */
  return (
    <div className="scoreboard">
      <div>
        <span className={`player-label${currentPlayer === "X" ? " active" : ""}`}>X</span>
        <span className="score-num" style={{ color: COLORS.x }}>{scores.X}</span>
      </div>
      <div>
        <span className={`player-label${currentPlayer === "O" ? " active" : ""}`}>O</span>
        <span className="score-num" style={{ color: COLORS.o }}>{scores.O}</span>
      </div>
      <div>
        <span className="mode-label">{mode}</span>
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function GameBoard({ board, onCellClick, isDisabled, winner, winningLine }) {
  /** Renders tic-tac-toe board with clickable cells. */
  return (
    <div className="ttt-board">
      {board.map((val, idx) => (
        <button
          className={`ttt-cell${winningLine && winningLine.includes(idx) ? " winner-cell" : ""}`}
          key={idx}
          aria-label={`Tic Tac Toe Cell ${idx + 1}`}
          disabled={!!val || isDisabled || !!winner}
          onClick={() => onCellClick(idx)}
        >
          {val === "X" && <span className="cell-x">X</span>}
          {val === "O" && <span className="cell-o">O</span>}
        </button>
      ))}
    </div>
  );
}

// PUBLIC_INTERFACE
function ModeSelector({ mode, onChange, disabled }) {
  /** Selects play mode (PvP or PvC). */
  return (
    <div className="mode-selector">
      {Object.entries(GAME_MODES).map(([val, label]) => (
        <button
          key={val}
          className={`mode-btn${mode === val ? " selected" : ""}`}
          onClick={() => onChange(val)}
          disabled={disabled}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// PUBLIC_INTERFACE
function RestartButton({ onRestart, disabled }) {
  /** Button to restart the game. */
  return (
    <button className="restart-btn" onClick={onRestart} disabled={disabled}>
      Restart Game
    </button>
  );
}

// --- MAIN APP ---

// PUBLIC_INTERFACE
function App() {
  /** Main Tic Tac Toe app with game logic and UI. */
  // State
  const [mode, setMode] = useState("PvC");
  const [board, setBoard] = useState(getEmptyBoard());
  const [xIsNext, setXIsNext] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0 });
  const [winner, setWinner] = useState(null);
  const [winningLine, setWinningLine] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Color theme is fixed, so override css vars on mount
  useEffect(() => {
    document.body.style.background = COLORS.lightBg;
    document.body.style.color = COLORS.text;
  }, []);

  // Check for win/tie after every move
  useEffect(() => {
    const result = getWinner(board);
    if (result) {
      setWinner(result);
      setScores((s) => ({ ...s, [result]: s[result] + 1 }));
      setStatusMsg(
        result === "X"
          ? "Player X wins!"
          : mode === "PvC"
          ? "Computer wins!"
          : "Player O wins!"
      );
      // highlight winning line
      setWinningLine(findWinningLine(board, result));
    } else if (isBoardFull(board)) {
      setStatusMsg("It's a Tie!");
    } else {
      setStatusMsg(
        winner
          ? ""
          : `Turn: ${
              xIsNext
                ? "X"
                : mode === "PvC"
                ? "Computer (O)"
                : "O"
            }`
      );
    }
    // eslint-disable-next-line
  }, [board, winner, mode, xIsNext]);

  // AI move for PvC
  useEffect(() => {
    if (
      mode === "PvC" &&
      !winner &&
      !isBoardFull(board) &&
      !xIsNext // O is AI
    ) {
      const aiTimeout = setTimeout(() => {
        const move = computerMove(board);
        handleCellClick(move, true);
      }, 600); // delay for realism
      return () => clearTimeout(aiTimeout);
    }
    // eslint-disable-next-line
  }, [xIsNext, board, winner, mode]);

  // Get winning line for highlight
  function findWinningLine(b, w) {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (const l of lines) {
      const [a, b2, c] = l;
      if (b[a] === w && b[b2] === w && b[c] === w) return l;
    }
    return null;
  }

  // Handle cell click
  function handleCellClick(idx, byAI = false) {
    if (board[idx] || winner || (mode === "PvC" && !xIsNext && !byAI)) return;
    setBoard((prev) => {
      const next = [...prev];
      next[idx] = xIsNext ? "X" : "O";
      return next;
    });
    setXIsNext((x) => !x);
  }

  // Handle mode switch
  function handleModeChange(newMode) {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setMode(newMode);
    setTimeout(() => {
      restartGame(true, newMode);
      setIsTransitioning(false);
    }, 250);
  }

  // Restart game (leave scores)
  function restartGame(resetScores = false, modeOverride = null) {
    setBoard(getEmptyBoard());
    setXIsNext(true);
    setWinner(null);
    setWinningLine(null);
    setStatusMsg("");
    if (resetScores) setScores({ X: 0, O: 0 });
    if (modeOverride) setMode(modeOverride);
  }

  // --- RENDER ---
  return (
    <div className="ttt-root">
      <div className="ttt-container">
        <h1 className="ttt-title">Tic Tac Toe</h1>
        <ModeSelector mode={mode} onChange={handleModeChange} disabled={isTransitioning} />
        <ScoreBoard scores={scores} currentPlayer={xIsNext ? "X" : "O"} mode={GAME_MODES[mode]} />
        <div className="status-msg">{statusMsg || <>&nbsp;</>}</div>
        <GameBoard
          board={board}
          onCellClick={handleCellClick}
          isDisabled={mode === "PvC" && !xIsNext}
          winner={winner}
          winningLine={winningLine}
        />
        <RestartButton onRestart={() => restartGame(false)} disabled={false} />
        <footer className="ttt-footer">
          <span>
            <span style={{ color: COLORS.primary, fontWeight: 600 }}>X</span> Player
            &nbsp;|&nbsp;
            <span style={{ color: COLORS.o, fontWeight: 600 }}>O</span> {mode === "PvC" ? "Computer" : "Player"}
          </span>
        </footer>
      </div>
    </div>
  );
}

export default App;
