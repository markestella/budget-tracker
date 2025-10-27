'use client';

import { useTheme } from '@/components/ThemeProvider';
import Button from '@/components/ui/Button';

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
  const { isDark } = useTheme();

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && !isDestructive) {
      handleConfirm();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="fixed inset-0" onClick={handleBackdropClick} />
      <div className={`relative rounded-xl max-w-md w-full shadow-xl border ${
        isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
              isDestructive 
                ? isDark
                  ? 'bg-red-900/50 text-red-400'
                  : 'bg-red-100 text-red-600'
                : isDark
                  ? 'bg-blue-900/50 text-blue-400'
                  : 'bg-blue-100 text-blue-600'
            }`}>
              {isDestructive ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            
            {/* Title */}
            <div className="flex-1 min-w-0">
              <h3 className={`text-lg font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {title}
              </h3>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Message */}
        <div className="px-6 pb-6">
          <p className={`text-sm leading-relaxed ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className={`px-6 py-4 border-t flex gap-3 justify-end ${
          isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-100 bg-gray-50'
        }`}>
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
            className={isDestructive ? `min-w-[80px] ${
              isDark 
                ? '!border-red-600 !text-red-400 hover:!bg-red-900/50 hover:!border-red-500' 
                : '!border-red-500 !text-red-600 hover:!bg-red-50 hover:!border-red-600'
            }` : 'min-w-[80px]'}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}