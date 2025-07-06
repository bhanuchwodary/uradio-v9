
import React from 'react';
import { Search } from 'lucide-react';

const NoSearchResults: React.FC = () => {
  return (
    <div className="text-center p-8 bg-gradient-to-br from-background/50 to-background/30 rounded-xl border border-border/50 flex flex-col items-center justify-center gap-4">
      <Search className="h-12 w-12 text-muted-foreground/50" />
      <div>
        <p className="text-muted-foreground font-semibold">No stations found</p>
        <p className="text-sm text-muted-foreground/70 mt-1">Try a different search term.</p>
      </div>
    </div>
  );
};

export default NoSearchResults;
