"use client";

import { useState, useMemo } from "react";
import type { Escalation } from "@/lib/data";

interface AccountMetrics {
  accountName: string;
  accountSize: string;
  healthScore: number;
  totalEscalations: number;
  openCount: number;
  closedCount: number;
  inProgressCount: number;
  blockedCount: number;
  slaBreachCount: number;
  criticalHighPct: number;
  avgResolutionTime: number | null;
  riskLevel: "Healthy" | "At Risk" | "Critical";
  escalations: Escalation[];
}

function calculateHealthScore(escalations: Escalation[]): number {
  if (escalations.length === 0) return 100;

  let score = 100;

  // Factor 1: Open escalations (max -30)
  const openCount = escalations.filter((e) => e.status !== "Closed").length;
  const openPenalty = Math.min(30, openCount * 6);
  score -= openPenalty;

  // Factor 2: SLA breaches (max -25)
  const slaBreaches = escalations.filter(
    (e) => e.isBreachingSLA && e.status !== "Closed"
  ).length;
  const slaPenalty = Math.min(25, slaBreaches * 8);
  score -= slaPenalty;

  // Factor 3: Average resolution time (max -20)
  const resolved = escalations.filter((e) => e.resolutionTime !== null);
  if (resolved.length > 0) {
    const avgResHours =
      resolved.reduce((sum, e) => sum + (e.resolutionTime || 0), 0) /
      resolved.length;
    const avgResDays = avgResHours / 24;
    // Penalty increases with resolution time; >7 days is worst
    const resPenalty = Math.min(20, Math.round((avgResDays / 7) * 20));
    score -= resPenalty;
  }

  // Factor 4: % critical/high priority (max -15)
  const criticalHigh = escalations.filter(
    (e) =>
      (e.priority === "Critical" || e.priority === "High") &&
      e.status !== "Closed"
  ).length;
  const active = escalations.filter((e) => e.status !== "Closed").length;
  if (active > 0) {
    const critPct = criticalHigh / active;
    const critPenalty = Math.min(15, Math.round(critPct * 15));
    score -= critPenalty;
  }

  // Factor 5: Blocked issues (max -10)
  const blocked = escalations.filter((e) => e.status === "Blocked").length;
  const blockedPenalty = Math.min(10, blocked * 5);
  score -= blockedPenalty;

  return Math.max(0, Math.min(100, score));
}

function getRiskLevel(score: number): "Healthy" | "At Risk" | "Critical" {
  if (score > 70) return "Healthy";
  if (score >= 40) return "At Risk";
  return "Critical";
}

function getHealthColor(score: number): string {
  if (score > 70) return "#26A69A";
  if (score >= 40) return "#F57C00";
  return "#E91E63";
}

function getRiskBadgeClass(risk: "Healthy" | "At Risk" | "Critical"): string {
  if (risk === "Healthy") return "bg-[#E0F2F1] text-[#26A69A]";
  if (risk === "At Risk") return "bg-[#FFF3E0] text-[#F57C00]";
  return "bg-[#FCE4EC] text-[#E91E63]";
}

const priorityColors: Record<string, string> = {
  Critical: "bg-[#FCE4EC] text-[#E91E63]",
  High: "bg-[#FFF3E0] text-[#F57C00]",
  Medium: "bg-[#FFF8E1] text-[#F9A825]",
  Low: "bg-[#E8F5E9] text-[#66BB6A]",
};

const statusColors: Record<string, string> = {
  Open: "bg-[#EDE7F6] text-[#5E35B1]",
  "In Progress": "bg-[#E8EAF6] text-[#7C4DFF]",
  Blocked: "bg-[#FCE4EC] text-[#E91E63]",
  Closed: "bg-gray-100 text-gray-500",
};

