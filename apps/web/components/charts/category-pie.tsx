'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface CategoryBreakdown {
  name: string;
  total: number;
  percentage: number;
}

interface CategoryPieProps {
  categories: CategoryBreakdown[];
}

const COLORS = [
  '#f43f5e', // rose-500
  '#f59e0b', // amber-500
  '#10b981', // emerald-500
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#14b8a6', // teal-500
  '#f97316', // orange-500
  '#6366f1', // indigo-500
  '#06b6d4', // cyan-500
];

interface TooltipPayloadEntry {
  name: string;
  value: number;
  payload: CategoryBreakdown;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
}) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm shadow-lg">
      <p className="font-medium text-white">{data.name}</p>
      <p className="text-slate-400">
        {data.total.toLocaleString('ru-RU')} &#8381; ({data.percentage}%)
      </p>
    </div>
  );
}

export function CategoryPie({ categories }: CategoryPieProps) {
  if (!categories || categories.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        Нет данных для отображения
      </div>
    );
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={categories}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="total"
            nameKey="name"
            stroke="none"
          >
            {categories.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                className="transition-opacity hover:opacity-80"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
        {categories.map((cat, index) => (
          <div key={cat.name} className="flex items-center gap-1.5 text-sm">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-slate-400">
              {cat.name} ({cat.percentage}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
