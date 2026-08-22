"use client";

import * as React from "react";
import { Label, Pie, PieChart } from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

type StatusItem = {
  _id: string;
  count: number;
  status_name: string;
  status_color?: string;
};

const DEFAULT_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function isValidColor(color?: string) {
  return (
    typeof color === "string" &&
    /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color)
  );
}

function getColor(item: StatusItem, index: number) {
  if (isValidColor(item.status_color)) return item.status_color as string;
  return DEFAULT_COLORS[index % DEFAULT_COLORS.length];
}

export default function StatusPieChart({ data }: { data: StatusItem[] }) {
  const total = React.useMemo(
    () => data.reduce((sum, item) => sum + item.count, 0),
    [data]
  );

  const chartData = React.useMemo(
    () =>
      data.map((item, index) => ({
        ...item,
        fill: getColor(item, index),
      })),
    [data]
  );

  const chartConfig: ChartConfig = React.useMemo(
    () =>
      data.reduce((config, item, index) => {
        config[item.status_name] = {
          label: item.status_name,
          color: getColor(item, index),
        };
        return config;
      }, {} as ChartConfig),
    [data]
  );

  return (
  <Card className="h-[400px] flex flex-col">
      <CardHeader>
        <CardTitle>Status Breakdown</CardTitle>
      </CardHeader>
 <CardContent className="flex flex-1 items-center justify-center">
        <ChartContainer
          config={chartConfig}
          className="mx-auto h-full w-full max-w-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent nameKey="status_name" hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status_name"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {total.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Total
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}