export default function AccountHealth({ data }: { data: Escalation[] }) {
  const [expandedAccount, setExpandedAccount] = useState<string | null>(null);
  const [sortField, setSortField] = useState<"healthScore" | "totalEscalations" | "accountName">("healthScore");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const accountMetrics: AccountMetrics[] = useMemo(() => {
    const grouped: Record<string, Escalation[]> = {};
    data.forEach((e) => {
      if (!grouped[e.accountName]) grouped[e.accountName] = [];
      grouped[e.accountName].push(e);
    });

    return Object.entries(grouped).map(([accountName, escalations]) => {
      const healthScore = calculateHealthScore(escalations);
      const openCount = escalations.filter((e) => e.status === "Open").length;
      const closedCount = escalations.filter((e) => e.status === "Closed").length;
      const inProgressCount = escalations.filter((e) => e.status === "In Progress").length;
      const blockedCount = escalations.filter((e) => e.status === "Blocked").length;
      const slaBreachCount = escalations.filter(
        (e) => e.isBreachingSLA && e.status !== "Closed"
      ).length;
      const active = escalations.filter((e) => e.status !== "Closed").length;
      const criticalHigh = escalations.filter(
        (e) =>
          (e.priority === "Critical" || e.priority === "High") &&
          e.status !== "Closed"
      ).length;
      const criticalHighPct = active > 0 ? Math.round((criticalHigh / active) * 100) : 0;
      const resolved = escalations.filter((e) => e.resolutionTime !== null);
      const avgResolutionTime =
        resolved.length > 0
          ? Math.round(
              resolved.reduce((sum, e) => sum + (e.resolutionTime || 0), 0) /
                resolved.length
            )
          : null;

      return {
        accountName,
        accountSize: escalations[0].accountSize,
        healthScore,
        totalEscalations: escalations.length,
        openCount,
        closedCount,
        inProgressCount,
        blockedCount,
        slaBreachCount,
        criticalHighPct,
        avgResolutionTime,
        riskLevel: getRiskLevel(healthScore),
        escalations,
      };
    });
  }, [data]);

  const sorted = useMemo(() => {
    return [...accountMetrics].sort((a, b) => {
      let cmp = 0;
      if (sortField === "healthScore") cmp = a.healthScore - b.healthScore;
      else if (sortField === "totalEscalations") cmp = a.totalEscalations - b.totalEscalations;
      else cmp = a.accountName.localeCompare(b.accountName);
      return sortDir === "desc" ? -cmp : cmp;
    });
  }, [accountMetrics, sortField, sortDir]);

  const totalAccounts = accountMetrics.length;
  const healthyCount = accountMetrics.filter((a) => a.riskLevel === "Healthy").length;
  const atRiskCount = accountMetrics.filter((a) => a.riskLevel === "At Risk").length;
  const criticalCount = accountMetrics.filter((a) => a.riskLevel === "Critical").length;

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir(field === "healthScore" ? "asc" : "desc");
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div
          className="rounded-xl bg-white p-5 shadow-sm"
          style={{ border: "1px solid var(--plum-border)" }}
        >
          <p className="text-sm font-medium" style={{ color: "var(--plum-text-secondary)" }}>
            Total Accounts
          </p>
          <p className="mt-1 text-3xl font-bold" style={{ color: "#5E35B1" }}>
            {totalAccounts}
          </p>
          <p className="mt-1 text-xs text-gray-400">{data.length} total escalations</p>
        </div>
        <div
          className="rounded-xl bg-white p-5 shadow-sm"
          style={{ border: "1px solid var(--plum-border)" }}
        >
          <p className="text-sm font-medium" style={{ color: "var(--plum-text-secondary)" }}>
            Healthy
          </p>
          <p className="mt-1 text-3xl font-bold" style={{ color: "#26A69A" }}>
            {healthyCount}
          </p>
          <p className="mt-1 text-xs text-gray-400">Score &gt; 70</p>
        </div>
        <div
          className="rounded-xl bg-white p-5 shadow-sm"
          style={{ border: "1px solid var(--plum-border)" }}
        >
          <p className="text-sm font-medium" style={{ color: "var(--plum-text-secondary)" }}>
            At Risk
          </p>
          <p className="mt-1 text-3xl font-bold" style={{ color: "#F57C00" }}>
            {atRiskCount}
          </p>
          <p className="mt-1 text-xs text-gray-400">Score 40-70</p>
        </div>
        <div
          className="rounded-xl bg-white p-5 shadow-sm"
          style={{ border: "1px solid var(--plum-border)" }}
        >
          <p className="text-sm font-medium" style={{ color: "var(--plum-text-secondary)" }}>
            Critical
          </p>
          <p className="mt-1 text-3xl font-bold" style={{ color: "#E91E63" }}>
            {criticalCount}
          </p>
          <p className="mt-1 text-xs text-gray-400">Score &lt; 40</p>
        </div>
      </div>

      {/* Account Table */}
      <div
        className="overflow-x-auto rounded-xl bg-white shadow-sm"
        style={{ border: "1px solid var(--plum-border)" }}
      >
        <table className="min-w-full divide-y text-sm" style={{ borderColor: "var(--plum-border)" }}>
          <thead style={{ backgroundColor: "var(--plum-lighter, #F5F0FF)" }}>
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500 w-8"></th>
              <th
                className="px-4 py-3 text-left font-medium text-gray-500 cursor-pointer"
                onClick={() => toggleSort("accountName")}
              >
                Account{" "}
                {sortField === "accountName" ? (sortDir === "desc" ? "\u2193" : "\u2191") : ""}
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Size</th>
              <th
                className="px-4 py-3 text-left font-medium text-gray-500 cursor-pointer"
                onClick={() => toggleSort("healthScore")}
              >
                Health Score{" "}
                {sortField === "healthScore" ? (sortDir === "desc" ? "\u2193" : "\u2191") : ""}
              </th>
              <th
                className="px-4 py-3 text-left font-medium text-gray-500 cursor-pointer"
                onClick={() => toggleSort("totalEscalations")}
              >
                Total{" "}
                {sortField === "totalEscalations"
                  ? sortDir === "desc"
                    ? "\u2193"
                    : "\u2191"
                  : ""}
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Open</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Closed</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">SLA Breaches</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Risk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.map((account) => (
              <AccountRow
                key={account.accountName}
                account={account}
                isExpanded={expandedAccount === account.accountName}
                onToggle={() =>
                  setExpandedAccount(
                    expandedAccount === account.accountName ? null : account.accountName
                  )
                }
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AccountRow({
  account,
  isExpanded,
  onToggle,
}: {
  account: AccountMetrics;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const healthColor = getHealthColor(account.healthScore);
  const riskBadge = getRiskBadgeClass(account.riskLevel);

  return (
    <>
      <tr
        className="cursor-pointer hover:bg-[#F5F0FF] transition-colors"
        onClick={onToggle}
      >
        <td className="px-4 py-3">
          <svg
            className={`h-4 w-4 text-gray-400 transition-transform ${
              isExpanded ? "rotate-90" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </td>
        <td className="px-4 py-3 font-medium">{account.accountName}</td>
        <td className="px-4 py-3 text-gray-500 text-xs">{account.accountSize}</td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold" style={{ color: healthColor }}>
              {account.healthScore}
            </span>
            <div className="h-2 w-24 rounded-full bg-gray-100">
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${account.healthScore}%`,
                  backgroundColor: healthColor,
                }}
              />
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-gray-700 font-medium">{account.totalEscalations}</td>
        <td className="px-4 py-3">
          <span
            className={
              account.openCount > 0 ? "font-medium text-[#5E35B1]" : "text-gray-400"
            }
          >
            {account.openCount + account.inProgressCount + account.blockedCount}
          </span>
        </td>
        <td className="px-4 py-3 text-gray-500">{account.closedCount}</td>
        <td className="px-4 py-3">
          {account.slaBreachCount > 0 ? (
            <span className="font-semibold text-[#E91E63]">{account.slaBreachCount}</span>
          ) : (
            <span className="text-gray-400">0</span>
          )}
        </td>
        <td className="px-4 py-3">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${riskBadge}`}
          >
            {account.riskLevel}
          </span>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={9} className="bg-[#F5F0FF]/50 px-4 py-4">
            <div className="space-y-3">
              {/* Quick stats row */}
              <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-3">
                {account.avgResolutionTime !== null && (
                  <span>
                    Avg Resolution:{" "}
                    <span className="font-medium text-gray-700">
                      {Math.round(account.avgResolutionTime / 24)}d
                    </span>
                  </span>
                )}
                <span>
                  Critical/High:{" "}
                  <span className="font-medium text-gray-700">{account.criticalHighPct}%</span>
                </span>
                <span>
                  Blocked:{" "}
                  <span className="font-medium text-gray-700">{account.blockedCount}</span>
                </span>
              </div>

              {/* Escalation list */}
              <div className="overflow-x-auto rounded-lg bg-white" style={{ border: "1px solid var(--plum-border)" }}>
                <table className="min-w-full divide-y text-xs" style={{ borderColor: "var(--plum-border)" }}>
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">ID</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">Title</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">Priority</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">Status</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">Category</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">Owner</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">SLA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {account.escalations
                      .sort((a, b) => b.priorityScore - a.priorityScore)
                      .map((e) => (
                        <tr
                          key={e.id}
                          className={
                            e.isBreachingSLA && e.status !== "Closed" ? "bg-[#FCE4EC]/20" : ""
                          }
                        >
                          <td className="px-3 py-2 font-mono text-gray-400">{e.id}</td>
                          <td className="px-3 py-2 max-w-xs truncate font-medium text-gray-700">
                            {e.title}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                priorityColors[e.priority] || ""
                              }`}
                            >
                              {e.priority}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                statusColors[e.status] || ""
                              }`}
                            >
                              {e.status}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-gray-500">{e.category}</td>
                          <td className="px-3 py-2 text-gray-600">{e.owner.split(" ")[0]}</td>
                          <td className="px-3 py-2">
                            {e.isBreachingSLA && e.status !== "Closed" ? (
                              <span className="text-[10px] font-semibold text-[#E91E63]">
                                BREACHED
                              </span>
                            ) : e.status === "Closed" ? (
                              <span className="text-[10px] text-gray-400">Resolved</span>
                            ) : (
                              <span className="text-[10px] text-[#26A69A]">On Track</span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
