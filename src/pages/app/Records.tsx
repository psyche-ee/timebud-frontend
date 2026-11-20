import { useEffect, useMemo, useRef, useState } from "react";
import { Download, ListChecks, Trash2, X } from "lucide-react";
import * as htmlToImage from "html-to-image";
import api from "../../api/axios";
import PageHeader from "../../components/ui/PageHeader";
import SectionCard from "../../components/ui/SectionCard";
import SegmentedControl from "../../components/ui/SegmentedControl";
import EmptyState from "../../components/ui/EmptyState";
import { useRecords } from "../../hooks/useRecords";
import { recordEarnings, recordHours } from "../../lib/analytics";
import { currency, formatDate, formatTime, hours } from "../../lib/format";

const filters = [
  { value: 7, label: "7 days" },
  { value: 15, label: "15 days" },
  { value: 30, label: "30 days" },
];

export default function Records() {
  const [filter, setFilter] = useState(7);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [now] = useState(() => Date.now());
  const exportRef = useRef<HTMLDivElement>(null);

  const { records, loading, error, setRecords } = useRecords();

  const filteredRecords = useMemo(() => {
    const cutoff = now - filter * 24 * 60 * 60 * 1000;
    return records
      .filter((record) => new Date(record.time_in).getTime() >= cutoff)
      .sort((a, b) => new Date(b.time_in).getTime() - new Date(a.time_in).getTime());
  }, [records, filter, now]);

  const totals = useMemo(
    () => ({
      hours: filteredRecords.reduce((sum, record) => sum + recordHours(record), 0),
      earnings: filteredRecords.reduce((sum, record) => sum + recordEarnings(record), 0),
    }),
    [filteredRecords]
  );

  useEffect(() => {
    if (!showExportModal) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowExportModal(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showExportModal]);

  const toggleSelect = (id: number) =>
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );

  const handleSelectAll = () =>
    setSelectedIds(
      selectedIds.length === filteredRecords.length
        ? []
        : filteredRecords.map((record) => record.id)
    );

  const handleDelete = async (ids: number[]) => {
    if (!ids.length) return;
    if (!confirm("Are you sure you want to delete selected record(s)?")) return;

    try {
      await Promise.all(ids.map((id) => api.delete(`/records/${id}`)));
      setRecords((current) => current.filter((record) => !ids.includes(record.id)));
      setSelectedIds([]);
      setSelectionMode(false);
    } catch (error) {
      console.error(error);
      alert("Failed to delete records");
    }
  };

  const downloadPNG = async () => {
    if (!exportRef.current) return;
    const dataUrl = await htmlToImage.toPng(exportRef.current, { pixelRatio: 3 });
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (navigator.share) {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "timebud-records.png", { type: blob.type });
      try {
        await navigator.share({ files: [file], title: "TimeBud Records" });
        return;
      } catch {
        console.log("Share cancelled");
      }
    }

    if (isIOS) {
      window.open(dataUrl);
      return;
    }

    const link = document.createElement("a");
    link.download = "timebud-records.png";
    link.href = dataUrl;
    link.click();
  };

  return (
    <>
      <PageHeader
        eyebrow="History"
        title="Records"
        description="Every session you've logged, in one place."
        actions={
          <>
            <button
              type="button"
              onClick={() => {
                setSelectionMode((current) => !current);
                setSelectedIds([]);
              }}
              className={`inline-flex min-h-10 items-center gap-2 rounded-xl border px-3.5 text-xs font-medium transition-all duration-200 ${
                selectionMode
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border bg-card text-foreground hover:border-primary/40 hover:text-primary"
              }`}
            >
              <ListChecks className="h-4 w-4" aria-hidden="true" />
              {selectionMode ? "Cancel" : "Select"}
            </button>
            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              disabled={!filteredRecords.length}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-3.5 text-xs font-semibold text-white transition-all duration-200 hover:bg-primary-hover active:scale-[0.98] disabled:opacity-50"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Export
            </button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-3 gap-3">
        {[
          { label: "Entries", value: String(filteredRecords.length) },
          { label: "Total hours", value: hours(totals.hours) },
          { label: "Earnings", value: currency(totals.earnings) },
        ].map((item) => (
          <div key={item.label} className="surface-card px-3 py-3 sm:px-4 sm:py-4">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
              {item.label}
            </p>
            <p className="tabular mt-1 text-sm font-bold text-foreground sm:text-lg">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl
          options={filters}
          value={filter}
          onChange={setFilter}
          label="Records date range"
        />
        <p className="text-xs text-muted-foreground">
          {filteredRecords.length} {filteredRecords.length === 1 ? "record" : "records"} found
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {selectionMode && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3">
          <p className="text-xs font-medium text-foreground">
            {selectedIds.length} selected
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="min-h-9 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Select all
            </button>
            <button
              type="button"
              onClick={() => handleDelete(selectedIds)}
              disabled={!selectedIds.length}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-destructive px-3 text-xs font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Delete
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="skeleton h-20 w-full" />
          ))}
        </div>
      ) : filteredRecords.length === 0 ? (
        <SectionCard>
          <EmptyState
            icon={ListChecks}
            title="No records found"
            description="Try a longer date range, or clock in to create your first record."
          />
        </SectionCard>
      ) : (
        <>
          {/* Desktop table */}
          <SectionCard className="hidden md:block" bodyClassName="overflow-x-auto p-0">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-border bg-secondary/40 text-[11px] uppercase tracking-wide text-muted-foreground">
                <tr>
                  {selectionMode && <th scope="col" className="px-4 py-3"><span className="sr-only">Select</span></th>}
                  <th scope="col" className="px-4 py-3 font-medium">Date</th>
                  <th scope="col" className="px-4 py-3 font-medium">Time in</th>
                  <th scope="col" className="px-4 py-3 font-medium">Time out</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Hours</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Earnings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRecords.map((record) => (
                  <tr
                    key={record.id}
                    onClick={() => selectionMode && toggleSelect(record.id)}
                    className={`transition-colors hover:bg-secondary/40 ${
                      selectionMode ? "cursor-pointer" : ""
                    } ${selectedIds.includes(record.id) ? "bg-primary/5" : ""}`}
                  >
                    {selectionMode && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(record.id)}
                          onChange={() => toggleSelect(record.id)}
                          aria-label={`Select record from ${formatDate(record.time_in)}`}
                          className="h-4 w-4 accent-[var(--primary)]"
                        />
                      </td>
                    )}
                    <td className="px-4 py-3 font-medium text-foreground">
                      {formatDate(record.time_in, "MMM d, yyyy")}
                    </td>
                    <td className="tabular px-4 py-3 text-muted-foreground">
                      {formatTime(record.time_in)}
                    </td>
                    <td className="tabular px-4 py-3 text-muted-foreground">
                      {record.time_out ? formatTime(record.time_out) : "Active"}
                    </td>
                    <td className="tabular px-4 py-3 text-right font-medium text-foreground">
                      {hours(record.total_hrs)}
                    </td>
                    <td className="tabular px-4 py-3 text-right">
                      <span className="font-semibold text-primary">
                        {currency(record.earnings)}
                      </span>
                      {Number(record.overtime_hrs) > 0 && (
                        <span className="mt-0.5 block text-[11px] font-normal text-amber-600 dark:text-amber-400">
                          {hours(record.overtime_hrs)} OT ·{" "}
                          {currency(record.overtime_earnings)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionCard>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {filteredRecords.map((record) => (
              <div
                key={record.id}
                onClick={() => selectionMode && toggleSelect(record.id)}
                className={`surface-card flex items-start justify-between gap-3 p-4 transition-all duration-200 ${
                  selectionMode ? "cursor-pointer" : ""
                } ${selectedIds.includes(record.id) ? "ring-2 ring-primary" : ""}`}
              >
                <div className="flex min-w-0 items-start gap-3">
                  {selectionMode && (
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(record.id)}
                      onChange={() => toggleSelect(record.id)}
                      aria-label={`Select record from ${formatDate(record.time_in)}`}
                      className="mt-1 h-4 w-4 accent-[var(--primary)]"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {formatDate(record.time_in, "EEE, MMM d")}
                    </p>
                    <p className="tabular mt-1 text-xs text-muted-foreground">
                      {formatTime(record.time_in)} –{" "}
                      {record.time_out ? formatTime(record.time_out) : "Active"}
                    </p>
                    <p className="mt-1 text-xs font-medium text-foreground">
                      {hours(record.total_hrs)}
                    </p>
                  </div>
                </div>
                <div className="tabular shrink-0 text-right">
                  <span className="text-sm font-bold text-primary">
                    {currency(record.earnings)}
                  </span>
                  {Number(record.overtime_hrs) > 0 && (
                    <span className="mt-0.5 block text-[11px] font-medium text-amber-600 dark:text-amber-400">
                      {hours(record.overtime_hrs)} OT ·{" "}
                      {currency(record.overtime_earnings)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setShowExportModal(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="export-title"
            className="surface-card animate-pop relative flex max-h-[90vh] w-full max-w-lg flex-col p-5 shadow-2xl sm:p-6"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 id="export-title" className="text-lg font-bold text-foreground">
                  Export records
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Preview your report before downloading.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                aria-label="Close export preview"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-border bg-secondary/40 p-3">
              <div ref={exportRef} className="space-y-1 bg-white p-5 text-slate-900">
                <div className="mb-4 flex items-end justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-blue-700">TimeBud Records</h3>
                    <p className="text-xs text-slate-500">
                      Work history · last {filter} days
                    </p>
                  </div>
                  <p className="text-xs text-slate-500">
                    {formatDate(new Date(), "MMM d, yyyy")}
                  </p>
                </div>
                <div className="mb-3 grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-3 text-center">
                  <div>
                    <p className="text-[10px] uppercase text-slate-500">Records</p>
                    <p className="text-sm font-bold">{filteredRecords.length}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-slate-500">Hours</p>
                    <p className="text-sm font-bold">{hours(totals.hours)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-slate-500">Earnings</p>
                    <p className="text-sm font-bold">{currency(totals.earnings)}</p>
                  </div>
                </div>
                {filteredRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex justify-between gap-2 border-b border-slate-100 py-1.5 text-xs"
                  >
                    <span className="w-24 shrink-0">{formatDate(record.time_in)}</span>
                    <span className="flex-1 text-slate-600">
                      {formatTime(record.time_in)} –{" "}
                      {record.time_out ? formatTime(record.time_out) : "Active"}
                    </span>
                    <span className="font-semibold">{currency(record.earnings)}</span>
                  </div>
                ))}
                {filteredRecords.length === 0 && (
                  <p className="py-10 text-center text-sm text-slate-400">
                    No records found
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="min-h-10 rounded-xl border border-border px-4 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                Close
              </button>
              <button
                type="button"
                onClick={downloadPNG}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-white transition-colors hover:bg-primary-hover"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                Download PNG
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
