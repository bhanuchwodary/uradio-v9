
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Music, List, Plus, Mail, Sun, Moon } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

export const navItems = [
  { icon: Music, label: "Playlist", path: "/" },
  { icon: List, label: "Stations", path: "/station-list" },
  { icon: Plus, label: "Add", path: "/add" },
  { icon: Mail, label: "Request", path: "/request-station" }
];

const NavItem: React.FC<{ item: typeof navItems[0]; isActive: boolean }> = ({ item, isActive }) => {
  return (
    <Link to={item.path} className="flex-1 text-center group">
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-1 w-full py-1 transition-all duration-300 ease-out ios-touch-target rounded-xl"
        )}
      >
        <div
          className={cn(
            "flex items-center justify-center rounded-2xl transition-all duration-300 ease-in-out h-11 w-11 sm:h-9 sm:w-18",
            "shadow-md backdrop-blur-sm border border-outline-variant/20",
            isActive
              ? "bg-gradient-to-br from-secondary-container via-secondary-container/80 to-secondary-container/60 text-on-secondary-container shadow-secondary-container/30 scale-110 border-secondary/30"
              : "text-on-surface-variant group-hover:bg-secondary-container/30 group-hover:text-on-secondary-container group-hover:shadow-lg group-hover:scale-105 group-hover:border-secondary/20"
          )}
        >
          <item.icon className={cn(
            "h-6 w-6 transition-all duration-300",
            isActive && "drop-shadow-sm"
          )} />
        </div>
        <span className={cn(
          "text-xs font-medium transition-all duration-300 drop-shadow-sm",
          isActive ? "text-on-surface font-bold scale-105" : "text-on-surface-variant group-hover:text-on-secondary-container"
        )}>
          {item.label}
        </span>
      </div>
    </Link>
  );
};


export const BottomNav: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-surface-container/98 backdrop-blur-xl border-t border-outline-variant/30 elevation-4 z-10 bottom-nav-ios ios-safe-left ios-safe-right shadow-2xl">
      {/* Enhanced background gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high/50 to-transparent pointer-events-none" />
      <div className="container mx-auto px-0 relative z-10">
        <div className="flex justify-around items-start gap-1 px-1">
          {navItems.map((item) => (
            <NavItem key={item.path} item={item} isActive={path === item.path} />
          ))}
          <div className="flex-1 text-center group">
             <ThemeToggle>
               <div className="flex flex-col items-center justify-center gap-1 w-full py-1 transition-all duration-300 ease-out ios-touch-target rounded-xl cursor-pointer">
                 <div className="flex items-center justify-center rounded-2xl text-on-surface-variant group-hover:bg-secondary-container/30 group-hover:text-on-secondary-container h-11 w-11 sm:h-9 sm:w-18 transition-all duration-300 ease-in-out shadow-md backdrop-blur-sm border border-outline-variant/20 group-hover:shadow-lg group-hover:scale-105 group-hover:border-secondary/20">
                  <div className="relative h-6 w-6">
                    <Sun className="absolute h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  </div>
                </div>
                <span className="text-xs font-medium text-on-surface-variant transition-all duration-300 drop-shadow-sm group-hover:text-on-secondary-container">Theme</span>
              </div>
             </ThemeToggle>
          </div>
        </div>
      </div>
    </nav>
  );
};
