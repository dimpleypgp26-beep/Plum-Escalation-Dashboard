"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line,
} from "recharts";
import type { Escalation } from "@/lib/data";

// Plum brand color palette
const PLUM_COLORS = ["#5E35B1", "#7C4DFF", "#E91E63", "#F57C00", "#26A69A", "#AB47BC", "#42A5F5", "#66BB6A"];

const cardStyle = { border: "1px solid var(--plum-border, #E8E0F0)" };

export function StatusPieChart({ data }: { data: Escalation[] }) {
  const counts = data.reduce<Record<string, number>>((acc, e) => {
    acc[e.status] = (acc[e.status] || 0) + 1;
    return acc;
  }, {});
  const chartData = Object.entries(counts).map(([name, value]) => ({ name, value }));
  const colors: Record<string, string> = { Open: "#7C4DFF", "In Progress": "#5E35B1", Blocked: "#E91E63", Closed: "#BDBDBD" };

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm" style={cardStyle}>
      <h3 className="mb-3 text-sm font-semibold" style={{ color: "var(--plum-text)" }}>Status Distribution</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={colors[entry.name] || "#9E9E9E"} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PriorityBarChart({ data }: { data: Escalation[] }) {
  const counts = data.reduce<Record<string, number>>((acc, e) => {
    acc[e.priority] = (acc[e.priority] || 0) + 1;
    return acc;
  }, {});
  const order = ["Critical", "High", "Medium", "Low"];
  const chartData = order.map((p) => ({ name: p, count: counts[p] || 0 }));
  const colors: Record<string, string> = { Critical: "#E91E63", High: "#F57C00", Medium: "#FFC107", Low: "#66BB6A" };

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm" style={cardStyle}>
      <h3 className="mb-3 text-sm font-semibold" style={{ color: "var(--plum-text)" }}>Priority Breakdown</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8E0F0" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={colors[entry.name] || "#9E9E9E"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryBarChart({ data }: { data: Escalation[] }) {
  const counts = data.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + 1;
    return acc;
  }, {});
  const chartData = Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm" style={cardStyle}>
      <h3 className="mb-3 text-sm font-semibold" style={{ color: "var(--plum-text)" }}>Top Issue Categories</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#E8E0F0" />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="count" fill="#5E35B1" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SourcePieChart({ data }: { data: Escalation[] }) {
  const counts = data.reduce<Record<string, number>>((acc, e) => {
    acc[e.source] = (acc[e.source] || 0) + 1;
    return acc;
  }, {});
  const chartData = Object.entries(counts).map(([name, value]) => ({ name, value }));
  const colors: Record<string, string> = { Email: "#5E35B1", Slack: "#7C4DFF", WhatsApp: "#26A69A" };

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm" style={cardStyle}>
      <h3 className="mb-3 text-sm font-semibold" style={{ color: "var(--plum-text)" }}>Source Channels</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={colors[entry.name] || "#9E9E9E"} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TrendLineChart({ data }: { data: Escalation[] }) {
  const weeks: Record<string, { created: number; closed: number }> = {};
  data.forEach((e) => {
    const d = new Date(e.createdAt);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const key = weekStart.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    if (!weeks[key]) weeks[key] = { created: 0, closed: 0 };
    weeks[key].created++;
    if (e.status === "Closed") weeks[key].closed++;
  });
  const chartData = Object.entries(weeks).map(([week, counts]) => ({ week, ...counts }));

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm" style={cardStyle}>
      <h3 className="mb-3 text-sm font-semibold" style={{ color: "var(--plum-text)" }}>Weekly Escalation Trend</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8E0F0" />
          <XAxis dataKey="week" tick={{ fontSize: 11 }} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="created" stroke="#5E35B1" strokeWidth={2} name="Created" />
          <Line type="monotone" dataKey="closed" stroke="#26A69A" strokeWidth={2} name="Closed" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function OwnerWorkloadChart({ data }: { data: Escalation[] }) {
  const active = data.filter((e) => e.status !== "Closed");
  const counts = active.reduce<Record<string, { open: number; blocked: number }>>(
    (acc, e) => {
      const name = e.owner.split(" ")[0];
      if (!acc[name]) acc[name] = { open: 0, blocked: 0 };
      if (e.status === "Blocked") acc[name].blocked++;
      else acc[name].open++;
      return acc;
    },
    {}
  );
  const chartData = Object.entries(counts)
    .map(([name, c]) => ({ name, open: c.open, blocked: c.blocked, total: c.open + c.blocked }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm" style={cardStyle}>
      <h3 className="mb-3 text-sm font-semibold" style={{ color: "var(--plum-text)" }}>Owner Workload (Active)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8E0F0" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="open" stackId="a" fill="#5E35B1" name="Open/In Progress" radius={[0, 0, 0, 0]} />
          <Bar dataKey="blocked" stackId="a" fill="#E91E63" name="Blocked" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SLAComplianceChart({ data }: { data: Escalation[] }) {
  const active = data.filter((e) => e.status !== "Closed");
  const breached = active.filter((e) => e.isBreachingSLA).length;
  const onTrack = active.length - breached;
  const chartData = [
    { name: "On Track", value: onTrack },
    { name: "Breached", value: breached },
  ];
  const colors = ["#26A69A", "#E91E63"];

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm" style={cardStyle}>
      <h3 className="mb-3 text-sm font-semibold" style={{ color: "var(--plum-text)" }}>SLA Compliance (Active)</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
            {chartData.map((entry, idx) => (
              <Cell key={entry.name} fill={colors[idx]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
