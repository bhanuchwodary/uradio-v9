
import React from "react";
import { Track } from "@/types/track";
import EditStationDialog from "@/components/EditStationDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface HomePageDialogsProps {
  editingStation: Track | null;
  stationToDelete: Track | null;
  onCloseEditDialog: () => void;
  onSaveEdit: (data: { url: string; name: string }) => void;
  onCloseDeleteDialog: () => void;
  onConfirmDelete: () => void;
}

const HomePageDialogs: React.FC<HomePageDialogsProps> = ({
  editingStation,
  stationToDelete,
  onCloseEditDialog,
  onSaveEdit,
  onCloseDeleteDialog,
  onConfirmDelete
}) => {
  return (
    <>
      {/* Edit station dialog */}
      {editingStation && (
        <EditStationDialog
          isOpen={!!editingStation}
          onClose={onCloseEditDialog}
          onSave={onSaveEdit}
          initialValues={{
            url: editingStation.url,
            name: editingStation.name,
          }}
        />
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog 
        open={!!stationToDelete} 
        onOpenChange={(open) => !open && onCloseDeleteDialog()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Station</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{stationToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmDelete}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default HomePageDialogs;
