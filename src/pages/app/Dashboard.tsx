import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  LogIn,
  LogOut,
  Mic,
  Pencil,
  Sparkles,
  Timer,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import api from "../../api/axios";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import SectionCard from "../../components/ui/SectionCard";
import ProgressRing from "../../components/ui/ProgressRing";
import HoursTrendChart from "../../components/charts/HoursTrendChart";
import { useRecords } from "../../hooks/useRecords";
import { dailySeries } from "../../lib/analytics";
import { readUser } from "../../lib/auth";
import { currency, formatDate, formatTime, greeting, hours, todayLabel } from "../../lib/format";

type ClockType = "time-in" | "time-out";
type BreakType = "break-in" | "break-out";

type DashboardActivity = {
  time_in?: string | null;
  time_out?: string | null;
  total_hrs?: number | string;
};

type DashboardRecord = {
  id: number | string;
  time_in: string;
  time_out?: string | null;
  total_hrs?: number | string;
  earnings?: number | string;
};

type DashboardData = {
  today_activity?: DashboardActivity;
  weekly_earnings?: number | string;
  weekly_hours?: number | string;
  today_hours?: number | string;
  today_income?: number | string;
  clocked_in?: boolean;
  active_time_in?: string | null;
  active_break_in?: string | null;
  break_elapsed_minutes?: number;
  session_break_minutes?: number;
  overtime_threshold_hrs?: number | string;
  overtime_rate_per_hr?: number | string;
  past_three_days_records?: DashboardRecord[];
};

type ParsedEntry = {
  date: string;
  time_in: string;
  time_out: string;
  break_minutes: number;
  interpreted: string;
  preview: {
    gross_hrs?: string;
    net_hrs: string;
    regular_hrs: string;
    overtime_hrs: string;
    total_earnings: number;
    rate_per_hr: string;
    overtime_rate_per_hr: string;
    threshold_hrs: string;
  };
  warnings: { code: string; message: string; severity: string }[];
};

type ParsedPunch = {
  date: string;
  timestamp: string;
  label: string;
  interpreted: string;
  warnings: { code: string; message: string; severity: string }[];
};

type SessionDraft = {
  timeIn: string;
  timeOut: string;
  breakMinutes: string;
};

const toTimeInput = (iso: string) => {
  const value = new Date(iso);
  if (Number.isNaN(value.getTime())) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
};

const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

// Mirrors the backend preview so edits to an interpreted shift immediately
// update Net, Overtime and Pay. The server recalculates on save.
const recomputePreview = (base: ParsedEntry["preview"], draft: SessionDraft) => {
  const start = new Date(draft.timeIn);
  const end = new Date(draft.timeOut);
  const elapsed =
    Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())
      ? 0
      : (end.getTime() - start.getTime()) / 3_600_000;
  // The backend quantizes elapsed/break/net/earnings to cents at each step.
  const gross = round2(Math.max(0, elapsed));
  const breakHours = round2(Math.max(0, Number(draft.breakMinutes) || 0) / 60);
  const net = Math.max(0, round2(gross - breakHours));
  const rate = Number(base.rate_per_hr) || 0;
  const overtimeRate = Number(base.overtime_rate_per_hr) || rate;
  const threshold = Number(base.threshold_hrs) || 0;
  const overtime = net > threshold ? round2(net - threshold) : 0;
  const regular = net > threshold ? threshold : net;
  const regularPay = round2(regular * rate);
  const overtimePay = round2(overtime * overtimeRate);

  return {
    ...base,
    gross_hrs: gross.toFixed(2),
    net_hrs: net.toFixed(2),
    regular_hrs: round2(regular).toFixed(2),
    overtime_hrs: overtime.toFixed(2),
    total_earnings: round2(regularPay + overtimePay),
  };
};

const draftSummary = (draft: SessionDraft) => {
  const start = new Date(draft.timeIn);
  const end = new Date(draft.timeOut);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "Enter a valid time range";
  }
  return `${formatDate(start, "EEE, MMM d")}, ${formatTime(start)} to ${formatDate(end, "EEE, MMM d")}, ${formatTime(end)} · ${Math.max(0, Number(draft.breakMinutes) || 0)}m break`;
};

