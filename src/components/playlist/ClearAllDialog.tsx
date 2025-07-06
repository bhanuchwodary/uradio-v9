
import React from "react";
import { Button } from "@/components/ui/button";

interface ClearAllDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ClearAllDialog: React.FC<ClearAllDialogProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-lg shadow-lg max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">Clear All Stations</h3>
        <p className="text-muted-foreground mb-6">
          Are you sure you want to remove all stations from your playlist? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Clear All
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClearAllDialog;
