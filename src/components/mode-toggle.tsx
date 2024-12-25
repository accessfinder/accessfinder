"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { useCallback } from "react";

export default function ModeToggle() {
  const { theme, setTheme } = useTheme();

  function handleLightMode() {
    setTheme("light");
  }

  function handleDarkMode() {
    setTheme("dark");
  }

  const handleClick = useCallback(() => {
    if (theme === "dark") {
      handleLightMode();
    } else {
      handleDarkMode();
    }
  }, [theme]);

  return (
    <div className="fixed bottom-4 right-4">
      <Button variant="outline" size="icon" onClick={handleClick}>
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button>
    </div>
  );
}