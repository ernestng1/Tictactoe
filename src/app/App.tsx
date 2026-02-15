import { useState } from "react";
import { ModeSelection } from "@/app/components/mode-selection";
import { GameBoard } from "@/app/components/game-board";
import { ValentineBoard } from "@/app/components/valentine-board";
import { ThemeProvider } from "@/app/components/theme-provider";

type GameMode = "pvp" | "pve" | "valentine" | null;

export default function App() {
  const [gameMode, setGameMode] = useState<GameMode>(null);

  const handleModeSelect = (mode: "pvp" | "pve" | "valentine") => {
    setGameMode(mode);
  };

  const handleBackToMenu = () => {
    setGameMode(null);
  };

  return (
    <ThemeProvider>
      <div className="size-full">
        {gameMode === null ? (
          <ModeSelection onSelectMode={handleModeSelect} />
        ) : gameMode === "valentine" ? (
          <ValentineBoard mode="pvp" onBackToMenu={handleBackToMenu} />
        ) : (
          <GameBoard mode={gameMode} onBackToMenu={handleBackToMenu} />
        )}
      </div>
    </ThemeProvider>
  );
}