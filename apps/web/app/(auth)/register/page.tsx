'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Flame } from 'lucide-react';
import { register } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await register(name, Number(age), email, password);
      if (result.error) {
        setError(result.error);
      } else {
        localStorage.setItem('token', result.data!.token);
        router.push('/upload');
      }
    } catch {
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold">
            <Flame className="h-7 w-7 text-rose-400" />
            <span>cleo-rf</span>
          </Link>
          <p className="mt-2 text-slate-400">Создайте аккаунт</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8"
        >
          {error && (
            <div className="mb-6 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
              {error}
            </div>
          )}

          <div className="mb-5">
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-300">
              Имя
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Александр"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
            />
          </div>

          <div className="mb-5">
            <label htmlFor="age" className="mb-2 block text-sm font-medium text-slate-300">
              Возраст
            </label>
            <input
              id="age"
              type="number"
              required
              min={14}
              max={120}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="25"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
            />
          </div>

          <div className="mb-5">
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-300">
              Пароль
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Минимум 6 символов"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-rose-500 to-rose-600 py-3 font-semibold text-white shadow-lg shadow-rose-500/25 transition-all hover:from-rose-400 hover:to-rose-500 disabled:opacity-50"
          >
            {loading ? 'Создаём...' : 'Создать аккаунт'}
          </button>

          <p className="mt-6 text-center text-sm text-slate-400">
            Уже есть аккаунт?{' '}
            <Link href="/login" className="text-rose-400 hover:text-rose-300">
              Войти
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