// Minimal typings for the browser Speech Recognition API (not in TS DOM lib).
type SpeechAlternative = { transcript: string };
type SpeechResult = { isFinal: boolean; length: number; [index: number]: SpeechAlternative };
type SpeechResultList = { length: number; [index: number]: SpeechResult };
type SpeechRecognitionEvent = {
  resultIndex: number;
  results: SpeechResultList;
};
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

const getSpeechRecognition = (): SpeechRecognitionConstructor | null => {
  if (typeof window === "undefined") return null;
  const browser = window as typeof window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return browser.SpeechRecognition || browser.webkitSpeechRecognition || null;
};

const saveOfflineAction = (action: ClockType | BreakType, timestamp: string) => {
  const queue = JSON.parse(localStorage.getItem("offlineQueue") || "[]");
  queue.push({ action, timestamp });
  localStorage.setItem("offlineQueue", JSON.stringify(queue));
};

const syncOfflineActions = async () => {
  const queue = JSON.parse(localStorage.getItem("offlineQueue") || "[]");
  if (!queue.length) return;

  for (const record of queue) {
    try {
      await api.post(record.action === "time-in" ? "/time-in" : "/time-out", {
        timestamp: record.timestamp,
      });
    } catch (error) {
      console.log("Failed to sync offline record", error);
      return;
    }
  }

  localStorage.removeItem("offlineQueue");
};

