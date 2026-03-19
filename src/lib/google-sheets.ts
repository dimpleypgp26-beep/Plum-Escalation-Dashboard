// ── Google Sheets Integration ──
// Fetches live data from a published Google Sheet (CSV format)
// Setup: Google Sheets → File → Share → Publish to web → CSV

import type { Escalation } from "./data";

const SHEET_URL = process.env.NEXT_PUBLIC_GOOGLE_SHEET_CSV_URL || "";

// Cache: refetch every 60 seconds max
let cachedData: Escalation[] | null = null;
let lastFetch = 0;
const CACHE_TTL = 60 * 1000; // 60 seconds

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

function csvToEscalations(csv: string): Escalation[] {
  const lines = csv.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const escalations: Escalation[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < headers.length - 1) continue;

    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || "";
    });

    try {
      escalations.push({
        id: row["ID"] || `ESC-${String(i).padStart(4, "0")}`,
        title: row["Title"] || "",
        summary: row["Summary"] || "",
        accountName: row["Account Name"] || "Unknown",
        accountSize: (row["Account Size"] as Escalation["accountSize"]) || "SME",
        category: row["Category"] as Escalation["category"],
        source: (row["Source"] as Escalation["source"]) || "Email",
        priority: (row["Priority"] as Escalation["priority"]) || "Medium",
        priorityScore: parseInt(row["Priority Score"]) || 50,
        status: (row["Status"] as Escalation["status"]) || "Open",
        owner: row["Owner"] || "Unassigned",
        actionNeeded: (row["Action Needed"] as Escalation["actionNeeded"]) || "Follow-up",
        createdAt: row["Created At"] || new Date().toISOString(),
        updatedAt: row["Updated At"] || new Date().toISOString(),
        slaDeadline: row["SLA Deadline"] || new Date().toISOString(),
        responseTime: row["Response Time (hrs)"] ? parseFloat(row["Response Time (hrs)"]) : null,
        resolutionTime: row["Resolution Time (hrs)"] ? parseFloat(row["Resolution Time (hrs)"]) : null,
        isBreachingSLA: row["SLA Breached"] === "true",
        senderName: row["Sender Name"] || "Unknown",
        senderEmail: row["Sender Email"] || "",
        rawMessage: row["Raw Message"] || row["Summary"] || "",
      });
    } catch {
      console.warn(`Skipping row ${i}: parse error`);
    }
  }

  return escalations;
}

export async function fetchFromGoogleSheets(): Promise<Escalation[] | null> {
  if (!SHEET_URL) return null;

  const now = Date.now();
  if (cachedData && now - lastFetch < CACHE_TTL) {
    return cachedData;
  }

  try {
    const res = await fetch(SHEET_URL, {
      next: { revalidate: 60 },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Google Sheets fetch failed:", res.status);
      return cachedData;
    }

    const csv = await res.text();
    cachedData = csvToEscalations(csv);
    lastFetch = now;

    console.log(`Fetched ${cachedData.length} escalations from Google Sheets`);
    return cachedData;
  } catch (error) {
    console.error("Google Sheets fetch error:", error);
    return cachedData;
  }
}

export function isGoogleSheetsConfigured(): boolean {
  return !!SHEET_URL;
}
