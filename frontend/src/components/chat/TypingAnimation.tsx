import React from 'react';

export const TypingAnimation: React.FC = () => {
  return (
    <div className="inline-flex items-center gap-1.5 py-1 px-1">
      <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
      <span className="w-2 h-2 rounded-full bg-secondary animate-bounce [animation-delay:-0.15s]" />
      <span className="w-2 h-2 rounded-full bg-tertiary animate-bounce" />
      <span className="text-xs text-outline font-mono ml-2 animate-pulse">Compiling requirements...</span>
    </div>
  );
};
