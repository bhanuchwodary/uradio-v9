
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
        className="glass-surface elevation-3 rounded-2xl mt-2 min-w-[140px] p-2 animate-scale-in"
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={`material-transition-fast rounded-xl mx-0 my-0.5 p-3 button-press-effect ${
            theme === "light" 
              ? "bg-primary-container text-on-primary-container elevation-1" 
              : "text-on-surface hover:bg-secondary-container/30 hover:text-on-secondary-container"
          }`}
        >
          <span className="font-medium">Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={`material-transition-fast rounded-xl mx-0 my-0.5 p-3 button-press-effect ${
            theme === "dark" 
              ? "bg-primary-container text-on-primary-container elevation-1" 
              : "text-on-surface hover:bg-secondary-container/30 hover:text-on-secondary-container"
          }`}
        >
          <span className="font-medium">Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("metallic")}
          className={`material-transition-fast rounded-xl mx-0 my-0.5 p-3 button-press-effect ${
            theme === "metallic" 
              ? "bg-primary-container text-on-primary-container elevation-1" 
              : "text-on-surface hover:bg-secondary-container/30 hover:text-on-secondary-container"
          }`}
        >
          <span className="font-medium">Metallic</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={`material-transition-fast rounded-xl mx-0 my-0.5 p-3 button-press-effect ${
            theme === "system" 
              ? "bg-primary-container text-on-primary-container elevation-1" 
              : "text-on-surface hover:bg-secondary-container/30 hover:text-on-secondary-container"
          }`}
        >
          <span className="font-medium">System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
