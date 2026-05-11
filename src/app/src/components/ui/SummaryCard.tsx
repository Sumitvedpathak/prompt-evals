import React from "react";

type AccentColor = "gold" | "blue" | "purple";

export type SummaryCardProps = {
  title: string;
  value: string;
  subtitle: string;
  accentColor: AccentColor;
  icon: React.ReactNode;
};

const accentStyles: Record<
  AccentColor,
  { border: string; iconBg: string; iconText: string; valueText: string; titleText: string }
> = {
  gold: {
    border: "border-amber-500/30",
    iconBg: "bg-amber-500/10",
    iconText: "text-amber-400",
    valueText: "text-amber-300",
    titleText: "text-amber-400",
  },
  blue: {
    border: "border-blue-500/30",
    iconBg: "bg-blue-500/10",
    iconText: "text-blue-400",
    valueText: "text-blue-300",
    titleText: "text-blue-400",
  },
  purple: {
    border: "border-purple-500/30",
    iconBg: "bg-purple-500/10",
    iconText: "text-purple-400",
    valueText: "text-purple-300",
    titleText: "text-purple-400",
  },
};

export function SummaryCard({ title, value, subtitle, accentColor, icon }: SummaryCardProps) {
  const styles = accentStyles[accentColor];

  return (
    <div
      className={[
        "flex flex-col gap-2 rounded-2xl border bg-[#1a1a2e] p-5",
        styles.border,
      ].join(" ")}
    >
      <div className="flex items-center gap-2">
        <span className={["grid size-6 place-items-center rounded-full", styles.iconBg, styles.iconText].join(" ")}>
          {icon}
        </span>
        <span className={["text-xs font-semibold uppercase tracking-wider", styles.titleText].join(" ")}>
          {title}
        </span>
      </div>
      <div className={["text-3xl font-bold leading-none", styles.valueText].join(" ")}>
        {value}
      </div>
      <div className="text-xs text-slate-400">{subtitle}</div>
    </div>
  );
}
