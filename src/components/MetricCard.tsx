"use client";

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  color?: string;
  accentColor?: string;
  icon: React.ReactNode;
}

export default function MetricCard({ label, value, subtitle, color = "bg-white", accentColor, icon }: MetricCardProps) {
  return (
    <div
      className={`${color} rounded-xl p-5 shadow-sm transition-shadow hover:shadow-md`}
      style={{ border: "1px solid var(--plum-border, #E8E0F0)" }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--plum-text-secondary, #4A4A6A)" }}>{label}</p>
          <p className="mt-1 text-3xl font-bold" style={accentColor ? { color: accentColor } : undefined}>{value}</p>
          {subtitle && <p className="mt-1 text-xs text-gray-400">{subtitle}</p>}
        </div>
        <div className="text-gray-400">{icon}</div>
      </div>
    </div>
  );
}
