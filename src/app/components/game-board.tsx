import { useState, useEffect } from "react";
import { GameSquare } from "./game-square";
import { motion, AnimatePresence } from "motion/react";
import { RotateCcw, Home, Trophy, Sun, Moon } from "lucide-react";
import { useTheme } from "./theme-provider";

type Player = "X" | "O";
type Board = (Player | null)[];
type GameMode = "pvp" | "pve";

interface GameBoardProps {
  mode: GameMode;
  onBackToMenu: () => void;
}

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6], // Diagonals
];

export function GameBoard({ mode, onBackToMenu }: GameBoardProps) {
  const { theme, toggleTheme } = useTheme();
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X");
  const [winner, setWinner] = useState<Player | "draw" | null>(null);
  const [winningSquares, setWinningSquares] = useState<number[]>([]);
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });

  // Sound effects using Web Audio API
  const playSound = (frequency: number, duration: number = 100) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
  };

  const checkWinner = (currentBoard: Board): { winner: Player | "draw" | null; winningSquares: number[] } => {
    // Check for winning combinations
    for (const combination of WINNING_COMBINATIONS) {
      const [a, b, c] = combination;
      if (
        currentBoard[a] &&
        currentBoard[a] === currentBoard[b] &&
        currentBoard[a] === currentBoard[c]
      ) {
        return { winner: currentBoard[a] as Player, winningSquares: combination };
      }
    }

    // Check for draw
    if (currentBoard.every((square) => square !== null)) {
      return { winner: "draw", winningSquares: [] };
    }

    return { winner: null, winningSquares: [] };
  };

  const makeMove = (index: number, player: Player) => {
    if (board[index] || winner) return false;

    const newBoard = [...board];
    newBoard[index] = player;
    setBoard(newBoard);

    // Play click sound
    playSound(player === "X" ? 440 : 550);

    const result = checkWinner(newBoard);
    if (result.winner) {
      setWinner(result.winner);
      setWinningSquares(result.winningSquares);
      
      // Play win/draw sound
      if (result.winner === "draw") {
        playSound(300, 200);
      } else {
        // Victory fanfare
        setTimeout(() => playSound(523, 150), 0);
        setTimeout(() => playSound(659, 150), 150);
        setTimeout(() => playSound(784, 300), 300);
      }

      // Update scores
      setScores(prev => ({
        ...prev,
        X: result.winner === "X" ? prev.X + 1 : prev.X,
        O: result.winner === "O" ? prev.O + 1 : prev.O,
        draws: result.winner === "draw" ? prev.draws + 1 : prev.draws,
      }));

      return true;
    }

    setCurrentPlayer(player === "X" ? "O" : "X");
    return true;
  };

  const handleSquareClick = (index: number) => {
    if (mode === "pve" && currentPlayer === "O") return; // Prevent clicking during bot's turn
    makeMove(index, currentPlayer);
  };

  // Bot AI
  useEffect(() => {
    if (mode === "pve" && currentPlayer === "O" && !winner) {
      const timeout = setTimeout(() => {
        const availableSquares = board
          .map((square, index) => (square === null ? index : null))
          .filter((index): index is number => index !== null);

        if (availableSquares.length > 0) {
          // Simple AI: Try to win, block player, or pick random
          const botMove = findBestMove(board) ?? availableSquares[Math.floor(Math.random() * availableSquares.length)];
          makeMove(botMove, "O");
        }
      }, 500); // Delay for more natural feel

      return () => clearTimeout(timeout);
    }
  }, [currentPlayer, mode, winner]);

  const findBestMove = (currentBoard: Board): number | null => {
    // Try to win
    for (let i = 0; i < 9; i++) {
      if (!currentBoard[i]) {
        const testBoard = [...currentBoard];
        testBoard[i] = "O";
        if (checkWinner(testBoard).winner === "O") return i;
      }
    }

    // Block player from winning
    for (let i = 0; i < 9; i++) {
      if (!currentBoard[i]) {
        const testBoard = [...currentBoard];
        testBoard[i] = "X";
        if (checkWinner(testBoard).winner === "X") return i;
      }
    }

    // Take center if available
    if (!currentBoard[4]) return 4;

    // Take corners
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(i => !currentBoard[i]);
    if (availableCorners.length > 0) {
      return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }

    return null;
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer("X");
    setWinner(null);
    setWinningSquares([]);
    playSound(200, 100);
  };

  const resetScores = () => {
    setScores({ X: 0, O: 0, draws: 0 });
    resetGame();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4 flex flex-col transition-colors duration-300">
      {/* Theme Toggle Button */}
      <motion.button
        onClick={toggleTheme}
        className="absolute top-4 right-4 bg-white dark:bg-gray-700 rounded-full p-3 shadow-lg hover:shadow-xl active:scale-95 z-10"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Toggle theme"
      >
        {theme === "light" ? (
          <Moon className="size-6 text-gray-700 dark:text-gray-200" />
        ) : (
          <Sun className="size-6 text-yellow-500" />
        )}
      </motion.button>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <motion.button
          onClick={onBackToMenu}
          className="bg-white dark:bg-gray-700 rounded-full p-3 shadow-lg hover:shadow-xl active:scale-95"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Back to menu"
        >
          <Home className="size-6 text-gray-700 dark:text-gray-200" />
        </motion.button>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {mode === "pvp" ? "2 Players" : "VS Computer"}
          </h2>
        </div>

        <motion.button
          onClick={resetScores}
          className="bg-white dark:bg-gray-700 rounded-full p-3 shadow-lg hover:shadow-xl active:scale-95"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Reset scores"
        >
          <RotateCcw className="size-6 text-gray-700 dark:text-gray-200" />
        </motion.button>
      </div>

      {/* Scoreboard */}
      <div className="flex justify-center gap-4 mb-6">
        <div className="bg-blue-500 dark:bg-blue-600 text-white rounded-xl px-6 py-3 shadow-lg">
          <div className="text-sm opacity-90">Player X</div>
          <div className="text-2xl font-bold text-center">{scores.X}</div>
        </div>
        <div className="bg-gray-500 dark:bg-gray-600 text-white rounded-xl px-6 py-3 shadow-lg">
          <div className="text-sm opacity-90">Draws</div>
          <div className="text-2xl font-bold text-center">{scores.draws}</div>
        </div>
        <div className="bg-pink-500 dark:bg-pink-600 text-white rounded-xl px-6 py-3 shadow-lg">
          <div className="text-sm opacity-90">{mode === "pvp" ? "Player O" : "Computer"}</div>
          <div className="text-2xl font-bold text-center">{scores.O}</div>
        </div>
      </div>

      {/* Current Turn Indicator */}
      {!winner && (
        <motion.div
          key={currentPlayer}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <p className="text-xl font-semibold text-gray-700 dark:text-gray-200">
            Current Turn: <span className={currentPlayer === "X" ? "text-blue-600 dark:text-blue-400" : "text-pink-600 dark:text-pink-400"}>{currentPlayer}</span>
          </p>
        </motion.div>
      )}

      {/* Game Board */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="grid grid-cols-3 gap-3 aspect-square">
            {board.map((value, index) => (
              <GameSquare
                key={index}
                value={value}
                onClick={() => handleSquareClick(index)}
                isWinning={winningSquares.includes(index)}
                disabled={!!winner || (mode === "pve" && currentPlayer === "O")}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Winner Modal */}
      <AnimatePresence>
        {winner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={resetGame}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl max-w-md w-full text-center"
              onClick={(e) => e.stopPropagation()}
            >
              {winner === "draw" ? (
                <>
                  <div className="text-6xl mb-4">🤝</div>
                  <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">It's a Draw!</h3>
                </>
              ) : (
                <>
                  <Trophy className="size-20 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                    <span className={winner === "X" ? "text-blue-600 dark:text-blue-400" : "text-pink-600 dark:text-pink-400"}>
                      {winner}
                    </span> Wins!
                  </h3>
                </>
              )}
              <motion.button
                onClick={resetGame}
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white 
                  px-8 py-4 rounded-xl text-lg font-semibold shadow-lg
                  hover:shadow-xl active:scale-95 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Play Again
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Play Again Button (when game ended, also accessible below board) */}
      {winner && (
        <div className="flex justify-center mt-6 pb-6">
          <motion.button
            onClick={resetGame}
            className="bg-white dark:bg-gray-700 px-8 py-4 rounded-xl text-lg font-semibold 
              shadow-lg hover:shadow-xl active:scale-95 transition-all
              flex items-center gap-2 text-gray-800 dark:text-white"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw className="size-5" />
            New Game
          </motion.button>
        </div>
      )}
    </div>
  );
}