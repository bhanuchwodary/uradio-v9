import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { AuthDialog } from "./AuthDialog";
import { User, LogOut, Cloud, CloudOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserMenuProps {
  compact?: boolean;
}

export const UserMenu: React.FC<UserMenuProps> = ({ compact = false }) => {
  const { user, profile, loading, signOut } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const { toast } = useToast();

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } finally {
      setSigningOut(false);
    }
  };

  if (loading) {
    return (
      <Button variant="ghost" size="icon" disabled className="h-10 w-10">
        <Loader2 className="h-5 w-5 animate-spin text-on-surface-variant" />
      </Button>
    );
  }

  if (!user) {
    return (
      <>
        <Button
          variant="outline"
          size={compact ? "sm" : "default"}
          onClick={() => setAuthDialogOpen(true)}
          className="gap-2 border-outline-variant/50 hover:bg-surface-container hover:border-primary"
        >
          <User className="h-4 w-4" />
          {!compact && <span>Sign In</span>}
        </Button>
        <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
      </>
    );
  }

  // User is logged in
  const displayName = profile?.display_name || user.email?.split("@")[0] || "User";
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url;
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-10 w-10 rounded-full p-0 hover:ring-2 hover:ring-primary/30"
        >
          <Avatar className="h-9 w-9 border-2 border-primary/30">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="bg-primary-container text-on-primary-container font-semibold text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 glass-card border-outline-variant/30"
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-on-surface">{displayName}</p>
            <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-outline-variant/30" />
        <DropdownMenuItem className="gap-2 text-on-surface cursor-pointer hover:bg-surface-container">
          <Cloud className="h-4 w-4 text-primary" />
          <span>Sync Enabled</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-outline-variant/30" />
        <DropdownMenuItem
          className="gap-2 text-error cursor-pointer hover:bg-error/10"
          onClick={handleSignOut}
          disabled={signingOut}
        >
          {signingOut ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
