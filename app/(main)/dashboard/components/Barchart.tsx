"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  CartesianGrid,
  LabelList,
  XAxis,
} from "recharts";
import {
  ChevronDown,
  Check,
  PackageOpen,
  BarChart3,
  LineChart as LineChartIcon,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useDashboardChartData } from "@/hooks/queries/useDashboard";
import { BarChartLoader, LineChartLoader } from "@/loaders/dashboard.loader";

type ChartRow = {
  date: string;
  count: number;
};

type ChartApiResponse = {
  type: number;
  from_date: string;
  end_date: string;
  data: ChartRow[];
};

const DATE_FILTER = [
  { label: "Today", value: 1 },
  { label: "Last 7 Days", value: 2 },
  { label: "Last 15 Days", value: 3 },
  { label: "Last 30 Days", value: 4 },
  { label: "Last 6 Months", value: 5 },
  { label: "Last 1 Year", value: 6 },
];

const chartConfig = {
  count: {
    label: "Entries",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

function formatTick(value: string, type: number) {
  try {
    if (type === 1) return format(parseISO(value.replace(" ", "T")), "ha");
    if (type >= 5) return format(parseISO(value + "-01"), "MMM");
    return format(parseISO(value), "MMM d");
  } catch {
    return value;
  }
}
const EMPTY_ARRAY: never[] = [];

export default function TrackerBarChart() {
  const [type, setType] = useState(1);
  const [chartType, setChartType] = useState(1);
  const { data, isLoading } = useDashboardChartData(type);

  const response: ChartApiResponse | undefined = data?.data ?? data;
  const rows = response?.data ?? EMPTY_ARRAY;
  const activeLabel =
    DATE_FILTER.find((f) => f.value === type)?.label ?? "Today";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Activity</CardTitle>
          <CardDescription>{activeLabel}</CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border border-border p-0.5">
            <Button
              variant={chartType === 1 ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => setChartType(1)}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button
              variant={chartType === 2 ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => setChartType(2)}
            >
              <LineChartIcon className="h-4 w-4" />
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="sm" className="gap-1">
                  {activeLabel}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              }
            />

            <DropdownMenuContent align="end">
              {DATE_FILTER.map((filter) => (
                <DropdownMenuItem
                  key={filter.value}
                  onClick={() => setType(filter.value)}
                  className="flex items-center justify-between"
                >
                  {filter.label}
                  {filter.value === type && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading && chartType === 1 && <BarChartLoader />}
        {isLoading && chartType === 2 && <LineChartLoader />}

        {!isLoading && rows.length <= 0 && (
          <div className="flex h-[180px] flex-col items-center justify-center gap-2 text-muted-foreground">
            <PackageOpen className="h-8 w-8" />
            <p className="text-sm">No data found</p>
          </div>
        )}

        {!isLoading && rows && rows.length > 0 && chartType === 1 && (
          <ChartContainer config={chartConfig} className="h-[180px] w-full">
            <BarChart
              accessibilityLayer
              data={rows}
              margin={{
                top: 20,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => formatTick(value, type)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="count" fill="var(--color-count)" radius={8}>
                <LabelList
                  position="top"
                  offset={12}
                  className="fill-foreground"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}

        {!isLoading && rows && rows.length > 0 && chartType === 2 && (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[180px] w-full"
          >
            <LineChart
              accessibilityLayer
              data={rows}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => formatTick(value, type)}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[150px]"
                    nameKey="count"
                    hideLabel
                  />
                }
              />
              <Line
                dataKey="count"
                type="monotone"
                stroke="var(--color-count)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>

      <CardFooter className="text-sm text-muted-foreground">
        {response?.from_date && response?.end_date
          ? `${format(new Date(response.from_date), "MMM d, yyyy")} - ${format(
              new Date(response.end_date),
              "MMM d, yyyy",
            )}`
          : ""}
      </CardFooter>
    </Card>
  );
}
