"use client";
import { Briefcase } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartConfig } from "@/components/ui/chart";

type TrackerTrend = {
  _id: string;
  status_name: string;
  status_color: string;
  total: number;
  thisWeek: number;
  lastWeek: number;
};

type StatusProps = {
  total_applications: string | number;
  trackers_trends: TrackerTrend[];
};

function getTrend(thisWeek: number, lastWeek: number) {
  if (lastWeek > 0) {
    const pct = Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
    return { trend: pct > 0 ? "up" : pct < 0 ? "down" : "same", pct };
  }
  if (thisWeek > 0) return { trend: "up" as const, pct: 100 };
  return { trend: "same" as const, pct: 0 };
}

function TrendSparkline({
  lastWeek,
  thisWeek,
  color,
}: {
  lastWeek: number;
  thisWeek: number;
  color: string;
}) {
  const data = [
    { name: "last", value: lastWeek },
    { name: "this", value: thisWeek },
  ];

  const chartConfig = {
    value: {
      label: "Applications",
      color,
    },
  } satisfies ChartConfig;

  const gradientId = `spark-${color.replace("#", "")}`;

  return (
    <ChartContainer config={chartConfig} className="h-10 w-20">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.6} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

export default function StatsCard({
  total_applications,
  trackers_trends,
}: StatusProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black p-5 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white/90">
            Total Applications
          </span>
          <span className="h-9 w-9 rounded-full border border-white/15 flex items-center justify-center text-white/80">
            <Briefcase size={16} />
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-3xl font-semibold text-white">
            {total_applications}
          </span>
        </div>
      </div>

      {trackers_trends.map((t) => {
        const { trend, pct } = getTrend(t.thisWeek, t.lastWeek);

        return (
          <div
            key={t._id}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-black p-5 flex flex-col gap-6"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white/90">
                {t.status_name}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-3xl font-semibold text-white">
                {t.total}
              </span>
              <div className="flex items-center justify-between gap-3">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    trend === "up"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : trend === "down"
                        ? "bg-red-500/15 text-red-400"
                        : "bg-white/10 text-white/60"
                  }`}
                >
                  {pct > 0 ? "+" : ""}
                  {pct}%
                </span>
                <TrendSparkline
                  lastWeek={t.lastWeek}
                  thisWeek={t.thisWeek}
                  color={t.status_color}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
