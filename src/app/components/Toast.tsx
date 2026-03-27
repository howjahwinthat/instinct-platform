import { useEffect, useState } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  emoji?: string;
  onClose: () => void;
}

export function Toast({ message, emoji, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-[999] animate-bounce-in">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl px-5 py-4 flex items-center gap-3 min-w-[280px]">
        <div className="text-2xl">{emoji || '🎉'}</div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900 dark:text-white text-sm">{message}</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}