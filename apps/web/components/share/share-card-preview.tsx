'use client';

import { useState } from 'react';
import { Copy, Check, Send, MessageCircle } from 'lucide-react';

interface CategoryBreakdown {
  name: string;
  total: number;
  percentage: number;
}

interface ShareCardPreviewProps {
  roastText: string;
  categories: CategoryBreakdown[];
}

export function ShareCardPreview({ roastText, categories }: ShareCardPreviewProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `AI roast моих трат:\n\n"${roastText.slice(0, 200)}${
    roastText.length > 200 ? '...' : ''
  }"\n\nПопробуй сам: ${shareUrl}`;

  function handleCopyLink() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleShareTelegram() {
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  }

  function handleShareVK() {
    const url = `https://vk.com/share.php?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent('AI Roast моих трат')}&comment=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8">
      <h3 className="mb-6 text-lg font-semibold">Поделиться roast-ом</h3>

      {/* Preview Card */}
      <div className="mb-8 rounded-xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-6">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-400">
          <span>cleo-rf AI Roast</span>
        </div>
        <p className="mb-4 text-sm leading-relaxed text-slate-200">
          &quot;{roastText.slice(0, 280)}{roastText.length > 280 ? '...' : ''}&quot;
        </p>

        {/* Blurred categories */}
        <div className="flex flex-wrap gap-2">
          {categories.slice(0, 4).map((cat) => (
            <span
              key={cat.name}
              className="rounded-md bg-slate-700/50 px-2.5 py-1 text-xs text-slate-400 blur-[2px]"
            >
              {cat.name}: {cat.total.toLocaleString('ru-RU')} &#8381;
            </span>
          ))}
        </div>
      </div>

      {/* Share Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleShareTelegram}
          className="inline-flex items-center gap-2 rounded-xl bg-[#2AABEE] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#229ED9]"
        >
          <Send className="h-4 w-4" />
          Telegram
        </button>
        <button
          onClick={handleShareVK}
          className="inline-flex items-center gap-2 rounded-xl bg-[#4C75A3] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#3D6693]"
        >
          <MessageCircle className="h-4 w-4" />
          VK
        </button>
        <button
          onClick={handleCopyLink}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:text-white"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-400" />
              Скопировано
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Копировать ссылку
            </>
          )}
        </button>
      </div>
    </div>
  );
}
