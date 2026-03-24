'use client';

import { AlertTriangleIcon, CircleHelpIcon } from 'lucide-react';

import Button from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  isDestructive?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  isDestructive = false,
}: ConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent className="max-w-md overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                'flex size-12 shrink-0 items-center justify-center rounded-full',
                isDestructive ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
              )}
            >
              {isDestructive ? <AlertTriangleIcon className="size-6" /> : <CircleHelpIcon className="size-6" />}
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-lg font-semibold leading-tight">{title}</DialogTitle>
              <DialogDescription className="text-sm leading-relaxed">{message}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogFooter className="mt-6 border-t bg-muted/40 px-6 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="min-w-[80px]"
          >
            {cancelText}
          </Button>
          
          <Button
            variant={isDestructive ? 'outline' : confirmVariant}
            size="sm"
            onClick={handleConfirm}
            className={cn(
              'min-w-[80px]',
              isDestructive && 'border-destructive/40 text-destructive hover:bg-destructive/10'
            )}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}