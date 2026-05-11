"use client";

import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type BarChartEntry = {
  model: string;
  score: number;
  accuracy: number;
  consistency: number;
};

export type OverallPerformanceChartProps = {
  data: BarChartEntry[];
};

export function OverallPerformanceChart({ data }: OverallPerformanceChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <RechartsBarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
        <XAxis dataKey="model" tick={{ fill: "#94a3b8", fontSize: 12 }} />
        <YAxis domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 12 }} />
        <Tooltip
          contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid #2a2a3e", borderRadius: "8px" }}
          labelStyle={{ color: "#e2e8f0" }}
          itemStyle={{ color: "#94a3b8" }}
        />
        <Legend
          verticalAlign="bottom"
          wrapperStyle={{ paddingTop: "12px", color: "#94a3b8", fontSize: "12px" }}
        />
        <Bar dataKey="score" name="Score" fill="#3b82f6" radius={[3, 3, 0, 0]} />
        <Bar dataKey="accuracy" name="Accuracy" fill="#22c55e" radius={[3, 3, 0, 0]} />
        <Bar dataKey="consistency" name="Consistency" fill="#f59e0b" radius={[3, 3, 0, 0]} />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
