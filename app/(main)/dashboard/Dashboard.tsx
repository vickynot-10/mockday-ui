"use client";
import { useDashboardGetData } from "@/hooks/queries/useDashboard";
import StatusPieChart from "./components/Piechart";
import UpcomingReminders from "./components/UpcomingReminders";
import TrackerBarChart from "./components/Barchart";
const EMPTY_ARRAY: never[] = [];

export default function Dashboard() {
  const { data, isLoading } = useDashboardGetData();

  const pie_chart = data?.status ?? EMPTY_ARRAY;
  const upcoming_reminders = data?.upcoming_reminders ?? EMPTY_ARRAY;

  return (
    <div className=" flex flex-col gap-6" >
      <div className=" w-full">
        <TrackerBarChart />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[7fr_3fr]">
        <UpcomingReminders data={upcoming_reminders} />

        <div className="w-full">
          <StatusPieChart data={pie_chart} />
        </div>
      </div>
    </div>
  );
}
