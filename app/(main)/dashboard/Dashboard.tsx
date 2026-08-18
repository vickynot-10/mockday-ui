"use client";
import { useDashboardGetData } from "@/hooks/queries/useDashboard";
export default function Dashboard() {
  const { data, isLoading } = useDashboardGetData();
  return <h1>dbdbb</h1>;
}
