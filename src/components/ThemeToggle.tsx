
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/ThemeProvider";

export function ThemeToggle({ children }: { children: React.ReactNode }) {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-surface-container/98 backdrop-blur-md border-outline-variant/30 elevation-2 rounded-xl mt-2 min-w-[120px]"
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={`hover:bg-primary-container/60 focus:bg-primary-container/60 transition-all duration-200 ease-out rounded-lg mx-1 my-0.5 ${
            theme === "light" ? "bg-primary-container/40 text-on-primary-container" : "text-on-surface"
          }`}
        >
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={`hover:bg-primary-container/60 focus:bg-primary-container/60 transition-all duration-200 ease-out rounded-lg mx-1 my-0.5 ${
            theme === "dark" ? "bg-primary-container/40 text-on-primary-container" : "text-on-surface"
          }`}
        >
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("metallic")}
          className={`hover:bg-primary-container/60 focus:bg-primary-container/60 transition-all duration-200 ease-out rounded-lg mx-1 my-0.5 ${
            theme === "metallic" ? "bg-primary-container/40 text-on-primary-container" : "text-on-surface"
          }`}
        >
          Metallic
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={`hover:bg-primary-container/60 focus:bg-primary-container/60 transition-all duration-200 ease-out rounded-lg mx-1 my-0.5 ${
            theme === "system" ? "bg-primary-container/40 text-on-primary-container" : "text-on-surface"
          }`}
        >
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
