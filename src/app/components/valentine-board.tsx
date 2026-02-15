import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Home, Heart, Sparkles, Sun, Moon, X } from "lucide-react";
import { useTheme } from "./theme-provider";

type GameMode = "pvp" | "solo";
type GamePhase = "player1" | "handoff" | "player2" | "reveal";

interface ValentineBoardProps {
  mode: GameMode;
  onBackToMenu: () => void;
}

export function ValentineBoard({ mode, onBackToMenu }: ValentineBoardProps) {
  const { theme, toggleTheme } = useTheme();
  const [phase, setPhase] = useState<GamePhase>("player1");
  const [player1Picks, setPlayer1Picks] = useState<number[]>([]);
  const [player2Picks, setPlayer2Picks] = useState<number[]>([]);
  const [cupidPicks, setCupidPicks] = useState<number[]>([]);
  const [currentSelection, setCurrentSelection] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Sound effects
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

  const handleSquareClick = (index: number) => {
    if (currentSelection.includes(index)) {
      // Deselect
      setCurrentSelection(currentSelection.filter((i) => i !== index));
      playSound(300);
    } else if (currentSelection.length < 3) {
      // Select
      setCurrentSelection([...currentSelection, index]);
      playSound(600);
    }
  };

  const handlePlayer1Done = () => {
    setPlayer1Picks(currentSelection);
    setCurrentSelection([]);
    setPhase("handoff");
    playSound(440, 150);
  };

  const handleHandoffDone = () => {
    setPhase("player2");
  };

  const handlePlayer2Done = () => {
    setPlayer2Picks(currentSelection);
    setCurrentSelection([]);
    
    // Generate Cupid picks if solo mode
    if (mode === "solo") {
      const randomPicks: number[] = [];
      while (randomPicks.length < 3) {
        const random = Math.floor(Math.random() * 9);
        if (!randomPicks.includes(random)) {
          randomPicks.push(random);
        }
      }
      setCupidPicks(randomPicks);
    }
    
    setPhase("reveal");
    // Play reveal sound
    setTimeout(() => playSound(523, 150), 0);
    setTimeout(() => playSound(659, 150), 150);
    setTimeout(() => playSound(784, 300), 300);
    
    // Show modal after animations complete (10 seconds to view the board)
    setTimeout(() => setShowModal(true), 10000);
  };

  const resetGame = () => {
    setPhase("player1");
    setPlayer1Picks([]);
    setPlayer2Picks([]);
    setCupidPicks([]);
    setCurrentSelection([]);
    setShowModal(false);
    playSound(200, 100);
  };

  const getMatches = (): number[] => {
    const picks2 = mode === "solo" ? cupidPicks : player2Picks;
    return player1Picks.filter((pick) => picks2.includes(pick));
  };

  const getCompatibilityMessage = (matchCount: number): { text: string; emoji: string } => {
    const messages = [
      { text: mode === "solo" ? "Cupid is playing hard to get 😌" : "Opposites attract 😌", emoji: "💫" },
      { text: mode === "solo" ? "Cupid noticed you ✨" : "There's a spark ✨", emoji: "✨" },
      { text: mode === "solo" ? "Cupid approves 💞" : "Strong vibes 💞", emoji: "💞" },
      { text: mode === "solo" ? "Cupid shipped it 💘" : "Soulmate energy 💘", emoji: "💘" },
    ];
    return messages[matchCount];
  };

  const getSquareState = (index: number) => {
    if (phase === "reveal") {
      const picks2 = mode === "solo" ? cupidPicks : player2Picks;
      const isPlayer1 = player1Picks.includes(index);
      const isPlayer2 = picks2.includes(index);
      const isMatch = isPlayer1 && isPlayer2;

      return {
        isPlayer1,
        isPlayer2,
        isMatch,
      };
    }

    return {
      isPlayer1: false,
      isPlayer2: false,
      isMatch: false,
    };
  };

  const renderSquare = (index: number) => {
    const isSelected = currentSelection.includes(index);
    const { isPlayer1, isPlayer2, isMatch } = getSquareState(index);

    let bgColor = "bg-white dark:bg-rose-900/30";
    let borderColor = "border-pink-200 dark:border-pink-700";

    if (phase !== "reveal") {
      if (isSelected) {
        bgColor = "bg-pink-100 dark:bg-pink-800";
        borderColor = "border-pink-400 dark:border-pink-500";
      }
    } else {
      if (isMatch) {
        bgColor = "bg-red-300 dark:bg-red-600";
        borderColor = "border-red-500 dark:border-red-400";
      } else if (isPlayer1) {
        bgColor = "bg-pink-100 dark:bg-pink-800";
        borderColor = "border-pink-400 dark:border-pink-500";
      } else if (isPlayer2) {
        bgColor = "bg-rose-100 dark:bg-rose-800";
        borderColor = "border-rose-400 dark:border-rose-500";
      }
    }

    const canClick = phase !== "reveal" && phase !== "handoff";
    const isDisabled = canClick && currentSelection.length >= 3 && !isSelected;

    return (
      <motion.button
        key={index}
        onClick={() => canClick && !isDisabled && handleSquareClick(index)}
        disabled={!canClick || isDisabled}
        className={`aspect-square rounded-xl ${bgColor} ${borderColor}
          border-4 shadow-lg flex items-center justify-center
          transition-all duration-300
          ${phase === "reveal" ? "" : (!canClick || isDisabled ? "cursor-not-allowed opacity-50" : "hover:scale-105 active:scale-95")}
          ${isSelected ? "scale-105" : ""}`}
        whileTap={canClick && !isDisabled ? { scale: 0.9 } : {}}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        aria-label={`Square ${index + 1}`}
      >
        {phase === "reveal" && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: index * 0.1 }}
            className="text-4xl"
          >
            {isMatch ? "💘" : isPlayer1 ? "💗" : isPlayer2 ? "🌹" : ""}
          </motion.div>
        )}
        {phase !== "reveal" && isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-4xl"
          >
            💗
          </motion.div>
        )}
      </motion.button>
    );
  };

  const matches = phase === "reveal" ? getMatches() : [];
  const compatibilityMessage = phase === "reveal" ? getCompatibilityMessage(matches.length) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-100 to-red-100 dark:from-rose-950 dark:via-pink-950 dark:to-red-950 p-4 flex flex-col transition-colors duration-300">
      {/* Theme Toggle */}
      <motion.button
        onClick={toggleTheme}
        className="absolute top-4 right-4 bg-white dark:bg-rose-900 rounded-full p-3 shadow-lg hover:shadow-xl active:scale-95 z-10"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Toggle theme"
      >
        {theme === "light" ? (
          <Moon className="size-6 text-gray-700 dark:text-pink-200" />
        ) : (
          <Sun className="size-6 text-yellow-500" />
        )}
      </motion.button>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <motion.button
          onClick={onBackToMenu}
          className="bg-white dark:bg-rose-900 rounded-full p-3 shadow-lg hover:shadow-xl active:scale-95"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Back to menu"
        >
          <Home className="size-6 text-gray-700 dark:text-pink-200" />
        </motion.button>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-pink-800 dark:text-pink-200 flex items-center gap-2 justify-center">
            <Heart className="size-6 fill-pink-500 dark:fill-pink-400" />
            Valentine Mode
            <Heart className="size-6 fill-pink-500 dark:fill-pink-400" />
          </h2>
        </div>

        <div className="w-12"></div>
      </div>

      {/* Hand-off Screen */}
      <AnimatePresence>
        {phase === "handoff" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gradient-to-br from-pink-200 to-red-200 dark:from-rose-900 dark:to-pink-900 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring" }}
              className="bg-white dark:bg-rose-950 rounded-3xl p-8 shadow-2xl max-w-md w-full text-center border-2 dark:border-pink-700"
            >
              <div className="text-6xl mb-6">💌</div>
              <h3 className="text-3xl font-bold text-gray-800 dark:text-pink-100 mb-6">
                Hand over to {mode === "solo" ? "continue" : "Player 2"}
              </h3>
              <motion.button
                onClick={handleHandoffDone}
                className="bg-gradient-to-r from-pink-500 to-red-500 dark:from-pink-600 dark:to-red-600 text-white 
                  px-8 py-4 rounded-xl text-lg font-semibold shadow-lg
                  hover:shadow-xl transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {mode === "solo" ? "Continue" : "I'm Player 2"}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title */}
      {phase !== "handoff" && (
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h3 className="text-2xl font-bold text-pink-800 dark:text-pink-200">
            {phase === "player1" && `${mode === "solo" ? "Your Turn" : "Player 1"}: Pick 3 squares 💘`}
            {phase === "player2" && `${mode === "solo" ? "Cupid's Turn..." : "Player 2"}: Pick 3 squares 💘`}
            {phase === "reveal" && "Compatibility Reveal ✨"}
          </h3>
          {phase !== "reveal" && (
            <p className="text-pink-600 dark:text-pink-300 mt-2">
              {currentSelection.length}/3 selected
            </p>
          )}
          {phase === "reveal" && (
            <div className="flex gap-3 justify-center mt-3">
              <div className="flex items-center gap-1.5 bg-pink-100 dark:bg-pink-800/50 px-3 py-1.5 rounded-lg border-2 border-pink-300 dark:border-pink-600">
                <span className="text-xl">💗</span>
                <span className="text-xs font-semibold text-pink-700 dark:text-pink-200">
                  {mode === "solo" ? "You" : "P1"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-rose-100 dark:bg-rose-800/50 px-3 py-1.5 rounded-lg border-2 border-rose-300 dark:border-rose-600">
                <span className="text-xl">🌹</span>
                <span className="text-xs font-semibold text-rose-700 dark:text-rose-200">
                  {mode === "solo" ? "Cupid" : "P2"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-red-200 dark:bg-red-700/50 px-3 py-1.5 rounded-lg border-2 border-red-400 dark:border-red-500">
                <span className="text-xl">💘</span>
                <span className="text-xs font-semibold text-red-700 dark:text-red-100">Match!</span>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Game Board */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="grid grid-cols-3 gap-3 aspect-square">
            {Array.from({ length: 9 }).map((_, index) => renderSquare(index))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {phase !== "handoff" && (
        <div className="flex justify-center mt-6 pb-6 gap-4">
          {phase === "player1" && currentSelection.length === 3 && (
            <motion.button
              onClick={handlePlayer1Done}
              className="bg-gradient-to-r from-pink-500 to-red-500 text-white 
                px-8 py-4 rounded-xl text-lg font-semibold shadow-lg
                hover:shadow-xl transition-all flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Heart className="size-5" />
              {mode === "solo" ? "Continue" : "Pass to Player 2"}
            </motion.button>
          )}

          {phase === "player2" && currentSelection.length === 3 && (
            <motion.button
              onClick={handlePlayer2Done}
              className="bg-gradient-to-r from-pink-500 to-red-500 text-white 
                px-8 py-4 rounded-xl text-lg font-semibold shadow-lg
                hover:shadow-xl transition-all flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Sparkles className="size-5" />
              Reveal Compatibility
            </motion.button>
          )}

          {phase === "reveal" && (
            <motion.button
              onClick={resetGame}
              className="bg-gradient-to-r from-pink-500 to-red-500 text-white 
                px-8 py-4 rounded-xl text-lg font-semibold shadow-lg
                hover:shadow-xl transition-all flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Heart className="size-5" />
              Try Another Match 💘
            </motion.button>
          )}
        </div>
      )}

      {/* Results Modal */}
      <AnimatePresence>
        {phase === "reveal" && showModal && compatibilityMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/10 dark:bg-black/20 flex items-center justify-center p-4 z-40"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="bg-white/98 dark:bg-rose-950/98 backdrop-blur-sm rounded-3xl p-8 shadow-2xl max-w-md w-full text-center border-2 dark:border-pink-700 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <motion.button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 bg-pink-100 dark:bg-pink-800 rounded-full p-2 hover:bg-pink-200 dark:hover:bg-pink-700 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Close modal"
              >
                <X className="size-5 text-pink-700 dark:text-pink-200" />
              </motion.button>

              <div className="text-7xl mb-4">{compatibilityMessage.emoji}</div>
              <h3 className="text-3xl font-bold text-pink-800 dark:text-pink-100 mb-4">
                {matches.length} {matches.length === 1 ? "Match" : "Matches"}!
              </h3>
              <p className="text-xl text-gray-700 dark:text-pink-200 mb-6">
                {compatibilityMessage.text}
              </p>
              <div className="flex gap-2 justify-center mb-6">
                <div className="flex items-center gap-2 bg-pink-100 dark:bg-pink-800 px-4 py-2 rounded-lg">
                  <span className="text-2xl">💗</span>
                  <span className="text-sm text-gray-700 dark:text-pink-100">
                    {mode === "solo" ? "You" : "Player 1"}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-rose-100 dark:bg-rose-800 px-4 py-2 rounded-lg">
                  <span className="text-2xl">🌹</span>
                  <span className="text-sm text-gray-700 dark:text-rose-100">
                    {mode === "solo" ? "Cupid" : "Player 2"}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-red-200 dark:bg-red-700 px-4 py-2 rounded-lg">
                  <span className="text-2xl">💘</span>
                  <span className="text-sm text-gray-700 dark:text-red-100">Match</span>
                </div>
              </div>
              <p className="text-sm text-pink-600 dark:text-pink-300 mb-4 italic">
                Click the X or outside to see the board clearly
              </p>
              <motion.button
                onClick={resetGame}
                className="bg-gradient-to-r from-pink-500 to-red-500 dark:from-pink-600 dark:to-red-600 text-white 
                  px-8 py-4 rounded-xl text-lg font-semibold shadow-lg
                  hover:shadow-xl transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Try Another Match 💘
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}