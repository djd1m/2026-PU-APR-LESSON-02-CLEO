'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Flame, Share2, RefreshCw, ArrowLeft, Sparkles } from 'lucide-react';
import { getAnalysis, requestRoast } from '@/lib/api';
import { RoastMessage } from '@/components/chat/roast-message';
import { CategoryPie } from '@/components/charts/category-pie';
import { ShareCardPreview } from '@/components/share/share-card-preview';

interface CategoryBreakdown {
  name: string;
  total: number;
  percentage: number;
}

interface Subscription {
  name: string;
  amount: number;
  isParasite: boolean;
  lastCharge: string;
}

interface Recommendation {
  id: string;
  text: string;
  savingPotential: number;
}

interface AnalysisData {
  id: string;
  status: 'processing' | 'completed' | 'error';
  roastMessage: string;
  roastStyle: 'roast' | 'hype';
  totalSpent: number;
  categories: CategoryBreakdown[];
  subscriptions: Subscription[];
  recommendations: Recommendation[];
}

export default function AnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShare, setShowShare] = useState(false);
  const [reRoasting, setReRoasting] = useState(false);
  const [currentStyle, setCurrentStyle] = useState<'roast' | 'hype'>('roast');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    async function fetchAnalysis() {
      try {
        const result = await getAnalysis(id);
        if (result.data) {
          setData(result.data);
          if (result.data.status === 'completed' || result.data.status === 'error') {
            setLoading(false);
            clearInterval(interval);
          }
        }
      } catch {
        setLoading(false);
      }
    }

    fetchAnalysis();
    // Poll while processing
    interval = setInterval(fetchAnalysis, 3000);

    return () => clearInterval(interval);
  }, [id]);

  async function handleReRoast() {
    setReRoasting(true);
    try {
      const result = await requestRoast(id);
      if (result.data) {
        setData((prev) =>
          prev
            ? {
                ...prev,
                roastMessage: result.data!.roastMessage,
                roastStyle: result.data!.roastStyle,
              }
            : prev
        );
      }
    } catch {
      // ignore
    } finally {
      setReRoasting(false);
    }
  }

  // Loading / processing state
  if (loading || !data || data.status === 'processing') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-700 border-t-rose-500" />
            <Flame className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-rose-400" />
          </div>
          <div>
            <h2 className="mb-2 text-xl font-bold">AI анализирует ваши траты...</h2>
            <p className="text-slate-400">Это займёт несколько секунд</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <Flame className="h-6 w-6 text-rose-400" />
            <span>cleo-rf</span>
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Дашборд
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Total */}
        <div className="mb-8 text-center">
          <p className="text-sm text-slate-400">Общая сумма трат</p>
          <p className="text-4xl font-bold">
            {data.totalSpent.toLocaleString('ru-RU')} &#8381;
          </p>
        </div>

        {/* Roast Message */}
        <div className="mb-10">
          <RoastMessage message={data.roastMessage} style={data.roastStyle} />
        </div>

        {/* Style Toggle */}
        <div className="mb-6 flex justify-center">
          <div className="inline-flex rounded-xl border border-slate-700 bg-slate-800/50 p-1">
            <button
              onClick={() => setCurrentStyle('roast')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition ${
                currentStyle === 'roast'
                  ? 'bg-rose-500/20 text-rose-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Flame className="h-4 w-4" />
              Roast
            </button>
            <button
              onClick={() => setCurrentStyle('hype')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition ${
                currentStyle === 'hype'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              Hype
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-12 flex flex-wrap justify-center gap-4">
          <button
            onClick={handleReRoast}
            disabled={reRoasting}
            className={`inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium transition disabled:opacity-50 ${
              currentStyle === 'roast'
                ? 'border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
                : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
            }`}
          >
            <RefreshCw className={`h-4 w-4 ${reRoasting ? 'animate-spin' : ''}`} />
            {reRoasting ? 'Генерируем...' : currentStyle === 'roast' ? 'Ещё один roast' : 'Ещё один hype'}
          </button>
          <button
            onClick={() => setShowShare(!showShare)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:text-white"
          >
            <Share2 className="h-4 w-4" />
            Поделиться
          </button>
        </div>

        {/* Share Card */}
        {showShare && (
          <div className="mb-12">
            <ShareCardPreview
              roastText={data.roastMessage}
              categories={data.categories}
            />
          </div>
        )}

        {/* Charts + Subscriptions */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Category Pie */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8">
            <h3 className="mb-6 text-lg font-semibold">Категории расходов</h3>
            <CategoryPie categories={data.categories} />
          </div>

          {/* Subscriptions */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8">
            <h3 className="mb-6 text-lg font-semibold">Подписки</h3>
            {data.subscriptions.length === 0 ? (
              <p className="text-slate-500">Подписки не найдены</p>
            ) : (
              <ul className="space-y-3">
                {data.subscriptions.map((sub) => (
                  <li
                    key={sub.name}
                    className={`flex items-center justify-between rounded-lg border p-3 ${
                      sub.isParasite
                        ? 'border-amber-500/30 bg-amber-500/5'
                        : 'border-slate-700 bg-slate-800/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {sub.isParasite && (
                        <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400">
                          паразит
                        </span>
                      )}
                      <span className="text-sm font-medium">{sub.name}</span>
                    </div>
                    <span className="text-sm font-semibold">
                      {sub.amount.toLocaleString('ru-RU')} &#8381;/мес
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-8">
          <h3 className="mb-6 text-lg font-semibold">Рекомендации</h3>
          {data.recommendations.length === 0 ? (
            <p className="text-slate-500">Рекомендации появятся после анализа</p>
          ) : (
            <ul className="space-y-4">
              {data.recommendations.map((rec) => (
                <li
                  key={rec.id}
                  className="flex items-start gap-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4"
                >
                  <div className="flex-1">
                    <p className="text-sm text-slate-200">{rec.text}</p>
                  </div>
                  {rec.savingPotential > 0 && (
                    <span className="shrink-0 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
                      -{rec.savingPotential.toLocaleString('ru-RU')} &#8381;/мес
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
