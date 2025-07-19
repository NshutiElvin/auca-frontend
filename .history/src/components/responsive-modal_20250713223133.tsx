import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '../components/ui/alert-dialog';

export interface ResponsiveModalProps {
  show: boolean;
  setShow: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  cancelText?: string;
  confirmText?: string;
}

const ResponsiveModal: React.FC<ResponsiveModalProps> = ({
  show,
  setShow,
  onConfirm,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  cancelText = 'Cancel',
  confirmText = 'Continue',
}) => {
  return (
    <AlertDialog open={show} onOpenChange={setShow}>
      <AlertDialogContent className="max-w-md w-full mx-4 sm:mx-auto rounded-2xl p-6 shadow-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-semibold">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="mt-2 text-sm text-muted-foreground">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6 flex flex-col sm:flex-row sm:justify-end gap-2">
          <AlertDialogCancel
            className="w-full sm:w-auto"
            onClick={() => setShow(false)}
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            className="w-full sm:w-auto"
            onClick={onConfirm}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ResponsiveModal;