export default function Dashboard() {
  const [time, setTime] = useState(new Date());
  const [dashboard, setDashboard] = useState<DashboardData | null>(() => {
    const cached = localStorage.getItem("dashboardCache");
    return cached ? (JSON.parse(cached) as DashboardData) : null;
  });
  const [loading, setLoading] = useState(!dashboard);

  const [showManual, setShowManual] = useState(false);
  const [manualType, setManualType] = useState<ClockType>("time-in");
  const [manualMode, setManualMode] = useState<"punch" | "session">("punch");
  const [punchText, setPunchText] = useState("");
  const [parsedPunch, setParsedPunch] = useState<ParsedPunch | null>(null);
  const [parsingPunch, setParsingPunch] = useState(false);
  const [nlText, setNlText] = useState("");
  const [parsed, setParsed] = useState<ParsedEntry | null>(null);
  const [sessionDraft, setSessionDraft] = useState<SessionDraft | null>(null);
  const [parsing, setParsing] = useState(false);
  const [listening, setListening] = useState(false);
  const [speechSupported] = useState(() => Boolean(getSpeechRecognition()));
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  // Always release the microphone when the manual-entry modal closes.
  useEffect(() => {
    if (!showManual) {
      recognitionRef.current?.stop();
      setListening(false);
    }
  }, [showManual]);

  useEffect(() => () => recognitionRef.current?.stop(), []);

  const sessionPreview = useMemo(
    () =>
      parsed && sessionDraft
        ? recomputePreview(parsed.preview, sessionDraft)
        : parsed?.preview,
    [parsed, sessionDraft]
  );

  const isDraftEdited = useMemo(() => {
    if (!parsed || !sessionDraft) return false;
    return (
      sessionDraft.timeIn !== toTimeInput(parsed.time_in) ||
      sessionDraft.timeOut !== toTimeInput(parsed.time_out) ||
      Number(sessionDraft.breakMinutes) !== Number(parsed.break_minutes)
    );
  }, [parsed, sessionDraft]);

  const sessionDraftValid = useMemo(() => {
    if (!sessionDraft) return false;
    const start = new Date(sessionDraft.timeIn);
    const end = new Date(sessionDraft.timeOut);
    return (
      !Number.isNaN(start.getTime()) &&
      !Number.isNaN(end.getTime()) &&
      end > start &&
      Math.max(0, Number(sessionDraft.breakMinutes) || 0) >= 0
    );
  }, [sessionDraft]);

  const user = readUser();
  const { records } = useRecords();

  const fetchDashboard = useCallback(async () => {
    try {
      const response = await api.get("/dashboard");
      setDashboard(response.data.data);
      localStorage.setItem("dashboardCache", JSON.stringify(response.data.data));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      toast.success("Back online! Syncing offline records...");
      void syncOfflineActions().then(() => fetchDashboard());
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [fetchDashboard]);

  useEffect(() => {
    if (!showManual) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        recognitionRef.current?.stop();
        setListening(false);
        setShowManual(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showManual]);

  useEffect(() => () => recognitionRef.current?.stop(), []);

  // Punch endpoints may ask for acknowledgment of anomalous entries. Confirm
  // with the user, then retry with the short-lived server token.
  const postPunch = async (url: string, payload: Record<string, unknown>) => {
    let response = await api.post(url, payload);
    if (response.data?.data?.requires_confirmation) {
      const warningList = (response.data.data.warnings || [])
        .map((item: { message: string }) => `• ${item.message}`)
        .join("\n");
      const ok = window.confirm(
        `${response.data.message}\n\n${warningList}\n\nSave anyway?`
      );
      if (!ok) return null;
      response = await api.post(url, {
        ...payload,
        confirm: true,
        confirm_token: response.data.data.confirm_token,
      });
    }
    return response;
  };

  const handleClock = async (type: ClockType) => {
    const timestamp = new Date().toISOString();

    if (!navigator.onLine) {
      saveOfflineAction(type, timestamp);
      toast.success(
        `Time ${type === "time-in" ? "in" : "out"} recorded offline. Will sync when online.`
      );
      return;
    }

    try {
      const response = await postPunch(`/${type}`, { timestamp });
      if (!response) return;
      if (response.data.status === 1) toast.success(response.data.message);
      else toast.warning(response.data.message);
      await fetchDashboard();
    } catch (error) {
      console.log(error);
      saveOfflineAction(type, timestamp);
      toast.success("Offline fallback: your record will sync later.");
    }
  };

  const handleBreak = async (type: "break-in" | "break-out") => {
    const timestamp = new Date().toISOString();

    if (!navigator.onLine) {
      saveOfflineAction(type, timestamp);
      toast.success(
        `Break ${type === "break-in" ? "in" : "out"} recorded offline. Will sync when online.`
      );
      return;
    }

    try {
      const response = await postPunch(`/${type}`, { timestamp });
      if (!response) return;
      if (response.data.status === 1) toast.success(response.data.message);
      else toast.warning(response.data.message);
      await fetchDashboard();
    } catch (error) {
      console.log(error);
      saveOfflineAction(type, timestamp);
      toast.success("Offline fallback: your break record will sync later.");
    }
  };

  const openManual = (type: ClockType) => {
    setManualType(type);
    setManualMode("punch");
    setPunchText("");
    setParsedPunch(null);
    setNlText("");
    setParsed(null);
    setSessionDraft(null);
    setShowManual(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const closeManual = () => {
    stopListening();
    setShowManual(false);
  };

  const toggleVoice = (target: "punch" | "session") => {
    const Recognition = getSpeechRecognition();
    if (!Recognition) {
      toast.warning("Voice input isn't supported in this browser. Try Chrome or Edge.");
      return;
    }
    if (listening) {
      stopListening();
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = Array.from({ length: event.results.length })
        .map((_, index) => event.results[index][0]?.transcript || "")
        .join(" ")
        .trim();
      if (!transcript) return;

      const append = (current: string) =>
        current.trim() ? `${current.trim()} ${transcript}` : transcript;
      if (target === "punch") {
        setPunchText(append);
      } else {
        setNlText(append);
      }
      toast.success("Voice input added");
    };
    recognition.onerror = (event) => {
      setListening(false);
      if (event.error !== "no-speech" && event.error !== "aborted") {
        toast.warning(`Voice input failed (${event.error}). You can type instead.`);
      }
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;

    try {
      recognition.start();
      setListening(true);
    } catch {
      setListening(false);
      toast.warning("Could not start voice input.");
    }
  };

  const handlePunchParse = async () => {
    stopListening();
    if (!punchText.trim()) {
      toast.warning("Type or say a time first.");
      return;
    }
    setParsingPunch(true);
    try {
      const response = await api.post("/manual-entry/parse", {
        kind: "punch",
        type: manualType,
        text: punchText,
      });
      if (response.data.status === 1) {
        setParsedPunch(response.data.data as ParsedPunch);
        toast.success("Time understood. Review and save.");
      } else {
        toast.warning(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Could not interpret that time.");
    } finally {
      setParsingPunch(false);
    }
  };

  const handlePunchSave = async () => {
    if (!parsedPunch) {
      toast.warning("Interpret a time first.");
      return;
    }
    if (new Date(parsedPunch.timestamp) > new Date()) {
      toast.warning("Cannot save a future time.");
      return;
    }

    const timestamp = parsedPunch.timestamp;
    try {
      const response = await postPunch(
        manualType === "time-in" ? "/manual-time-in" : "/manual-time-out",
        { timestamp }
      );
      if (!response) return;
      if (response.data.status === 1) {
        toast.success(response.data.message);
        setShowManual(false);
        await fetchDashboard();
      } else {
        toast.warning(response.data.message);
      }
    } catch (error) {
      console.error(error);
      saveOfflineAction(manualType, timestamp);
      toast.success("Saved offline. Will sync later.");
      setShowManual(false);
    }
  };

  const handleParse = async () => {
    stopListening();
    if (!nlText.trim()) {
      toast.warning("Describe your session first.");
      return;
    }
    setParsing(true);
    try {
      const response = await api.post("/manual-entry/parse", { text: nlText });
      if (response.data.status === 1) {
        const result = response.data.data as ParsedEntry;
        setParsed(result);
        setSessionDraft({
          timeIn: toTimeInput(result.time_in),
          timeOut: toTimeInput(result.time_out),
          breakMinutes: String(result.break_minutes ?? 0),
        });
        if (result.warnings?.length) {
          toast.warning(`${result.warnings.length} detail(s) to check below.`);
        } else {
          toast.success("Session understood. Review the preview below.");
        }
      } else {
        toast.warning(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Could not interpret that entry.");
    } finally {
      setParsing(false);
    }
  };

  const handleSessionSave = async () => {
    if (!parsed || !sessionDraft) {
      toast.warning("Describe and parse a session first.");
      return;
    }
    if (!sessionDraftValid) {
      toast.warning("Time out must be after time in. Check the interpreted details.");
      return;
    }

    const timeIn = new Date(sessionDraft.timeIn);
    const timeOut = new Date(sessionDraft.timeOut);
    if (timeIn > new Date()) {
      toast.warning("Cannot save a future session.");
      return;
    }

    try {
      const response = await postPunch("/manual-entry", {
        time_in: timeIn.toISOString(),
        time_out: timeOut.toISOString(),
        break_minutes: Math.max(0, Number(sessionDraft.breakMinutes) || 0),
      });
      if (!response) return;
      if (response.data.status === 1) {
        toast.success(response.data.message);
        setNlText("");
        setParsed(null);
        setSessionDraft(null);
        setShowManual(false);
        await fetchDashboard();
      } else {
        toast.warning(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Could not save the session.");
    }
  };

  const activity = dashboard?.today_activity ??
    (dashboard?.active_time_in
      ? { time_in: dashboard.active_time_in, time_out: null, total_hrs: 0 }
      : undefined);
  const isClockedIn =
    dashboard?.clocked_in ?? Boolean(activity?.time_in && !activity?.time_out);
  const isOnBreak = Boolean(dashboard?.active_break_in);
  const breakStartedAt = dashboard?.active_break_in
    ? new Date(dashboard.active_break_in)
    : null;
  const weeklyEarnings = Number(dashboard?.weekly_earnings) || 0;
  const weeklyHours = Number(dashboard?.weekly_hours) || 0;
  const todayHours = Number(dashboard?.today_hours) || 0;
  const todayIncome = Number(dashboard?.today_income) || 0;
  const hourlyRate = Number(user.rate_per_hr) || 0;
  const effectiveRate = hourlyRate || (todayHours > 0 ? todayIncome / todayHours : 0);
  const recentRecords: DashboardRecord[] = Array.isArray(dashboard?.past_three_days_records)
    ? dashboard.past_three_days_records
    : [];
  const chartData = dailySeries(records, 7);
  const firstName = user.f_name?.trim() || "there";

  const thresholdHours = Number(dashboard?.overtime_threshold_hrs) || 8;
  const otRate = Number(dashboard?.overtime_rate_per_hr) || hourlyRate;
  const activeStart = dashboard?.active_time_in
    ? new Date(dashboard.active_time_in).getTime()
    : null;
  const sessionBreaks = Number(dashboard?.session_break_minutes) || 0;
  const liveBreakMinutes = isOnBreak
    ? Math.max(0, dashboard?.break_elapsed_minutes || 0)
    : 0;
  const liveNetHours =
    isClockedIn && activeStart
      ? Math.max(
          0,
          (time.getTime() - activeStart) / 3_600_000 -
            (sessionBreaks + liveBreakMinutes) / 60
        )
      : todayHours;

  const nudges: { tone: "amber" | "primary"; text: string }[] = [];
  if (isClockedIn) {
    if (!isOnBreak && liveNetHours >= 2 && sessionBreaks === 0) {
      nudges.push({
        tone: "amber",
        text: "You've been working a while — take a short break to stay sharp.",
      });
    }
    const remaining = thresholdHours - liveNetHours;
    if (remaining > 0 && remaining <= 1) {
      nudges.push({
        tone: "amber",
        text: `Overtime in ${hours(remaining)} — plan your wrap-up.`,
      });
    } else if (remaining <= 0) {
      nudges.push({
        tone: "primary",
        text: `In overtime — extra hours paid at ₱${otRate.toFixed(2)}/hr.`,
      });
    }
  }

  if (loading && !dashboard) {
    return (
      <div className="space-y-5" aria-busy="true">
        <div className="skeleton h-20 w-full" />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="skeleton h-64 lg:col-span-2" />
          <div className="skeleton h-64" />
        </div>
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="skeleton h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow={greeting()}
        title={`${firstName}, let's make today count.`}
        description={todayLabel()}
        actions={
          <Link
            to="/insights"
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-card px-3.5 text-xs font-medium text-foreground transition-all duration-200 hover:border-primary/40 hover:text-primary"
          >
            <TrendingUp className="h-4 w-4" aria-hidden="true" />
            View insights
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        }
      />

      {hourlyRate === 0 && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-xs text-amber-800 dark:text-amber-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            Hourly rate isn't set yet.{" "}
            <Link to="/profile" className="font-semibold underline underline-offset-2">
              Set it in your profile
            </Link>{" "}
            to calculate earnings accurately.
          </span>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Clock card */}
        <section className="surface-card relative overflow-hidden p-5 sm:p-7 animate-enter lg:col-span-2">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-primary/[0.06] blur-2xl"
          />
          <div className="relative flex flex-wrap items-center justify-between gap-3">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                isClockedIn
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "bg-slate-500/10 text-slate-600 dark:text-slate-300"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${isClockedIn ? "bg-emerald-500" : "bg-slate-400"}`}
                aria-hidden="true"
              />
              {isClockedIn ? "Clocked in" : "Clocked out"}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              {time.toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>

          <div className="relative mt-7">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Current time
            </p>
            <p className="tabular mt-1 text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              {time.toLocaleTimeString()}
            </p>
            {activity?.time_in && (
              <p className="mt-2 text-xs text-muted-foreground">
                {isClockedIn
                  ? `Clocked in at ${formatTime(activity.time_in)}`
                  : `Last session: ${formatTime(activity.time_in)}${
                      activity.time_out ? ` – ${formatTime(activity.time_out)}` : ""
                    }`}
              </p>
            )}
            {isOnBreak && breakStartedAt && (
              <p className="mt-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                On break: {Math.max(0, dashboard?.break_elapsed_minutes || 0)} min
              </p>
            )}
          </div>

          {nudges.length > 0 && (
            <div className="relative mt-4 space-y-2">
              {nudges.map((nudge) => (
                <div
                  key={nudge.text}
                  className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs ${
                    nudge.tone === "amber"
                      ? "border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-200"
                      : "border-primary/20 bg-primary/5 text-primary"
                  }`}
                >
                  <Sparkles
                    className="mt-0.5 h-3.5 w-3.5 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{nudge.text}</span>
                </div>
              ))}
            </div>
          )}

          <div className="relative mt-7 grid gap-3 sm:grid-cols-2">
            {isClockedIn ? (
              <>
                <button
                  type="button"
                  onClick={() => handleBreak(isOnBreak ? "break-out" : "break-in")}
                  className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98] ${
                    isOnBreak
                      ? "bg-emerald-500 hover:bg-emerald-600"
                      : "bg-amber-500 hover:bg-amber-600"
                  }`}
                >
                  <Timer className="h-4 w-4" aria-hidden="true" />
                  {isOnBreak ? "End Break" : "Break"}
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleClock("time-out")}
                    className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-primary/40 bg-card px-3 text-sm font-semibold text-primary transition-all duration-200 hover:bg-primary/5 active:scale-[0.98]"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Time Out
                  </button>
                  <button
                    type="button"
                    onClick={() => openManual("time-out")}
                    aria-label="Record time out manually"
                    title="Record time out manually"
                    className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex gap-2 sm:col-span-2">
                <button
                  type="button"
                  onClick={() => handleClock("time-in")}
                  className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-hover hover:shadow-md active:scale-[0.98]"
                >
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                  Time In
                </button>
                <button
                  type="button"
                  onClick={() => openManual("time-in")}
                  aria-label="Record time in manually"
                  title="Record time in manually"
                  className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Today progress */}
        <SectionCard
          title="Today's progress"
          description="Your daily focus goal"
          className="animate-enter"
          bodyClassName="flex flex-col items-center justify-center gap-2 p-5"
        >
          <ProgressRing
            value={todayHours}
            max={8}
            label="of 8h goal"
            sublabel={todayHours >= 8 ? "Goal reached" : `${hours(8 - todayHours)} to go`}
          />
          <div className="grid w-full grid-cols-2 gap-2 pt-2 text-center">
            <div className="rounded-xl bg-secondary/70 py-2.5">
              <p className="tabular text-sm font-bold text-foreground">
                {currency(todayIncome)}
              </p>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Earned today
              </p>
            </div>
            <div className="rounded-xl bg-secondary/70 py-2.5">
              <p className="tabular text-sm font-bold text-foreground">
                {currency(hourlyRate)}/hr
              </p>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Your rate
              </p>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Stat cards */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="Today's hours"
          value={hours(todayHours)}
          hint={isClockedIn ? "Session in progress" : "Completed for today"}
          icon={Timer}
          tone="primary"
          index={0}
          loading={loading}
        />
        <StatCard
          label="Weekly hours"
          value={hours(weeklyHours)}
          hint="This calendar week"
          icon={Clock3}
          tone="sky"
          index={1}
          loading={loading}
        />
        <StatCard
          label="Today's earnings"
          value={currency(todayIncome)}
          hint="Estimated so far"
          icon={Wallet}
          tone="amber"
          index={2}
          loading={loading}
        />
        <StatCard
          label="Weekly earnings"
          value={currency(weeklyEarnings)}
          hint="This calendar week"
          icon={TrendingUp}
          tone="violet"
          index={3}
          loading={loading}
        />
      </div>

      {/* Charts + activity */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <SectionCard
          title="Hours this week"
          description="Daily worked hours over the last 7 days"
          className="lg:col-span-2"
          action={
            <Link
              to="/insights"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Full report
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          }
        >
          <HoursTrendChart data={chartData} />
        </SectionCard>

        <SectionCard title="Today's activity" description="Your latest session">
          {activity?.time_in ? (
            <ol className="space-y-4">
              <li className="flex gap-3">
                <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-foreground">Time in</p>
                  <p className="tabular text-sm text-muted-foreground">
                    {formatTime(activity.time_in)}
                  </p>
                </div>
                <Check className="ml-auto h-4 w-4 text-emerald-500" aria-hidden="true" />
              </li>
              <li className="flex gap-3">
                <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                  <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-foreground">Time out</p>
                  <p className="tabular text-sm text-muted-foreground">
                    {activity.time_out ? formatTime(activity.time_out) : "Still working"}
                  </p>
                </div>
              </li>
              <li className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-xs text-muted-foreground">Total worked</span>
                <span className="tabular text-sm font-semibold text-foreground">
                  {hours(activity.total_hrs || 0)}
                </span>
              </li>
            </ol>
          ) : (
            <div className="flex flex-col items-center py-8 text-center">
              <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                <Clock3 className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="text-sm font-medium text-foreground">No activity yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Clock in to start tracking your day.
              </p>
            </div>
          )}
        </SectionCard>
      </div>

      {/* Recent records */}
      <SectionCard
        title="Recent records"
        description="Your latest work sessions"
        className="mt-4"
        action={
          <Link
            to="/records"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            View all
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        }
        bodyClassName="divide-y divide-border px-4 sm:px-5"
      >
        {recentRecords.length ? (
          recentRecords.slice(0, 4).map((record) => {
            const workedHours = Number(record.total_hrs) || 0;
            const earned =
              Number(record.earnings) || Number((workedHours * effectiveRate).toFixed(2));
            return (
              <div
                key={record.id}
                className="flex items-center justify-between gap-3 py-3.5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {formatDate(record.time_in, "EEE, MMM d")}
                  </p>
                  <p className="tabular mt-0.5 text-xs text-muted-foreground">
                    {formatTime(record.time_in)} –{" "}
                    {record.time_out ? formatTime(record.time_out) : "Active"} ·{" "}
                    {hours(workedHours)}
                  </p>
                </div>
                <span className="tabular shrink-0 text-sm font-semibold text-primary">
                  {currency(earned)}
                </span>
              </div>
            );
          })
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No recent records to show.
          </p>
        )}
      </SectionCard>

      {/* Manual entry modal */}
      {showManual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={closeManual}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="manual-entry-title"
            className="surface-card animate-pop relative w-full max-w-md p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CalendarDays className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 id="manual-entry-title" className="text-lg font-bold text-foreground">
                  Add manual entry
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Record a missed punch, or describe a whole shift.
                </p>
              </div>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-secondary/70 p-1">
              {(["punch", "session"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setManualMode(mode)}
                  className={`min-h-9 rounded-lg text-xs font-semibold transition-colors ${
                    manualMode === mode
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {mode === "punch" ? "Single punch" : "Describe session"}
                </button>
              ))}
            </div>

            {manualMode === "punch" ? (
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="manual-punch"
                    className="mb-1.5 block text-xs font-medium text-foreground"
                  >
                    Manual {manualType === "time-in" ? "time in" : "time out"}
                  </label>
                  <div className="relative">
                    <textarea
                      id="manual-punch"
                      rows={2}
                      className="field-input resize-none pr-12"
                      value={punchText}
                      onChange={(event) => {
                        setPunchText(event.target.value);
                        setParsedPunch(null);
                      }}
                      placeholder='e.g. "8:30 AM last Tuesday" or "5:15 PM yesterday"'
                    />
                    <button
                      type="button"
                      onClick={() => toggleVoice("punch")}
                      disabled={!speechSupported}
                      aria-label={listening ? "Stop voice input" : "Start voice input"}
                      aria-pressed={listening}
                      title={
                        speechSupported
                          ? listening
                            ? "Stop listening"
                            : "Speak your time"
                          : "Voice input isn't supported in this browser"
                      }
                      className={`absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
                        listening
                          ? "animate-pulse bg-destructive/10 text-destructive"
                          : "bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-primary"
                      }`}
                    >
                      <Mic className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    Type it or tap the mic and say “8:30 AM last Tuesday”.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void handlePunchParse()}
                  disabled={parsingPunch}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 disabled:opacity-60"
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  {parsingPunch ? "Interpreting…" : "Interpret time"}
                </button>

                {parsedPunch && (
                  <div className="animate-enter space-y-3 rounded-xl border border-border bg-secondary/40 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] text-muted-foreground">Understood as</p>
                        <p className="text-sm font-semibold text-foreground">
                          {parsedPunch.interpreted}
                        </p>
                      </div>
                      <span className="tabular shrink-0 rounded-lg bg-card px-2.5 py-1.5 text-sm font-bold text-primary">
                        {parsedPunch.label}
                      </span>
                    </div>
                    {parsedPunch.warnings?.map((warning) => (
                      <div
                        key={warning.code}
                        className="flex items-start gap-2 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-800 dark:text-amber-200"
                      >
                        <AlertCircle
                          className="mt-0.5 h-3.5 w-3.5 shrink-0"
                          aria-hidden="true"
                        />
                        <span>{warning.message}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeManual}
                    className="min-h-11 flex-1 rounded-xl border border-border px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => void handlePunchSave()}
                    disabled={!parsedPunch}
                    className="min-h-11 flex-1 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Save record
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="manual-nl"
                    className="mb-1.5 block text-xs font-medium text-foreground"
                  >
                    Describe your shift
                  </label>
                  <div className="relative">
                    <textarea
                      id="manual-nl"
                      rows={3}
                      className="field-input resize-none pr-12"
                      value={nlText}
                      onChange={(event) => setNlText(event.target.value)}
                      placeholder='e.g. "worked 8:30 AM to 6:15 PM last Tuesday, 30m break"'
                    />
                    <button
                      type="button"
                      onClick={() => toggleVoice("session")}
                      disabled={!speechSupported}
                      aria-label={listening ? "Stop voice input" : "Start voice input"}
                      aria-pressed={listening}
                      title={
                        speechSupported
                          ? listening
                            ? "Stop listening"
                            : "Speak your shift"
                          : "Voice input isn't supported in this browser"
                      }
                      className={`absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
                        listening
                          ? "animate-pulse bg-destructive/10 text-destructive"
                          : "bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-primary"
                      }`}
                    >
                      <Mic className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    Type it or tap the mic and say “worked 8:30 AM to 6:15 PM last
                    Tuesday, 30 minute break”.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleParse()}
                  disabled={parsing}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 disabled:opacity-60"
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  {parsing ? "Interpreting…" : "Interpret shift"}
                </button>

                {parsed && sessionDraft && sessionPreview && (
                  <div className="animate-enter space-y-3 rounded-xl border border-border bg-secondary/40 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          Interpreted details
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          Edit any value to correct the interpretation.
                        </p>
                      </div>
                      {isDraftEdited && (
                        <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          Recalculated
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-1 block text-[11px] font-medium text-muted-foreground">
                          Time in
                        </span>
                        <input
                          type="datetime-local"
                          value={sessionDraft.timeIn}
                          onChange={(event) =>
                            setSessionDraft((current) =>
                              current ? { ...current, timeIn: event.target.value } : current
                            )
                          }
                          className="tabular min-h-10 w-full rounded-lg border border-border bg-card px-2.5 text-xs text-foreground outline-none transition-colors focus:border-primary"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-[11px] font-medium text-muted-foreground">
                          Time out
                        </span>
                        <input
                          type="datetime-local"
                          value={sessionDraft.timeOut}
                          onChange={(event) =>
                            setSessionDraft((current) =>
                              current ? { ...current, timeOut: event.target.value } : current
                            )
                          }
                          className="tabular min-h-10 w-full rounded-lg border border-border bg-card px-2.5 text-xs text-foreground outline-none transition-colors focus:border-primary"
                        />
                      </label>
                    </div>

                    <label className="block sm:max-w-[10rem]">
                      <span className="mb-1 block text-[11px] font-medium text-muted-foreground">
                        Break (minutes)
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={sessionDraft.breakMinutes}
                        onChange={(event) =>
                          setSessionDraft((current) =>
                            current
                              ? { ...current, breakMinutes: event.target.value }
                              : current
                          )
                        }
                        className="tabular min-h-10 w-full rounded-lg border border-border bg-card px-2.5 text-xs text-foreground outline-none transition-colors focus:border-primary"
                      />
                    </label>

                    <p className="text-[11px] text-muted-foreground">
                      {draftSummary(sessionDraft)}
                    </p>

                    {!sessionDraftValid && (
                      <p className="flex items-start gap-1.5 rounded-lg border border-destructive/25 bg-destructive/10 px-2.5 py-2 text-[11px] text-destructive">
                        <AlertCircle
                          className="mt-0.5 h-3.5 w-3.5 shrink-0"
                          aria-hidden="true"
                        />
                        Time out must be after time in.
                      </p>
                    )}

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg bg-card px-2 py-2.5">
                        <p className="tabular text-sm font-bold text-foreground">
                          {hours(sessionPreview.net_hrs)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Net</p>
                      </div>
                      <div className="rounded-lg bg-card px-2 py-2.5">
                        <p className="tabular text-sm font-bold text-amber-600 dark:text-amber-400">
                          {hours(sessionPreview.overtime_hrs)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Overtime</p>
                      </div>
                      <div className="rounded-lg bg-card px-2 py-2.5">
                        <p className="tabular text-sm font-bold text-primary">
                          {currency(sessionPreview.total_earnings)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Pay</p>
                      </div>
                    </div>
                    {Number(sessionPreview.overtime_hrs) > 0 && (
                      <p className="text-[11px] text-muted-foreground">
                        Overtime paid at ₱{sessionPreview.overtime_rate_per_hr}/hr
                      </p>
                    )}
                    {parsed.warnings?.map((warning) => (
                      <div
                        key={warning.code}
                        className="flex items-start gap-2 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-800 dark:text-amber-200"
                      >
                        <AlertCircle
                          className="mt-0.5 h-3.5 w-3.5 shrink-0"
                          aria-hidden="true"
                        />
                        <span>{warning.message}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeManual}
                    className="min-h-11 flex-1 rounded-xl border border-border px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleSessionSave()}
                    disabled={!parsed || !sessionDraftValid}
                    className="min-h-11 flex-1 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Save session
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
