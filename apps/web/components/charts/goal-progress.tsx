'use client';

interface GoalProgressProps {
  name: string;
  current: number;
  target: number;
  deadline?: string | null;
}

function getProgressColor(percentage: number): string {
  if (percentage < 30) return 'from-rose-500 to-red-500';
  if (percentage < 70) return 'from-amber-400 to-yellow-500';
  return 'from-emerald-400 to-green-500';
}

function getDaysRemaining(deadline: string): number {
  const now = new Date();
  const end = new Date(deadline);
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function GoalProgress({ name, current, target, deadline }: GoalProgressProps) {
  const percentage = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
  const colorClass = getProgressColor(percentage);
  const isComplete = percentage >= 100;
  const days = deadline ? getDaysRemaining(deadline) : null;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          {isComplete && (
            <span className="mr-2 inline-block animate-bounce">&#127881;</span>
          )}
          {name}
        </h3>
        <span className="text-sm font-medium text-slate-400">
          {percentage}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-3 h-3 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${colorClass} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Details */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400">
          {current.toLocaleString('ru-RU')} / {target.toLocaleString('ru-RU')} &#8381;
        </span>
        {days !== null && (
          <span className={`${days === 0 ? 'text-rose-400' : 'text-slate-500'}`}>
            {days === 0
              ? 'Срок истёк'
              : `${days} ${days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'}`}
          </span>
        )}
      </div>

      {/* Celebration */}
      {isComplete && (
        <div className="mt-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-center text-sm font-medium text-emerald-400">
          Цель достигнута!
        </div>
      )}
    </div>
  );
}
