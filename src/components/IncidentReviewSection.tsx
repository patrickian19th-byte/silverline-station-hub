import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { Video, History } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IncidentVideoDialog,
  type ReadyArchive,
} from "@/components/IncidentVideoDialog";
import { DataLifecycleInfo } from "@/components/StorageCard";
import {
  fetchArchiveAudit,
  type ArchiveAuditAction,
  type ArchiveAuditLog,
} from "@/lib/archive-audit";

const ACTION_LABEL: Record<ArchiveAuditAction, string> = {
  requested: "Requested",
  ready: "Ready",
  accessed: "Accessed",
};

const ACTION_TONE: Record<ArchiveAuditAction, string> = {
  requested: "border-sky-500/40 bg-sky-500/15 text-sky-400",
  ready: "border-emerald-500/40 bg-emerald-500/15 text-emerald-400",
  accessed: "border-border bg-muted/40 text-muted-foreground",
};

export function IncidentReviewSection({
  siteName,
  siteId,
}: {
  siteName?: string;
  siteId?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState<ReadyArchive | null>(null);
  const [unread, setUnread] = useState(0);
  const [initialDate, setInitialDate] = useState<Date | undefined>(undefined);
  const [audit, setAudit] = useState<ArchiveAuditLog[]>([]);
  const [showAudit, setShowAudit] = useState(false);

  const refreshAudit = useCallback(() => {
    void fetchArchiveAudit(15).then(setAudit);
  }, []);

  useEffect(() => {
    refreshAudit();
  }, [refreshAudit]);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          Incident Review
          {unread > 0 ? (
            <button
              type="button"
              onClick={() => {
                setUnread(0);
                setInitialDate(ready?.date);
                setOpen(true);
              }}
              className="rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-400"
            >
              {unread} new
            </button>
          ) : null}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setShowAudit((v) => !v);
              refreshAudit();
            }}
          >
            <History className="mr-2 h-4 w-4" /> Audit Log
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setInitialDate(undefined);
              setOpen(true);
            }}
          >
            <Video className="mr-2 h-4 w-4" /> View Incident Video
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Your footage is safe. Old footage retrieves when you need it. After 1 year, it's gone.
        </p>
        {ready ? (
          <p className="text-xs text-sky-400">
            Archive footage from {format(ready.date, "PPP")} is available for 1 hour.
          </p>
        ) : null}

        {showAudit ? (
          <div className="rounded-lg border border-border">
            <div className="border-b border-border px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Footage Access Audit Trail
            </div>
            {audit.length === 0 ? (
              <p className="px-3 py-4 text-sm text-muted-foreground">
                No archive activity recorded yet.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {audit.map((row) => (
                  <li
                    key={row.id}
                    className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-xs"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`rounded-full border px-2 py-0.5 font-medium ${ACTION_TONE[row.action]}`}
                      >
                        {ACTION_LABEL[row.action]}
                      </span>
                      <span className="text-foreground">
                        Footage {format(new Date(`${row.footage_date}T00:00:00`), "PP")}
                      </span>
                    </span>
                    <span className="text-muted-foreground">
                      {row.actor_name}
                      {row.actor_role ? ` · ${row.actor_role}` : ""} ·{" "}
                      {format(new Date(row.created_at), "PP p")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}

        <DataLifecycleInfo />
      </CardContent>

      <IncidentVideoDialog
        open={open}
        onOpenChange={setOpen}
        siteName={siteName}
        siteId={siteId}
        initialDate={initialDate}
        unlocked={ready}
        onAudit={refreshAudit}
        onArchiveReady={(r) => {
          setReady(r);
          setUnread((u) => u + 1);
        }}
      />
    </Card>
  );
}
