'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Flame, Target, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api';
import { GoalProgress } from '@/components/charts/goal-progress';

// ─── Types ──────────────────────────────────────────────────────────

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: string;
  currentAmount: string;
  deadline: string | null;
  createdAt: string;
  progress: number;
  daysRemaining: number | null;
}

interface GoalsResponse {
  data?: SavingsGoal[];
}

// ─── API helpers (PATCH / DELETE not in shared lib yet) ─────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

async function apiDelete(path: string): Promise<{ error?: string }> {
  try {
    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_URL}${path}`, { method: 'DELETE', headers });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      return { error: json.error?.message || json.message || `Error ${res.status}` };
    }
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

// ─── Component ──────────────────────────────────────────────────────

export default function GoalsPage() {
  const router = useRouter();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formTarget, setFormTarget] = useState('');
  const [formDeadline, setFormDeadline] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchGoals();
  }, [router]);

  async function fetchGoals() {
    try {
      const result = await apiGet<SavingsGoal[]>('/api/goals');
      if (result.error) {
        if (result.error.includes('401') || result.error.includes('auth')) {
          localStorage.removeItem('token');
          router.push('/login');
        }
        return;
      }
      setGoals(result.data ?? []);
    } catch {
      setGoals([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const targetAmount = parseFloat(formTarget);
    if (isNaN(targetAmount) || targetAmount <= 0) {
      setError('Target amount must be a positive number');
      setSubmitting(false);
      return;
    }

    const body: Record<string, unknown> = {
      name: formName.trim(),
      targetAmount,
    };
    if (formDeadline) {
      body.deadline = formDeadline;
    }

    const result = await apiPost<SavingsGoal>('/api/goals', body);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    // Reset form and refresh
    setFormName('');
    setFormTarget('');
    setFormDeadline('');
    setShowForm(false);
    fetchGoals();
  }

  async function handleDelete(goalId: string) {
    const result = await apiDelete(`/api/goals/${goalId}`);
    if (result.error) {
      setError(result.error);
      return;
    }
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
  }

  // ─── Loading state ──────────────────────────────────────────────

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-rose-500" />
          <p className="text-slate-400">Loading goals...</p>
        </div>
      </main>
    );
  }

  // ─── Main render ────────────────────────────────────────────────

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-xl font-bold">
            <Flame className="h-6 w-6 text-rose-400" />
            <span>cleo-rf</span>
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-12">
        {/* Page title + Add button */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold">
              <Target className="h-8 w-8 text-emerald-400" />
              Savings Goals
            </h1>
            <p className="mt-1 text-slate-400">Track your progress toward financial targets</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2.5 font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:from-emerald-400 hover:to-emerald-500"
          >
            <Plus className="h-5 w-5" />
            Add Goal
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
            {error}
          </div>
        )}

        {/* Create form */}
        {showForm && (
          <form
            onSubmit={handleCreate}
            className="mb-8 rounded-xl border border-slate-800 bg-slate-900/50 p-6"
          >
            <h2 className="mb-4 text-lg font-semibold">New Savings Goal</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm text-slate-400">Name</label>
                <input
                  type="text"
                  required
                  maxLength={200}
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., Vacation"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-400">Target Amount (RUB)</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  value={formTarget}
                  onChange={(e) => setFormTarget(e.target.value)}
                  placeholder="50000"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-400">Deadline (optional)</label>
                <input
                  type="date"
                  value={formDeadline}
                  onChange={(e) => setFormDeadline(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-emerald-600 px-5 py-2 font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Goal'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-slate-700 px-5 py-2 text-slate-400 transition hover:border-slate-600 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Goals list */}
        {goals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 p-16 text-center">
            <Target className="mx-auto mb-4 h-12 w-12 text-slate-600" />
            <h2 className="mb-2 text-xl font-semibold text-slate-300">
              Set your first savings goal!
            </h2>
            <p className="mb-6 text-slate-500">
              Create a goal to start tracking your savings progress
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:from-emerald-400 hover:to-emerald-500"
            >
              <Plus className="h-5 w-5" />
              Create Goal
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {goals.map((goal) => (
              <div key={goal.id} className="relative">
                <GoalProgress
                  name={goal.name}
                  current={parseFloat(goal.currentAmount)}
                  target={parseFloat(goal.targetAmount)}
                  deadline={goal.deadline}
                />
                <button
                  onClick={() => handleDelete(goal.id)}
                  className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-600 transition hover:bg-slate-800 hover:text-rose-400"
                  title="Delete goal"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
