import React from 'react';
import ReactMarkdown from 'react-markdown';

interface AssistantMarkdownProps {
  content: string;
}

export function AssistantMarkdown({ content }: AssistantMarkdownProps) {
  return (
    <div className="space-y-2 leading-relaxed break-words text-slate-800">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-sm sm:text-base font-bold text-slate-900 mt-2 mb-1">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 mt-2 mb-1">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900 mt-1.5 mb-1">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-2 last:mb-0 leading-relaxed text-slate-800">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-900">
              {children}
            </strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => (
            <ul className="list-disc pl-5 my-1.5 space-y-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 my-1.5 space-y-1">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed pl-0.5">
              {children}
            </li>
          ),
          code: ({ children }) => (
            <code className="bg-slate-100 text-teal-800 px-1 py-0.5 rounded text-[11px] font-mono">
              {children}
            </code>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-700 underline hover:text-teal-900 break-all font-medium"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
