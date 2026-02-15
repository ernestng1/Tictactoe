import { Users, Bot, Sun, Moon, Heart } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "./theme-provider";

interface ModeSelectionProps {
  onSelectMode: (mode: "pvp" | "pve" | "valentine") => void;
}

export function ModeSelection({ onSelectMode }: ModeSelectionProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-6 transition-colors duration-300">
      {/* Theme Toggle Button */}
      <motion.button
        onClick={toggleTheme}
        className="absolute top-6 right-6 bg-white dark:bg-gray-700 rounded-full p-3 shadow-lg hover:shadow-xl active:scale-95"
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

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-6"
      >
        <h1 className="text-6xl font-bold text-gray-800 dark:text-white mb-4 font-[Pixelify_Sans]">Tic-Tac-Toe</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">Choose your game mode</p>
      </motion.div>

      <div className="flex flex-col gap-6 w-full max-w-md">
        <motion.button
          onClick={() => onSelectMode("pvp")}
          className="bg-white dark:bg-gray-700 rounded-2xl p-8 shadow-xl hover:shadow-2xl
            flex flex-col items-center gap-4 transition-all duration-300
            border-4 border-transparent hover:border-blue-400 active:scale-95"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          aria-label="Play with another player"
        >
          <Users className="size-16 text-blue-600 dark:text-blue-400" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">2 Players</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Play with a friend</p>
          </div>
        </motion.button>

        <motion.button
          onClick={() => onSelectMode("pve")}
          className="bg-white dark:bg-gray-700 rounded-2xl p-8 shadow-xl hover:shadow-2xl
            flex flex-col items-center gap-4 transition-all duration-300
            border-4 border-transparent hover:border-pink-400 active:scale-95"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          aria-label="Play against computer"
        >
          <Bot className="size-16 text-pink-600 dark:text-pink-400" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">VS Computer</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Challenge the bot</p>
          </div>
        </motion.button>

        <motion.button
          onClick={() => onSelectMode("valentine")}
          className="bg-gradient-to-br from-pink-100 to-red-100 dark:from-pink-900 dark:to-red-900 rounded-2xl p-8 shadow-xl hover:shadow-2xl
            flex flex-col items-center gap-4 transition-all duration-300
            border-4 border-pink-300 dark:border-pink-700 hover:border-red-400 dark:hover:border-red-500 active:scale-95"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          aria-label="Valentine's Day compatibility mode"
        >
          <Heart className="size-16 text-red-500 dark:text-red-400 fill-red-500 dark:fill-red-400" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-pink-50">Valentine Mode 💘</h2>
            <p className="text-gray-700 dark:text-pink-200 mt-2">Compatibility reveal</p>
          </div>
        </motion.button>
      </div>
    </div>
  );
}