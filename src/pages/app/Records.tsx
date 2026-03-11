import { useState, useEffect, useMemo, useRef } from "react";
import BottomNav from "../../components/BottomNav";
import Header from "../../components/Header";
import api from "../../api/axios";
import * as htmlToImage from "html-to-image";

export default function Records() {

  const [filter, setFilter] = useState(7);
  const [records, setRecords] = useState<any[]>([]);
  const exportRef = useRef<HTMLDivElement>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  const handlePreview = () => {
    setShowExportModal(true);
  };

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await api.get("/records");
        setRecords(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchRecords();
  }, []);

  // Filter records by days
  const filteredRecords = useMemo(() => {
    const now = new Date();
    return records.filter((r) => {
      const recordDate = new Date(r.time_in);
      const diff =
        (now.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24);
      return diff <= filter;
    });
  }, [records, filter]);

  // Download PNG
  const downloadPNG = async () => {
    if (!exportRef.current) return;

    const dataUrl = await htmlToImage.toPng(exportRef.current);

    const link = document.createElement("a");
    link.download = "timebud-records.png";
    link.href = dataUrl;
    link.click();
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
              className={`px-4 py-1.5 rounded-full text-sm transition
              ${
                filter === d
                  ? "bg-primary text-white shadow"
                  : "bg-surface text-gray-600"
              }`}
            >
              Last {d} days
            </button>
          ))}

        </div>

        {/* Records List */}
        <div className="space-y-3">

          {filteredRecords.map((r) => {

            const date = new Date(r.time_in).toLocaleDateString(undefined, {
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
                className="bg-surface p-4 rounded-xl shadow-sm border border-gray-100"
              >
                <div className="flex justify-between">

                  <div>
                    <p className="text-sm text-gray-500">{date}</p>
                    <p className="font-medium">{r.total_hrs} hrs</p>

                    <p className="text-xs text-gray-400 mt-1">
                      {timeIn} — {timeOut}
                    </p>
                  </div>

                  <p className="font-semibold text-primary">
                    ₱{r.earnings?.toFixed(2) ?? "0.00"}
                  </p>

                </div>
              </div>
            );
          })}

        </div>

        {/* Hidden Export Area */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl max-w-md w-[90%] shadow-lg">

              {/* THIS is what we export */}
              <div ref={exportRef} className="space-y-1 bg-white p-4 border">
                <h2 className="font-bold text-lg text-primary mb-4">
                  TimeBud Work Records
                </h2>

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
                    <div
                      key={r.id}
                      className="flex justify-between text-sm border-b border-gray-100 py-1"
                    >
                      <span>{date}</span>
                      <span>{timeIn} — {timeOut}</span>
                    </div>
                  );
                })}
                {filteredRecords.length === 0 && (
                  <div className="text-center text-gray-400 py-10">
                    No records found
                  </div>
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
      {filteredRecords.length === 0 && (
        <div className="text-center text-gray-400 py-10">
          No records found
        </div>
      )}

      <BottomNav />

    </div>
  );
}