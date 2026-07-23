import React from 'react';
import { X } from 'lucide-react';

interface LegalModalProps {
  title: string;
  content: React.ReactNode;
  onClose: () => void;
}

export function LegalModal({ title, content, onClose }: LegalModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-surface w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-outline/10">
          <h2 className="font-headline-sm text-2xl text-on-surface">{title}</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar font-body-md text-on-surface-variant space-y-4">
          {content}
        </div>
      </div>
    </div>
  );
}
