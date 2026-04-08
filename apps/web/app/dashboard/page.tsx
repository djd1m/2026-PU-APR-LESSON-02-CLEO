'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Flame, Upload, BarChart3, LogOut } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { CategoryPie } from '@/components/charts/category-pie';

interface CategoryBreakdown {
  name: string;
  total: number;
  percentage: number;
}

interface AnalysisSummary {
  id: string;
  createdAt: string;
  totalSpent: number;
  roastPreview: string;
  categories: CategoryBreakdown[];
}

interface DashboardData {
  userName: string;
  analyses: AnalysisSummary[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    async function fetchDashboard() {
      try {
        const result = await apiGet<DashboardData>('/api/dashboard');
        if (result.error) {
          if (result.error.includes('401') || result.error.includes('auth')) {
            localStorage.removeItem('token');
            router.push('/login');
          }
          return;
        }
        setData(result.data!);
      } catch {
        // Fallback for demo
        setData({
          userName: 'Пользователь',
          analyses: [],
        });
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, [router]);

  function handleLogout() {
    localStorage.removeItem('token');
    router.push('/');
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-rose-500" />
          <p className="text-slate-400">Загружаем данные...</p>
        </div>
      </main>
    );
  }

  const latest = data?.analyses?.[0];

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <Flame className="h-6 w-6 text-rose-400" />
            <span>cleo-rf</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">
              Привет, {data?.userName || 'Пользователь'}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-400 transition hover:border-slate-600 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Выйти
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-12">
        {/* Welcome + CTA */}
        <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold">Дашборд</h1>
            <p className="mt-1 text-slate-400">Ваши финансовые roast-ы в одном месте</p>
          </div>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 px-6 py-3 font-semibold text-white shadow-lg shadow-rose-500/25 transition-all hover:from-rose-400 hover:to-rose-500"
          >
            <Upload className="h-5 w-5" />
            Загрузить новую выписку
          </Link>
        </div>

        {latest ? (
          /* Latest analysis */
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Summary Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8">
              <div className="mb-4 flex items-center gap-2 text-sm text-slate-400">
                <BarChart3 className="h-4 w-4" />
                <span>Последний анализ</span>
                <span className="ml-auto">
                  {new Date(latest.createdAt).toLocaleDateString('ru-RU')}
                </span>
              </div>
              <p className="mb-4 text-2xl font-bold">
                {latest.totalSpent.toLocaleString('ru-RU')} &#8381;
              </p>
              <p className="mb-6 text-slate-300 line-clamp-3">{latest.roastPreview}</p>
              <Link
                href={`/analysis/${latest.id}`}
                className="inline-flex items-center gap-2 text-rose-400 transition hover:text-rose-300"
              >
                Посмотреть полный анализ &rarr;
              </Link>
            </div>

            {/* Pie Chart */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8">
              <h3 className="mb-4 text-lg font-semibold">Категории расходов</h3>
              <CategoryPie categories={latest.categories} />
            </div>
          </div>
        ) : (
          /* Empty state */
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 p-16 text-center">
            <Flame className="mx-auto mb-4 h-12 w-12 text-slate-600" />
            <h2 className="mb-2 text-xl font-semibold text-slate-300">
              Пока нет анализов
            </h2>
            <p className="mb-6 text-slate-500">
              Загрузите банковскую выписку, чтобы получить свой первый AI-roast
            </p>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 px-6 py-3 font-semibold text-white shadow-lg shadow-rose-500/25 transition-all hover:from-rose-400 hover:to-rose-500"
            >
              <Upload className="h-5 w-5" />
              Загрузить выписку
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
