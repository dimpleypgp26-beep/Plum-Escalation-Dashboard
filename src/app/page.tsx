"use client";

import { useState, useEffect, useCallback } from "react";
import { escalations as localEscalations } from "@/lib/data";
import type { Escalation } from "@/lib/data";
import MetricCard from "@/components/MetricCard";
import EscalationTable from "@/components/EscalationTable";
import SubmitEscalation from "@/components/SubmitEscalation";
import {
  StatusPieChart,
  PriorityBarChart,
  CategoryBarChart,
  SourcePieChart,
  TrendLineChart,
  OwnerWorkloadChart,
  SLAComplianceChart,
} from "@/components/Charts";

export default function Dashboard() {
  const [tab, setTab] = useState<"overview" | "escalations" | "automation" | "analytics">("overview");
  const [data, setData] = useState<Escalation[]>(localEscalations);
  const [dataSource, setDataSource] = useState<string>("local_data");
  const [lastSync, setLastSync] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/sheets");
      const json = await res.json();
      if (json.escalations && json.escalations.length > 0) {
        setData(json.escalations);
        setDataSource(json.source);
      }
    } catch {
      // Keep using local data on error
      setDataSource("local_data");
    } finally {
      setLoading(false);
      setLastSync(
        new Date().toLocaleString("en-IN", {
          day: "numeric", month: "short", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        })
      );
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Metrics
  const total = data.length;
  const open = data.filter((e) => e.status === "Open").length;
  const inProgress = data.filter((e) => e.status === "In Progress").length;
  const blocked = data.filter((e) => e.status === "Blocked").length;
  const closed = data.filter((e) => e.status === "Closed").length;
  const critical = data.filter((e) => e.priority === "Critical" && e.status !== "Closed").length;
  const slaBreached = data.filter((e) => e.isBreachingSLA && e.status !== "Closed").length;
  const withResponse = data.filter((e) => e.responseTime);
  const avgResponseTime = withResponse.length > 0
    ? Math.round(withResponse.reduce((sum, e) => sum + (e.responseTime || 0), 0) / withResponse.length)
    : 0;
  const withResolution = data.filter((e) => e.resolutionTime);
  const avgResolutionDays = withResolution.length > 0
    ? Math.round(withResolution.reduce((sum, e) => sum + (e.resolutionTime || 0), 0) / withResolution.length / 24)
    : 0;

  // Top escalations (critical + high, not closed, sorted by priority score)
  const topEscalations = data
    .filter((e) => e.status !== "Closed" && (e.priority === "Critical" || e.priority === "High"))
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 5);

  const activeCount = total - closed;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-lg font-bold text-white">P</div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Plum Escalation Dashboard</h1>
              <p className="text-xs text-gray-400">AI-Powered Escalation Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs ${
              dataSource === "google_sheets"
                ? "bg-green-50 text-green-700"
                : "bg-yellow-50 text-yellow-700"
            }`}>
              <span className={`h-2 w-2 rounded-full ${
                dataSource === "google_sheets" ? "bg-green-500 animate-pulse" : "bg-yellow-500"
              }`}></span>
              {dataSource === "google_sheets" ? "Google Sheets Live" : "Local Data"}
            </div>
            <div className="text-right text-xs text-gray-400">
              <div>{total} escalations tracked</div>
              <div>{lastSync || "Loading..."}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <nav className="flex gap-6">
            {(["overview", "escalations", "automation", "analytics"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`border-b-2 px-1 py-3 text-sm font-medium capitalize transition-colors ${
                  tab === t ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {t}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-6">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <svg className="mx-auto h-8 w-8 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="mt-2 text-sm text-gray-500">Loading escalation data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* ── OVERVIEW TAB ── */}
            {tab === "overview" && (
              <div className="space-y-6">
                {/* Metric Cards */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
                  <MetricCard
                    label="Total Escalations"
                    value={total}
                    subtitle={`${closed} resolved`}
                    icon={<svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                  />
                  <MetricCard
                    label="Open"
                    value={open}
                    subtitle={`${inProgress} in progress`}
                    icon={<svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  />
                  <MetricCard
                    label="Critical"
                    value={critical}
                    color="bg-red-50"
                    subtitle="Needs immediate action"
                    icon={<svg className="h-8 w-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                  />
                  <MetricCard
                    label="SLA Breached"
                    value={slaBreached}
                    color="bg-orange-50"
                    subtitle={activeCount > 0 ? `${Math.round((slaBreached / activeCount) * 100)}% of active` : "0%"}
                    icon={<svg className="h-8 w-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  />
                  <MetricCard
                    label="Blocked"
                    value={blocked}
                    subtitle="Needs unblocking"
                    icon={<svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>}
                  />
                </div>

                {/* TAT Summary */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-700">Turnaround Time</h3>
                    <div className="mt-4 grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-3xl font-bold text-indigo-600">{avgResponseTime}h</p>
                        <p className="text-sm text-gray-400">Avg First Response</p>
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-indigo-600">{avgResolutionDays}d</p>
                        <p className="text-sm text-gray-400">Avg Resolution</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-700">Quick Stats</h3>
                    <div className="mt-4 grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-3xl font-bold text-green-600">{total > 0 ? Math.round((closed / total) * 100) : 0}%</p>
                        <p className="text-sm text-gray-400">Resolution Rate</p>
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-purple-600">{total > 0 ? Math.round(((total - open) / total) * 100) : 0}%</p>
                        <p className="text-sm text-gray-400">Ownership Assigned</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Escalations */}
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-4 text-sm font-semibold text-gray-700">Top Escalations - Daily Shortlist</h3>
                  <div className="space-y-3">
                    {topEscalations.length === 0 && (
                      <p className="text-sm text-gray-400 py-4 text-center">No critical or high priority open escalations</p>
                    )}
                    {topEscalations.map((e) => (
                      <div key={e.id} className={`flex items-center gap-4 rounded-lg border p-4 ${e.isBreachingSLA ? "border-red-200 bg-red-50/50" : "border-gray-100"}`}>
                        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${e.priority === "Critical" ? "bg-red-500" : "bg-orange-500"}`}>
                          {e.priorityScore}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-medium">{e.title}</span>
                            {e.isBreachingSLA && (
                              <span className="flex-shrink-0 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">SLA BREACHED</span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-gray-500">{e.accountName} &middot; {e.category} &middot; {e.source}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-medium text-gray-700">{e.owner}</p>
                          <p className="text-xs text-gray-400">{e.actionNeeded}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <StatusPieChart data={data} />
                  <PriorityBarChart data={data} />
                </div>
              </div>
            )}

            {/* ── ESCALATIONS TAB ── */}
            {tab === "escalations" && <EscalationTable data={data} />}

            {/* ── AUTOMATION TAB ── */}
            {tab === "automation" && <SubmitEscalation />}

            {/* ── ANALYTICS TAB ── */}
            {tab === "analytics" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <TrendLineChart data={data} />
                  <SLAComplianceChart data={data} />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <CategoryBarChart data={data} />
                  <OwnerWorkloadChart data={data} />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <SourcePieChart data={data} />
                  <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-3 text-sm font-semibold text-gray-700">Account Size Distribution</h3>
                    <div className="space-y-3 mt-4">
                      {(["Enterprise", "Mid-Market", "SME", "Startup"] as const).map((size) => {
                        const count = data.filter((e) => e.accountSize === size).length;
                        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                        return (
                          <div key={size}>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">{size}</span>
                              <span className="font-medium">{count} ({pct}%)</span>
                            </div>
                            <div className="mt-1 h-2 rounded-full bg-gray-100">
                              <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-4 text-center text-xs text-gray-400">
        Plum Escalation Management System &middot; AI-Powered Automation &middot; Data: {dataSource === "google_sheets" ? "Google Sheets (Live)" : "Local Dataset"} &middot; Auto-refreshes every 60s
      </footer>
    </div>
  );
}
