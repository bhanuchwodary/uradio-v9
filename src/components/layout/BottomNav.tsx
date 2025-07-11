
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
            "flex items-center justify-center rounded-full smooth-animation h-10 w-10 sm:h-8 sm:w-16 elevation-0 hover:elevation-1",
            isActive
              ? "bg-secondary-container text-on-secondary-container shadow-md scale-105"
              : "text-on-surface-variant group-hover:bg-on-surface/10 group-hover:scale-105"
          )}
        >
          <item.icon className="h-6 w-6" />
        </div>
        <span className={cn(
          "text-xs font-medium",
          isActive ? "text-on-surface font-semibold" : "text-on-surface-variant"
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
    <nav className="fixed bottom-0 left-0 right-0 p-2 sm:p-3 glass-surface border-t border-outline-variant/30 elevation-4 z-10 bottom-nav-ios ios-safe-left ios-safe-right smooth-animation">
      <div className="container mx-auto px-0">
        <div className="flex justify-around items-start gap-1 px-1">
          {navItems.map((item) => (
            <NavItem key={item.path} item={item} isActive={path === item.path} />
          ))}
          <div className="flex-1 text-center group">
             <ThemeToggle>
              <div className="flex flex-col items-center justify-center gap-1 w-full py-1 transition-all duration-300 ease-out ios-touch-target rounded-xl cursor-pointer">
                <div className="flex items-center justify-center rounded-full text-on-surface-variant group-hover:bg-on-surface/10 h-10 w-10 sm:h-8 sm:w-16 transition-all duration-300 ease-in-out">
                  <div className="relative h-6 w-6">
                    <Sun className="absolute h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  </div>
                </div>
                <span className="text-xs font-medium text-on-surface-variant">Theme</span>
              </div>
             </ThemeToggle>
          </div>
        </div>
      </div>
    </nav>
  );
};
