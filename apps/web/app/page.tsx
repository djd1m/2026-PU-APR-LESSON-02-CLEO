import Link from 'next/link';
import { Flame, Eye, Lightbulb } from 'lucide-react';

const features = [
  {
    icon: Flame,
    title: 'Roast Mode',
    description:
      'AI безжалостно разберёт твои траты и скажет правду, которую ты не хочешь слышать.',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
  },
  {
    icon: Eye,
    title: 'Subscription Tracker',
    description:
      'Найдём подписки-паразиты, о которых ты забыл. Сколько ты платишь за то, чем не пользуешься?',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  {
    icon: Lightbulb,
    title: 'Smart Insights',
    description:
      'Персонализированные рекомендации по оптимизации расходов на основе AI-анализа.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-500/10 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-5xl px-6 pb-24 pt-32 text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1.5 text-sm text-rose-300">
            <Flame className="h-4 w-4" />
            <span>AI финансовый roast</span>
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight sm:text-6xl md:text-7xl">
            Узнай, что AI думает
            <br />
            <span className="bg-gradient-to-r from-rose-400 to-amber-400 bg-clip-text text-transparent">
              о твоих тратах
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-400 sm:text-xl">
            Загрузи банковскую выписку и получи безжалостный AI-roast. Мы найдём
            подписки-паразиты, бессмысленные траты и расскажем правду о твоих
            финансах.
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 px-8 py-3.5 text-lg font-semibold text-white shadow-lg shadow-rose-500/25 transition-all hover:from-rose-400 hover:to-rose-500 hover:shadow-rose-500/40"
            >
              <Flame className="h-5 w-5" />
              Загрузить выписку
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-8 py-3.5 text-lg font-semibold text-slate-300 transition-all hover:border-slate-600 hover:bg-slate-800 hover:text-white"
            >
              Войти
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative border-t border-slate-800/50 bg-slate-950">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <h2 className="mb-4 text-center text-3xl font-bold sm:text-4xl">
            Как это работает
          </h2>
          <p className="mx-auto mb-16 max-w-xl text-center text-slate-400">
            Загрузи CSV-выписку из банка, а AI сделает остальное
          </p>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className={`rounded-2xl border ${feature.border} ${feature.bg} p-8 transition-all hover:scale-[1.02]`}
              >
                <feature.icon className={`mb-4 h-8 w-8 ${feature.color}`} />
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-8 text-center text-sm text-slate-500">
        <p>cleo-rf &copy; {new Date().getFullYear()} &mdash; AI финансовый ассистент</p>
      </footer>
    </main>
  );
}
