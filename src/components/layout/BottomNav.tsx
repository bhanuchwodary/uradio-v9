
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
          "flex flex-col items-center justify-center gap-1 w-full py-2 material-transition ios-touch-target rounded-xl",
          "active:scale-95 transform-gpu"
        )}
      >
        <div
          className={cn(
            "flex items-center justify-center rounded-full material-transition h-10 w-10 sm:h-9 sm:w-14",
            "relative overflow-hidden",
            isActive
              ? "bg-secondary-container text-on-secondary-container elevation-1 scale-110"
              : "text-on-surface-variant group-hover:bg-on-surface/10 group-hover:scale-105"
          )}
        >
          <item.icon className={cn(
            "h-5 w-5 material-transition",
            isActive ? "scale-110" : "group-hover:scale-105"
          )} />
          {isActive && (
            <div className="absolute inset-0 bg-secondary-container/20 rounded-full animate-pulse"></div>
          )}
        </div>
        <span className={cn(
          "responsive-text-sm font-medium material-transition",
          isActive ? "text-on-surface font-semibold" : "text-on-surface-variant group-hover:text-on-surface"
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
    <nav className="fixed bottom-0 left-0 right-0 p-2 sm:p-3 glass-surface border-t border-outline-variant/20 elevation-3 z-10 bottom-nav-ios ios-safe-left ios-safe-right">
      <div className="responsive-container px-0">
        <div className="flex justify-around items-start gap-1 px-1">
          {navItems.map((item) => (
            <NavItem key={item.path} item={item} isActive={path === item.path} />
          ))}
          <div className="flex-1 text-center group">
             <ThemeToggle>
              <div className="flex flex-col items-center justify-center gap-1 w-full py-2 material-transition ios-touch-target rounded-xl cursor-pointer active:scale-95 transform-gpu">
                <div className="flex items-center justify-center rounded-full text-on-surface-variant group-hover:bg-on-surface/10 h-10 w-10 sm:h-9 sm:w-14 material-transition group-hover:scale-105">
                  <div className="relative h-5 w-5">
                    <Sun className="absolute h-5 w-5 rotate-0 scale-100 material-transition dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-5 w-5 rotate-90 scale-0 material-transition dark:rotate-0 dark:scale-100" />
                  </div>
                </div>
                <span className="responsive-text-sm font-medium text-on-surface-variant group-hover:text-on-surface material-transition">Theme</span>
              </div>
             </ThemeToggle>
          </div>
        </div>
      </div>
    </nav>
  );
};
