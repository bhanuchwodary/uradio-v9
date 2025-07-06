
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface StationSearchProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
}

const StationSearch: React.FC<StationSearchProps> = ({ searchTerm, onSearchTermChange }) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
      <Input
        type="search"
        placeholder="Search stations by name or language..."
        value={searchTerm}
        onChange={(e) => onSearchTermChange(e.target.value)}
        className="pl-10 w-full bg-background/50 backdrop-blur-sm"
      />
    </div>
  );
};

export default StationSearch;
