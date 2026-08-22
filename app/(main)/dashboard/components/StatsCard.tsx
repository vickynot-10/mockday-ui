"use client";
import { Briefcase } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
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
    value: { label: "Applications", color },
  } satisfies ChartConfig;

  const gradientId = `spark-${color.replace("#", "")}`;

  return (
    <ChartContainer config={chartConfig} className="h-12 w-12">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
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

export default function StatsCard({ total_applications, trackers_trends }: StatusProps) {
  return (
    <Card className="ring-foreground/10 gap-6 overflow-hidden rounded-xl shadow-xs ring-1 p-0">
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 lg:divide-y-0 divide-border sm:divide-x lg:divide-x px-0">
        <div className="p-6 flex items-start justify-between">
          <div className="flex flex-col gap-4">
            <p className="text-base font-medium text-card-foreground">Total Applications</p>
            <div>
              <p className="text-2xl font-medium text-card-foreground">{total_applications}</p>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </div>
          </div>
          <div className="p-3 rounded-full outline">
            <Briefcase size={16} />
          </div>
        </div>

        {trackers_trends.map((t) => {
          const { trend, pct } = getTrend(t.thisWeek, t.lastWeek);

          return (
            <div key={t._id} className="p-6 flex items-start justify-between">
              <div className="flex flex-col gap-4">
                <p className="text-base font-medium text-card-foreground">{t.status_name}</p>
                <div>
                  <p className="text-2xl font-medium text-card-foreground">{t.total}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">Last 7 days</p>
                    <span
                      className={`h-5 gap-1 rounded-4xl px-2 py-0.5 text-xs font-normal inline-flex items-center justify-center w-fit whitespace-nowrap ${
                        trend === "down"
                          ? "bg-red-600/10 text-red-600"
                          : "bg-teal-400/10 text-teal-400"
                      }`}
                    >
                      {pct > 0 ? "+" : ""}
                      {pct}%
                    </span>
                  </div>
                </div>
              </div>
              <TrendSparkline lastWeek={t.lastWeek} thisWeek={t.thisWeek} color={t.status_color} />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}