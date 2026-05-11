"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart as RechartsRadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export type RadarChartEntry = {
  dimension: string;
  value: number;
};

export type MultiDimensionalChartProps = {
  data: RadarChartEntry[];
};

export function MultiDimensionalChart({ data }: MultiDimensionalChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <RechartsRadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid stroke="#2a2a3e" />
        <PolarAngleAxis dataKey="dimension" tick={{ fill: "#94a3b8", fontSize: 12 }} />
        <Tooltip
          contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid #2a2a3e", borderRadius: "8px" }}
          labelStyle={{ color: "#e2e8f0" }}
          itemStyle={{ color: "#94a3b8" }}
        />
        <Radar
          name="Score"
          dataKey="value"
          stroke="#14b8a6"
          fill="#14b8a6"
          fillOpacity={0.4}
          strokeWidth={2}
        />
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
}
