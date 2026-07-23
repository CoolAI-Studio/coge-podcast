import { useState } from 'react';
import { Globe } from 'lucide-react';

interface SafeImageProps {
  src?: string;
  alt: string;
  className?: string;
}

export function SafeImage({ src, alt, className = '' }: SafeImageProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gradient-to-tr from-surface-container to-surface-container-high border border-outline/10 p-6 text-center select-none ${className}`}>
        <Globe className="w-12 h-12 text-primary opacity-60 mb-2 animate-pulse" />
        <span className="font-headline-sm text-sm text-on-surface-variant font-medium tracking-tight line-clamp-2 px-4">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => {
        console.warn(`Failed to load image: ${src}, falling back to dynamic placeholder.`);
        setError(true);
      }}
    />
  );
}
