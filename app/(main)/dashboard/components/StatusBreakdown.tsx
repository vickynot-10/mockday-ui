"use client";
import { Inbox } from "lucide-react";

type StatusItem = {
  _id: string;
  count: number;
  status_name: string;
  status_color?: string;
};

function getTextColor(hex: string) {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 150 ? "#000000" : "#ffffff";
}

export default function StatusBreakdown({ data }: { data: StatusItem[] }) {
  if (!data.length) {
    return (
      <div className="h-[400px] flex flex-col rounded-lg border border-border p-4">
        <h3 className="text-sm font-semibold">Status Breakdown</h3>
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <Inbox className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">No data yet</p>
          <p className="text-xs text-muted-foreground">
            Tracked applications will show up here
          </p>
        </div>
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => b.count - a.count);
  const maxCount = sorted[0].count;

  return (
    <div className=" flex flex-col rounded-lg border border-border p-4">
      <h3 className="text-sm font-semibold mb-4">Status Breakdown</h3>
      <div className="flex-1 overflow-y-auto space-y-5">
        {sorted.map((item) => {
          const barWidth = maxCount === 0 ? 0 : Math.round((item.count / maxCount) * 100);
          const barColor = item.status_color ?? "#3B82F6";
          const textColor = getTextColor(barColor);

          return (
            <div key={item._id} className="flex items-center gap-4">
              <p className="w-24 shrink-0 text-sm font-medium truncate">
                {item.status_name}
              </p>
              <div className="flex-1 flex items-center gap-3">
                <div className="relative flex-1 h-8 rounded-md bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-md transition-all"
                    style={{ width: `${barWidth}%`, backgroundColor: barColor }}
                  />
                  <span
                    className="absolute inset-y-0 left-2 flex items-center text-xs font-semibold"
                    style={{ color: textColor }}
                  >
                    {barWidth}%
                  </span>
                </div>
                <span className="w-6 text-right text-sm font-semibold">{item.count}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}