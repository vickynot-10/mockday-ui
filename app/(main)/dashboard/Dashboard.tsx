"use client";
import { useDashboardGetData } from "@/hooks/queries/useDashboard";
import StatusPieChart from "./components/Piechart";
import UpcomingReminders from "./components/UpcomingReminders";
import TrackerBarChart from "./components/Barchart";
import StatsCard from "./components/StatsCard";

import {
  StatusPieChartLoader,
  StatsCardLoader,
  UpcomingRemindersLoader,
} from "@/loaders/dashboard.loader";
const EMPTY_ARRAY: never[] = [];
const ZERO = 0;

export default function Dashboard() {
  const { data, isLoading } = useDashboardGetData();

  const pie_chart = data?.status ?? EMPTY_ARRAY;
  const upcoming_reminders = data?.upcoming_reminders ?? EMPTY_ARRAY;
  const total_applications = data?.total_applications ?? ZERO;
  const trackers_trends = data?.trackers_trends ?? EMPTY_ARRAY;

  return (
    <div className="flex flex-col pb-8 gap-6">
      {isLoading ? (
        <StatsCardLoader />
      ) : (
        <StatsCard
          total_applications={total_applications}
          trackers_trends={trackers_trends}
        />
      )}
      <div className="w-full">
        <TrackerBarChart />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[6fr_4fr]">
        {isLoading ? (
          <UpcomingRemindersLoader />
        ) : (
          <UpcomingReminders data={upcoming_reminders} />
        )}
        {isLoading ? (
          <StatusPieChartLoader />
        ) : (
          <StatusPieChart data={pie_chart} />
        )}
      </div>
    </div>
  );
}
