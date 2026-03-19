"use client";

import { useState } from "react";
import type { Escalation, Priority, Status, Source } from "@/lib/data";

const priorityColors: Record<Priority, string> = {
  Critical: "bg-[#FCE4EC] text-[#E91E63]",
  High: "bg-[#FFF3E0] text-[#F57C00]",
  Medium: "bg-[#FFF8E1] text-[#F9A825]",
  Low: "bg-[#E8F5E9] text-[#66BB6A]",
};

const statusColors: Record<Status, string> = {
  Open: "bg-[#EDE7F6] text-[#5E35B1]",
  "In Progress": "bg-[#E8EAF6] text-[#7C4DFF]",
  Blocked: "bg-[#FCE4EC] text-[#E91E63]",
  Closed: "bg-gray-100 text-gray-500",
};

const sourceIcons: Record<Source, string> = {
  Email: "\u2709\uFE0F",
  Slack: "#\uFE0F\u20E3",
  WhatsApp: "\uD83D\uDCAC",
};

function Badge({ text, className }: { text: string; className: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {text}
    </span>
  );
}

function daysSince(dateStr: string): number {
  return Math.floor((new Date("2026-03-19").getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

interface EscalationTableProps {
  data: Escalation[];
}

export default function EscalationTable({ data }: EscalationTableProps) {
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState<Priority | "All">("All");
  const [filterStatus, setFilterStatus] = useState<Status | "All">("All");
  const [filterSource, setFilterSource] = useState<Source | "All">("All");
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [filterOwner, setFilterOwner] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"priorityScore" | "createdAt" | "accountName">("priorityScore");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selectedEscalation, setSelectedEscalation] = useState<Escalation | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 15;

  const categories = Array.from(new Set(data.map((e) => e.category))).sort();
  const owners = Array.from(new Set(data.map((e) => e.owner))).sort();

  const filtered = data
    .filter((e) => {
      if (filterPriority !== "All" && e.priority !== filterPriority) return false;
      if (filterStatus !== "All" && e.status !== filterStatus) return false;
      if (filterSource !== "All" && e.source !== filterSource) return false;
      if (filterCategory !== "All" && e.category !== filterCategory) return false;
      if (filterOwner !== "All" && e.owner !== filterOwner) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          e.title.toLowerCase().includes(q) ||
          e.accountName.toLowerCase().includes(q) ||
          e.id.toLowerCase().includes(q) ||
          e.senderName.toLowerCase().includes(q) ||
          e.summary.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortBy === "priorityScore") cmp = a.priorityScore - b.priorityScore;
      else if (sortBy === "createdAt") cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      else cmp = a.accountName.localeCompare(b.accountName);
      return sortDir === "desc" ? -cmp : cmp;
    });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(col);
      setSortDir("desc");
    }
    setPage(1);
  };

  return (
    <div>
      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search escalations..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#5E35B1] focus:border-[#5E35B1]"
          style={{ borderColor: "var(--plum-border)" }}
        />
        <select value={filterPriority} onChange={(e) => { setFilterPriority(e.target.value as Priority | "All"); setPage(1); }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="All">All Priorities</option>
          {(["Critical", "High", "Medium", "Low"] as Priority[]).map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value as Status | "All"); setPage(1); }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="All">All Statuses</option>
          {(["Open", "In Progress", "Blocked", "Closed"] as Status[]).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterSource} onChange={(e) => { setFilterSource(e.target.value as Source | "All"); setPage(1); }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="All">All Sources</option>
          {(["Email", "Slack", "WhatsApp"] as Source[]).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="All">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterOwner} onChange={(e) => { setFilterOwner(e.target.value); setPage(1); }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="All">All Owners</option>
          {owners.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <span className="flex items-center text-sm text-gray-500">{filtered.length} results</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm" style={{ border: "1px solid var(--plum-border)" }}>
        <table className="min-w-full divide-y text-sm" style={{ borderColor: "var(--plum-border)" }}>
          <thead style={{ backgroundColor: "var(--plum-lighter, #F5F0FF)" }}>
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">ID</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Source</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 cursor-pointer" onClick={() => toggleSort("priorityScore")}>
                Priority {sortBy === "priorityScore" ? (sortDir === "desc" ? "\u2193" : "\u2191") : ""}
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Title</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 cursor-pointer" onClick={() => toggleSort("accountName")}>
                Account {sortBy === "accountName" ? (sortDir === "desc" ? "\u2193" : "\u2191") : ""}
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Category</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Owner</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 cursor-pointer" onClick={() => toggleSort("createdAt")}>
                Age {sortBy === "createdAt" ? (sortDir === "desc" ? "\u2193" : "\u2191") : ""}
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">SLA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.map((e) => (
              <tr
                key={e.id}
                className={`cursor-pointer hover:bg-[#F5F0FF] ${e.isBreachingSLA && e.status !== "Closed" ? "bg-[#FCE4EC]/30" : ""}`}
                onClick={() => setSelectedEscalation(e)}
              >
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{e.id}</td>
                <td className="px-4 py-3">{sourceIcons[e.source]}</td>
                <td className="px-4 py-3">
                  <Badge text={e.priority} className={priorityColors[e.priority]} />
                </td>
                <td className="px-4 py-3 max-w-xs truncate font-medium">{e.title}</td>
                <td className="px-4 py-3 max-w-[10rem] truncate text-gray-600">{e.accountName}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{e.category}</td>
                <td className="px-4 py-3">
                  <Badge text={e.status} className={statusColors[e.status]} />
                </td>
                <td className="px-4 py-3 text-gray-600">{e.owner.split(" ")[0]}</td>
                <td className="px-4 py-3 text-gray-500">{daysSince(e.createdAt)}d</td>
                <td className="px-4 py-3">
                  {e.isBreachingSLA && e.status !== "Closed" ? (
                    <span className="text-xs font-semibold text-red-600">BREACHED</span>
                  ) : e.status === "Closed" ? (
                    <span className="text-xs text-gray-400">Resolved</span>
                  ) : (
                    <span className="text-xs text-green-600">On Track</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40"
        >
          Previous
        </button>
        <span className="text-sm text-gray-500">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40"
        >
          Next
        </button>
      </div>

      {/* Detail Modal */}
      {selectedEscalation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelectedEscalation(null)}>
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-400">{selectedEscalation.id}</p>
                <h2 className="mt-1 text-lg font-bold">{selectedEscalation.title}</h2>
              </div>
              <button onClick={() => setSelectedEscalation(null)} className="text-2xl text-gray-400 hover:text-gray-600">&times;</button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge text={selectedEscalation.priority} className={priorityColors[selectedEscalation.priority]} />
              <Badge text={selectedEscalation.status} className={statusColors[selectedEscalation.status]} />
              <Badge text={selectedEscalation.source} className="bg-gray-100 text-gray-700" />
              <Badge text={selectedEscalation.actionNeeded} className="bg-[#EDE7F6] text-[#5E35B1]" />
              {selectedEscalation.isBreachingSLA && selectedEscalation.status !== "Closed" && (
                <Badge text="SLA BREACHED" className="bg-red-600 text-white" />
              )}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Account</p>
                <p className="font-medium">{selectedEscalation.accountName}</p>
                <p className="text-xs text-gray-400">{selectedEscalation.accountSize}</p>
              </div>
              <div>
                <p className="text-gray-400">Category</p>
                <p className="font-medium">{selectedEscalation.category}</p>
              </div>
              <div>
                <p className="text-gray-400">Owner</p>
                <p className="font-medium">{selectedEscalation.owner}</p>
              </div>
              <div>
                <p className="text-gray-400">Sender</p>
                <p className="font-medium">{selectedEscalation.senderName}</p>
                <p className="text-xs text-gray-400">{selectedEscalation.senderEmail}</p>
              </div>
              <div>
                <p className="text-gray-400">Created</p>
                <p className="font-medium">{new Date(selectedEscalation.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
              </div>
              <div>
                <p className="text-gray-400">SLA Deadline</p>
                <p className="font-medium">{new Date(selectedEscalation.slaDeadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
              </div>
              <div>
                <p className="text-gray-400">Priority Score</p>
                <p className="font-medium">{selectedEscalation.priorityScore}/100</p>
              </div>
              <div>
                <p className="text-gray-400">Response Time</p>
                <p className="font-medium">{selectedEscalation.responseTime ? `${selectedEscalation.responseTime}h` : "Pending"}</p>
              </div>
              {selectedEscalation.resolutionTime && (
                <div>
                  <p className="text-gray-400">Resolution Time</p>
                  <p className="font-medium">{Math.round(selectedEscalation.resolutionTime / 24)}d</p>
                </div>
              )}
            </div>

            <div className="mt-5">
              <p className="text-sm font-medium text-gray-500">AI Summary</p>
              <p className="mt-1 text-sm leading-relaxed">{selectedEscalation.summary}</p>
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500">Original Message</p>
              <div className="mt-1 rounded-lg bg-gray-50 p-3 text-sm leading-relaxed text-gray-700">
                {selectedEscalation.rawMessage}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
