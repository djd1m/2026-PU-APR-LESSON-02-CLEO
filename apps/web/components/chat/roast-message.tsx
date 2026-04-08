'use client';

import { Flame, Sparkles } from 'lucide-react';

interface RoastMessageProps {
  message: string;
  style: 'roast' | 'hype';
}

export function RoastMessage({ message, style }: RoastMessageProps) {
  const isRoast = style === 'roast';

  return (
    <div className="flex items-start gap-4">
      {/* AI Avatar */}
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
          isRoast ? 'bg-rose-500/20' : 'bg-emerald-500/20'
        }`}
      >
        {isRoast ? (
          <Flame className="h-5 w-5 text-rose-400" />
        ) : (
          <Sparkles className="h-5 w-5 text-emerald-400" />
        )}
      </div>

      {/* Chat Bubble */}
      <div
        className={`relative max-w-2xl rounded-2xl rounded-tl-sm border px-6 py-4 ${
          isRoast
            ? 'border-rose-500/20 bg-rose-500/5'
            : 'border-emerald-500/20 bg-emerald-500/5'
        }`}
      >
        {/* Label */}
        <div className="mb-2 flex items-center gap-2">
          <span
            className={`text-xs font-semibold uppercase tracking-wider ${
              isRoast ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {isRoast ? 'Roast Mode' : 'Hype Mode'}
          </span>
        </div>

        {/* Message */}
        <p className="whitespace-pre-line text-base leading-relaxed text-slate-200">
          {message}
        </p>
      </div>
    </div>
  );
}
