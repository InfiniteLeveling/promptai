import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface MarkdownViewerProps {
  content: string;
  className?: string;
  maxHeight?: string;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({
  content,
  className,
  maxHeight = 'max-h-[460px]'
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("relative rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-5", className)}>
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-[11px] font-mono text-on-surface transition-all z-10"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400">Copied</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-outline" />
            <span>Copy</span>
          </>
        )}
      </button>

      <div className={cn("overflow-y-auto custom-scrollbar font-code-sm text-xs leading-relaxed text-on-surface-variant pr-8", maxHeight)}>
        <ReactMarkdown
          components={{
            h1: ({ children }) => <h1 className="text-sm font-bold text-primary mb-2 mt-4">{children}</h1>,
            h2: ({ children }) => <h2 className="text-xs font-bold text-tertiary mb-1 mt-3">{children}</h2>,
            h3: ({ children }) => <h3 className="text-xs font-semibold text-on-surface mb-1 mt-2">{children}</h3>,
            p: ({ children }) => <p className="mb-2">{children}</p>,
            code: ({ children }) => <code className="bg-surface-container px-1 py-0.5 rounded text-primary text-[11px]">{children}</code>,
            pre: ({ children }) => <pre className="bg-surface-container-high/60 p-3 rounded-lg overflow-x-auto my-2 border border-outline-variant/20">{children}</pre>,
            ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-1">{children}</ul>,
            li: ({ children }) => <li className="text-on-surface-variant">{children}</li>,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};
