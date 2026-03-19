import { NextResponse } from "next/server";
import { fetchFromGoogleSheets, isGoogleSheetsConfigured } from "@/lib/google-sheets";
import { escalations as fallbackData } from "@/lib/data";

// GET /api/sheets - Fetch escalations from Google Sheets (with fallback to local data)
export async function GET() {
  const isConfigured = isGoogleSheetsConfigured();

  if (isConfigured) {
    const sheetData = await fetchFromGoogleSheets();
    if (sheetData && sheetData.length > 0) {
      return NextResponse.json({
        source: "google_sheets",
        count: sheetData.length,
        lastFetch: new Date().toISOString(),
        escalations: sheetData,
      });
    }
  }

  // Fallback to local data
  return NextResponse.json({
    source: "local_data",
    count: fallbackData.length,
    note: isConfigured
      ? "Google Sheets configured but fetch failed, using local fallback"
      : "Set NEXT_PUBLIC_GOOGLE_SHEET_CSV_URL env variable to connect Google Sheets",
    escalations: fallbackData,
  });
}
