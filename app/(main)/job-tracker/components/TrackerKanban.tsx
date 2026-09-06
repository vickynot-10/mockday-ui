"use client";

import { useEffect, useState } from "react";
import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanColumnHandle,
  KanbanItem,
  KanbanItemHandle,
  KanbanOverlay,
} from "@/components/reui/kanban";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGetTrackers, useUpdateStatusTrackers } from "@/hooks/queries/useTrackers";
import type { TrackerRow, TrackerStatus } from "../JobTracker";

const EMPTY_ARRAY: never[] = [];

type Filters = {
  sort: string;
  search: string;
  status?: string;
  from?: string;
  to?: string;
};

type Props = {
  filters: Filters;
  statuses: TrackerStatus[];
};

export default function JobTrackerKanbanView({ filters, statuses }: Props) {
  const { data, isLoading } = useGetTrackers({ page: 1, limit: 500, ...filters });
  const { mutate: updateStatus } = useUpdateStatusTrackers();

  const rows: TrackerRow[] = data?.data?.docs ?? EMPTY_ARRAY;

  const [columns, setColumns] = useState<Record<string, TrackerRow[]>>({});

  useEffect(() => {
    const grouped: Record<string, TrackerRow[]> = {};
    for (const s of statuses) grouped[s._id] = [];
    grouped["unassigned"] = [];

    for (const row of rows) {
      const key = row.status_result?._id ?? "unassigned";
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(row);
    }
    setColumns(grouped);
  }, [rows, statuses]);

  function handleValueChange(next: Record<string, TrackerRow[]>) {
    for (const statusId of Object.keys(next)) {
      const prevIds = new Set((columns[statusId] ?? []).map((r) => r._id));
      const movedIn = next[statusId].find((item) => !prevIds.has(item._id));
      if (movedIn) {
        updateStatus({
          status_id: statusId === "unassigned" ? null : statusId,
          tracker_id: movedIn._id,
        });
        break;
      }
    }
    setColumns(next);
  }

  if (isLoading) return <div className="text-sm text-muted-foreground py-8 text-center">Loading...</div>;

  return (
    <Kanban value={columns} onValueChange={handleValueChange} getItemValue={(item) => item._id}>
      <KanbanBoard>
        {statuses.map((s) => (
          <KanbanColumn key={s._id} value={s._id}>
            <KanbanColumnHandle>
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              <h3 className="font-heading italic text-sm">{s.name}</h3>
              <Badge variant="outline" className="ml-auto">
                {(columns[s._id] ?? []).length}
              </Badge>
            </KanbanColumnHandle>
            <KanbanColumnContent value={s._id}>
              {(columns[s._id] ?? []).map((item) => (
                <KanbanItem key={item._id} value={item._id}>
                  <KanbanItemHandle>
                    <Card>
                      <CardContent className="p-3 flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground">{item.site_name}</span>
                        <span className="text-sm font-medium">{item.company}</span>
                      </CardContent>
                    </Card>
                  </KanbanItemHandle>
                </KanbanItem>
              ))}
            </KanbanColumnContent>
          </KanbanColumn>
        ))}
      </KanbanBoard>

      <KanbanOverlay>
        <div className="bg-muted size-full rounded-md" />
      </KanbanOverlay>
    </Kanban>
  );
}