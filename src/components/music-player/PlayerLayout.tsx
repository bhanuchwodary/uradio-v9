
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface PlayerLayoutProps {
  children: React.ReactNode;
}

const PlayerLayout: React.FC<PlayerLayoutProps> = ({ children }) => (
  <Card className="w-full max-w-2xl mx-auto backdrop-blur-md bg-white/20 border-none shadow-lg">
    <CardContent className="p-4">
      <div className="flex flex-col gap-4">
        {children}
      </div>
    </CardContent>
  </Card>
);

export default PlayerLayout;
