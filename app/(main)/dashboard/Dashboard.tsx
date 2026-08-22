"use client";
import { useDashboardGetData } from "@/hooks/queries/useDashboard";
import StatusPieChart from "./components/Piechart";
import UpcomingReminders from "./components/UpcomingReminders";
import TrackerBarChart from "./components/Barchart";
import StatsCard from "./components/StatsCard";
const EMPTY_ARRAY: never[] = [];
const ZERO = 0
export default function Dashboard() {
  const { data, isLoading } = useDashboardGetData();

  const pie_chart = data?.status ?? EMPTY_ARRAY;
  const upcoming_reminders = data?.upcoming_reminders ?? EMPTY_ARRAY;
  const total_applications = data?.total_applications ?? ZERO;
  const trackers_trends = data?.trackers_trends ?? EMPTY_ARRAY;

  console.log(total_applications , "total")
  console.log(trackers_trends, "trndfs")

  return (
    <div className="flex flex-col pb-8 gap-6">
      <StatsCard total_applications={total_applications} trackers_trends={trackers_trends} />
      <div className="w-full">
        <TrackerBarChart />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[6fr_4fr]">
        <UpcomingReminders data={upcoming_reminders} />
        <StatusPieChart data={pie_chart} />
      </div>
    </div>
  );
}