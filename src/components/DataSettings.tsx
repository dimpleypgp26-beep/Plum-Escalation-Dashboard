"use client";

import { useState, useRef, useCallback } from "react";
import type { Escalation } from "@/lib/data";

interface DataSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onDataLoaded: (data: Escalation[], source: string) => void;
  onResetToDemo: () => void;
  currentSource: string;
  currentRowCount: number;
}

const ESCALATION_FIELDS: (keyof Escalation)[] = [
  "id", "title", "summary", "accountName", "accountSize", "category", "source",
  "priority", "priorityScore", "status", "owner", "actionNeeded", "createdAt",
  "updatedAt", "slaDeadline", "responseTime", "resolutionTime", "isBreachingSLA",
  "rawMessage", "senderName", "senderEmail",
];

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
  }
  result.push(current.trim());
  return result;
}

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = parseCSVLine(lines[0]);
  const rows = lines.slice(1).map(parseCSVLine);
  return { headers, rows };
}

function mapRowToEscalation(
  row: string[],
  headers: string[],
  mapping: Record<string, number>
): Escalation {
  const get = (field: string): string => {
    const idx = mapping[field];
    if (idx === undefined || idx < 0) return "";
    return row[idx] || "";
  };

  const priorityScore = parseInt(get("priorityScore"), 10);
  const responseTime = get("responseTime") ? parseFloat(get("responseTime")) : null;
  const resolutionTime = get("resolutionTime") ? parseFloat(get("resolutionTime")) : null;
  const isBreachingSLA =
    get("isBreachingSLA").toLowerCase() === "true" ||
    get("isBreachingSLA") === "1" ||
    get("isBreachingSLA").toLowerCase() === "yes";

  return {
    id: get("id") || `ESC-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    title: get("title") || "Untitled",
    summary: get("summary") || "",
    accountName: get("accountName") || "Unknown",
    accountSize: (get("accountSize") as Escalation["accountSize"]) || "SME",
    category: (get("category") as Escalation["category"]) || "General Inquiry",
    source: (get("source") as Escalation["source"]) || "Email",
    priority: (get("priority") as Escalation["priority"]) || "Medium",
    priorityScore: isNaN(priorityScore) ? 50 : priorityScore,
    status: (get("status") as Escalation["status"]) || "Open",
    owner: get("owner") || "Unassigned",
    actionNeeded: (get("actionNeeded") as Escalation["actionNeeded"]) || "Follow-up",
    createdAt: get("createdAt") || new Date().toISOString(),
    updatedAt: get("updatedAt") || new Date().toISOString(),
    slaDeadline: get("slaDeadline") || new Date(Date.now() + 7 * 86400000).toISOString(),
    responseTime,
    resolutionTime,
    isBreachingSLA,
    rawMessage: get("rawMessage") || "",
    senderName: get("senderName") || "",
    senderEmail: get("senderEmail") || "",
  };
}

function autoMapHeaders(csvHeaders: string[]): Record<string, number> {
  const mapping: Record<string, number> = {};
  const lowerHeaders = csvHeaders.map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ""));

  ESCALATION_FIELDS.forEach((field) => {
    const fieldLower = field.toLowerCase();
    // Exact match
    let idx = lowerHeaders.indexOf(fieldLower);
    if (idx >= 0) {
      mapping[field] = idx;
      return;
    }
    // Partial match
    idx = lowerHeaders.findIndex(
      (h) => h.includes(fieldLower) || fieldLower.includes(h)
    );
    if (idx >= 0) {
      mapping[field] = idx;
      return;
    }
    // Common aliases
    const aliases: Record<string, string[]> = {
      accountName: ["account", "company", "client", "accountname"],
      accountSize: ["size", "tier", "accountsize"],
      priorityScore: ["score", "priorityscore"],
      actionNeeded: ["action", "actionneeded"],
      createdAt: ["created", "createdat", "date", "createdon"],
      updatedAt: ["updated", "updatedat", "modifiedat"],
      slaDeadline: ["sla", "deadline", "sladeadline", "duedate"],
      responseTime: ["response", "responsetime", "firstresponse"],
      resolutionTime: ["resolution", "resolutiontime"],
      isBreachingSLA: ["breaching", "breach", "slabreached", "isbreachingsla"],
      rawMessage: ["message", "rawmessage", "body", "content"],
      senderName: ["sender", "sendername", "from", "fromname"],
      senderEmail: ["email", "senderemail", "fromemail"],
    };
    const fieldAliases = aliases[field] || [];
    for (const alias of fieldAliases) {
      idx = lowerHeaders.findIndex((h) => h.includes(alias));
      if (idx >= 0) {
        mapping[field] = idx;
        return;
      }
    }
    mapping[field] = -1;
  });

  return mapping;
}

export default function DataSettings({
  isOpen,
  onClose,
  onDataLoaded,
  onResetToDemo,
  currentSource,
  currentRowCount,
}: DataSettingsProps) {
  const [activeTab, setActiveTab] = useState<"csv" | "sheets">("csv");
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<string, number>>({});
  const [previewReady, setPreviewReady] = useState(false);
  const [sheetsUrl, setSheetsUrl] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("plum_sheets_url") || "";
    }
    return "";
  });
  const [sheetsLoading, setSheetsLoading] = useState(false);
  const [sheetsError, setSheetsError] = useState("");
  const [csvError, setCsvError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("plum_data_updated") || "";
    }
    return "";
  });
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setCsvError("");
      setPreviewReady(false);

      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        const { headers, rows } = parseCSV(text);
        if (headers.length === 0 || rows.length === 0) {
          setCsvError("CSV file appears empty or has no data rows.");
          return;
        }
        setCsvHeaders(headers);
        setCsvRows(rows);
        setMapping(autoMapHeaders(headers));
        setPreviewReady(true);
      };
      reader.readAsText(file);
    },
    []
  );

  const handleConfirmCSV = useCallback(() => {
    try {
      const escalations = csvRows.map((row) =>
        mapRowToEscalation(row, csvHeaders, mapping)
      );
      const now = new Date().toLocaleString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
      localStorage.setItem("plum_csv_data", JSON.stringify(escalations));
      localStorage.setItem("plum_data_source", "csv_upload");
      localStorage.setItem("plum_data_updated", now);
      localStorage.removeItem("plum_sheets_url");
      setLastUpdated(now);
      onDataLoaded(escalations, "csv_upload");
      setPreviewReady(false);
      setCsvHeaders([]);
      setCsvRows([]);
      onClose();
    } catch (err) {
      setCsvError(`Error parsing CSV: ${err}`);
    }
  }, [csvRows, csvHeaders, mapping, onDataLoaded, onClose]);

  const handleSheetsLoad = useCallback(async () => {
    if (!sheetsUrl.trim()) {
      setSheetsError("Please enter a Google Sheets CSV URL.");
      return;
    }
    setSheetsLoading(true);
    setSheetsError("");

    try {
      const res = await fetch(sheetsUrl.trim());
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const text = await res.text();
      const { headers, rows } = parseCSV(text);
      if (headers.length === 0 || rows.length === 0) {
        throw new Error("Fetched data appears empty.");
      }
      const autoMapping = autoMapHeaders(headers);
      const escalations = rows.map((row) =>
        mapRowToEscalation(row, headers, autoMapping)
      );
      const now = new Date().toLocaleString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
      localStorage.setItem("plum_csv_data", JSON.stringify(escalations));
      localStorage.setItem("plum_data_source", "google_sheets_csv");
      localStorage.setItem("plum_sheets_url", sheetsUrl.trim());
      localStorage.setItem("plum_data_updated", now);
      setLastUpdated(now);
      onDataLoaded(escalations, "google_sheets_csv");
      onClose();
    } catch (err) {
      setSheetsError(`Error: ${err instanceof Error ? err.message : err}`);
    } finally {
      setSheetsLoading(false);
    }
  }, [sheetsUrl, onDataLoaded, onClose]);

  const handleReset = useCallback(() => {
    localStorage.removeItem("plum_csv_data");
    localStorage.removeItem("plum_data_source");
    localStorage.removeItem("plum_sheets_url");
    localStorage.removeItem("plum_data_updated");
    setLastUpdated("");
    setSheetsUrl("");
    setPreviewReady(false);
    setCsvHeaders([]);
    setCsvRows([]);
    onResetToDemo();
    onClose();
  }, [onResetToDemo, onClose]);

  const updateMapping = (field: string, idx: number) => {
    setMapping((prev) => ({ ...prev, [field]: idx }));
  };

  if (!isOpen) return null;

  const sourceLabel =
    currentSource === "csv_upload"
      ? "CSV Upload"
      : currentSource === "google_sheets_csv"
      ? "Google Sheets CSV"
      : currentSource === "google_sheets"
      ? "Google Sheets (API)"
      : "Demo Data";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b px-6 py-4"
          style={{ borderColor: "var(--plum-border)" }}
        >
          <div>
            <h2 className="text-lg font-bold" style={{ color: "var(--plum-text)" }}>
              Data Settings
            </h2>
            <p className="text-xs text-gray-400">
              Upload CSV or connect Google Sheets
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl text-gray-400 hover:text-gray-600"
          >
            &times;
          </button>
        </div>

        {/* Data Info */}
        <div
          className="mx-6 mt-4 rounded-lg p-4"
          style={{ backgroundColor: "var(--plum-lighter)", border: "1px solid var(--plum-border)" }}
        >
          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <div>
              <p className="text-xs text-gray-400">Data Source</p>
              <p className="font-medium" style={{ color: "var(--plum-text)" }}>
                {sourceLabel}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Rows</p>
              <p className="font-medium" style={{ color: "var(--plum-text)" }}>
                {currentRowCount}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Last Updated</p>
              <p className="font-medium" style={{ color: "var(--plum-text)" }}>
                {lastUpdated || "N/A"}
              </p>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleReset}
                className="rounded-lg border px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                style={{ borderColor: "var(--plum-border)" }}
              >
                Reset to Demo Data
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mx-6 mt-4 flex gap-4 border-b" style={{ borderColor: "var(--plum-border)" }}>
          <button
            onClick={() => setActiveTab("csv")}
            className={`border-b-2 pb-2 text-sm font-medium transition-colors ${
              activeTab === "csv"
                ? "text-[#5E35B1]"
                : "border-transparent text-gray-500 hover:text-[#5E35B1]/70"
            }`}
            style={activeTab === "csv" ? { borderColor: "#5E35B1" } : undefined}
          >
            CSV Upload
          </button>
          <button
            onClick={() => setActiveTab("sheets")}
            className={`border-b-2 pb-2 text-sm font-medium transition-colors ${
              activeTab === "sheets"
                ? "text-[#5E35B1]"
                : "border-transparent text-gray-500 hover:text-[#5E35B1]/70"
            }`}
            style={activeTab === "sheets" ? { borderColor: "#5E35B1" } : undefined}
          >
            Google Sheets
          </button>
        </div>

        <div className="p-6">
          {/* CSV Upload Tab */}
          {activeTab === "csv" && (
            <div className="space-y-4">
              <div
                className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors hover:border-[#5E35B1]/50"
                style={{ borderColor: "var(--plum-border)" }}
              >
                <svg
                  className="h-10 w-10 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-500">
                  Upload a CSV file with escalation data
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="mt-3 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
                  style={{ backgroundColor: "#5E35B1" }}
                >
                  Choose CSV File
                </button>
              </div>

              {csvError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {csvError}
                </div>
              )}

              {previewReady && (
                <div className="space-y-4">
                  {/* Column Mapping */}
                  <div>
                    <h4 className="text-sm font-semibold" style={{ color: "var(--plum-text)" }}>
                      Column Mapping
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">
                      Auto-mapped columns are shown below. Adjust if needed.
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">
                      {ESCALATION_FIELDS.map((field) => (
                        <div key={field} className="flex items-center gap-2">
                          <label className="text-xs text-gray-500 w-28 truncate" title={field}>
                            {field}
                          </label>
                          <select
                            value={mapping[field] ?? -1}
                            onChange={(e) => updateMapping(field, parseInt(e.target.value, 10))}
                            className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs"
                          >
                            <option value={-1}>-- skip --</option>
                            {csvHeaders.map((h, i) => (
                              <option key={i} value={i}>
                                {h}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Preview */}
                  <div>
                    <h4 className="text-sm font-semibold" style={{ color: "var(--plum-text)" }}>
                      Preview (first 5 rows)
                    </h4>
                    <div className="mt-2 overflow-x-auto rounded-lg border" style={{ borderColor: "var(--plum-border)" }}>
                      <table className="min-w-full text-xs">
                        <thead className="bg-gray-50">
                          <tr>
                            {csvHeaders.map((h, i) => (
                              <th key={i} className="px-3 py-2 text-left font-medium text-gray-500 whitespace-nowrap">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {csvRows.slice(0, 5).map((row, ri) => (
                            <tr key={ri}>
                              {row.map((cell, ci) => (
                                <td key={ci} className="px-3 py-2 text-gray-600 max-w-[150px] truncate whitespace-nowrap">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-2 text-xs text-gray-400">
                      {csvRows.length} rows found in CSV
                    </p>
                  </div>

                  <button
                    onClick={handleConfirmCSV}
                    className="w-full rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90"
                    style={{ backgroundColor: "#5E35B1" }}
                  >
                    Confirm & Load {csvRows.length} Rows
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Google Sheets Tab */}
          {activeTab === "sheets" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium" style={{ color: "var(--plum-text)" }}>
                  Published Google Sheets CSV URL
                </label>
                <p className="text-xs text-gray-400 mt-1">
                  In Google Sheets: File &rarr; Share &rarr; Publish to web &rarr;
                  Select &quot;Comma-separated values (.csv)&quot; &rarr; Copy the link
                </p>
                <input
                  type="url"
                  value={sheetsUrl}
                  onChange={(e) => setSheetsUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?output=csv"
                  className="mt-2 w-full rounded-lg border px-3 py-2 text-sm focus:border-[#5E35B1] focus:outline-none focus:ring-1 focus:ring-[#5E35B1]"
                  style={{ borderColor: "var(--plum-border)" }}
                />
              </div>

              {sheetsError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {sheetsError}
                </div>
              )}

              <button
                onClick={handleSheetsLoad}
                disabled={sheetsLoading}
                className="w-full rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "#5E35B1" }}
              >
                {sheetsLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Fetching from Google Sheets...
                  </span>
                ) : (
                  "Fetch & Load Data"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
