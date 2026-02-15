import { motion } from "motion/react";

interface GameSquareProps {
  value: string | null;
  onClick: () => void;
  isWinning: boolean;
  disabled: boolean;
}

export function GameSquare({ value, onClick, isWinning, disabled }: GameSquareProps) {
  const getSquareColor = () => {
    if (isWinning) return "bg-green-400 dark:bg-green-500";
    if (value === "X") return "bg-blue-100 dark:bg-blue-900";
    if (value === "O") return "bg-pink-100 dark:bg-pink-900";
    return "bg-white dark:bg-gray-700";
  };

  const getTextColor = () => {
    if (value === "X") return "text-blue-600 dark:text-blue-300";
    if (value === "O") return "text-pink-600 dark:text-pink-300";
    return "text-gray-400";
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || value !== null}
      className={`aspect-square rounded-xl ${getSquareColor()} ${getTextColor()} 
        text-5xl font-bold flex items-center justify-center
        border-4 border-gray-200 dark:border-gray-600 shadow-lg
        disabled:cursor-not-allowed
        hover:border-gray-400 dark:hover:border-gray-400 active:scale-95
        transition-all duration-200`}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: disabled || value !== null ? 1 : 1.05 }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      aria-label={value ? `Square filled with ${value}` : "Empty square"}
    >
      {value && (
        <motion.span
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
          {value}
        </motion.span>
      )}
    </motion.button>
  );
}