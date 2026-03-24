import { useState, useEffect, useMemo, useRef } from "react";
import BottomNav from "../../components/BottomNav";
import Header from "../../components/Header";
import api from "../../api/axios";
import * as htmlToImage from "html-to-image";

const CACHE_KEY = "recordsCache";
// const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default function Records() {
  const [filter, setFilter] = useState(7);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);

  const handlePreview = () => setShowExportModal(true);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredRecords.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRecords.map((r) => r.id));
    }
  };

  // Get current user from localStorage or auth context
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  // Fetch records
  useEffect(() => {
    const fetchRecords = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get("/records");
        const data = res.data.data;

        // Security: Verify records belong to current user
        if (data && Array.isArray(data)) {
          const isValid = data.every((r: any) => r.user_id === currentUser.id);
          if (!isValid) {
            console.error("Security: Records don't belong to current user");
            setRecords([]);
            localStorage.removeItem(CACHE_KEY);
            return;
          }

          setRecords(data);
          // Always update cache on every visit
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ data, timestamp: Date.now() })
          );
        } else {
          setRecords([]);
        }
      } catch (err) {
        console.error("Failed to fetch records:", err);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    // Always fetch fresh data on page visit
    fetchRecords();
  }, [currentUser]);

  // Filter by days
  const filteredRecords = useMemo(() => {
    const now = new Date();
    return records.filter((r) => {
      const recordDate = new Date(r.time_in);
      const diff = (now.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24);
      return diff <= filter;
    });
  }, [records, filter]);

  // Download/export PNG
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
      } catch (err) {
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

  const handleDelete = async (ids: number[]) => {
    if (!confirm("Are you sure you want to delete selected record(s)?")) return;

    try {
      await Promise.all(ids.map(id => api.delete(`/records/${id}`)));

      // Update UI instantly
      setRecords(prev => prev.filter(r => !ids.includes(r.id)));

      // Reset selection
      setSelectedIds([]);
      setSelectionMode(false);

    } catch (err) {
      console.error(err);
      alert("Failed to delete records");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto p-4 space-y-4">
        <Header />

        {/* Page Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Records</h1>
          <button
            onClick={handlePreview}
            className="text-sm bg-primary text-white px-3 py-1.5 rounded-lg"
          >
            Export
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2">
          {[7, 15, 30].map((d) => (
            <button
              key={d}
              onClick={() => setFilter(d)}
              className={`px-3 py-1.5 rounded-full text-sm transition
                ${filter === d ? "bg-primary text-white shadow" : "bg-surface text-gray-600"}`}
            >
              Last {d} days
            </button>
          ))}
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-surface p-4 rounded-xl shadow-sm border border-gray-100 animate-pulse"
              >
                <div className="flex justify-between">
                  <div className="space-y-2">
                    <div className="h-3 w-20 bg-gray-200 rounded"></div>
                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                    <div className="h-3 w-28 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-4 w-14 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectionMode && (
          <div className="flex justify-between items-center bg-red-50 border border-red-200 p-3 rounded-xl">
            
            <p className="text-sm">
              {selectedIds.length} selected
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleSelectAll}
                className="text-xs px-2 py-1 bg-gray-200 rounded"
              >
                Select All
              </button>

              <button
                onClick={() => handleDelete(selectedIds)}
                className="text-xs px-2 py-1 bg-red-500 text-white rounded"
              >
                Delete
              </button>

              <button
                onClick={() => {
                  setSelectionMode(false);
                  setSelectedIds([]);
                }}
                className="text-xs px-2 py-1 bg-gray-300 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Records List */}
        {!loading && filteredRecords.length > 0 && (
          <div className="space-y-3">
            {filteredRecords.map((r) => {
              const date = new Date(r.time_in).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              const timeIn = new Date(r.time_in).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              const timeOut = r.time_out
                ? new Date(r.time_out).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Active";

              return (
                <div
                  key={r.id}
                  onClick={() => selectionMode && toggleSelect(r.id)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setSelectionMode(true);
                    toggleSelect(r.id);
                  }}
                  className={`bg-card border p-4 rounded-xl shadow-sm flex justify-between cursor-pointer transition
                    ${selectedIds.includes(r.id) ? "ring-2 ring-red-500" : ""}`}
                >
                  <div className="flex gap-3 items-start">
                    
                    {/* Checkbox */}
                    {selectionMode && (
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(r.id)}
                        onChange={() => toggleSelect(r.id)}
                      />
                    )}

                    <div>
                      <p className="text-sm text-gray-500">{date}</p>
                      <p className="font-medium text-secondary">{r.total_hrs} hrs</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {timeIn} — {timeOut}
                      </p>
                    </div>
                  </div>

                  <p className="font-semibold text-primary">
                    ₱{r.earnings?.toFixed(2) ?? "0.00"}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Hidden Export Area */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl max-w-md w-[90%] shadow-lg">
              <div ref={exportRef} className="space-y-1 bg-white p-4 border">
                <h2 className="font-bold text-lg text-primary mb-4">TimeBud Work Records</h2>
                {filteredRecords.map((r) => {
                  const date = new Date(r.time_in).toLocaleDateString();
                  const timeIn = new Date(r.time_in).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const timeOut = r.time_out
                    ? new Date(r.time_out).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Active";

                  return (
                    <div key={r.id} className="flex justify-between text-sm border-b border-gray-100 py-1">
                      <span>{date}</span>
                      <span>{timeIn} — {timeOut}</span>
                      <span>₱{r.earnings?.toFixed(2)}</span>
                    </div>
                  );
                })}
                {filteredRecords.length === 0 && (
                  <div className="text-center text-gray-400 py-10">No records found</div>
                )}
              </div>

              <div className="flex justify-end mt-4 gap-2">
                <button
                  className="px-4 py-1.5 rounded-lg bg-gray-200 text-gray-700"
                  onClick={() => setShowExportModal(false)}
                >
                  Close
                </button>

                <button
                  className="px-4 py-1.5 rounded-lg bg-primary text-white"
                  onClick={downloadPNG}
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {(!loading && filteredRecords.length === 0) && (
        <div className="text-center text-gray-400 py-10">No records found</div>
      )}

      <BottomNav />
    </div>
  );
}