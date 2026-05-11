import React from "react";

export type ResultTableRow = {
  model: string;
  overallScore: number;
  accuracy: number;
  consistency: number;
  creativity: number;
  safety: number;
};

export type ResultsTableProps = {
  rows: ResultTableRow[];
};

const COLUMNS = [
  { key: "model", label: "MODEL", isText: true },
  { key: "overallScore", label: "OVERALL SCORE", isText: false },
  { key: "accuracy", label: "ACCURACY", isText: false },
  { key: "consistency", label: "CONSISTENCY", isText: false },
  { key: "creativity", label: "CREATIVITY", isText: false },
  { key: "safety", label: "SAFETY", isText: false },
] as const;

type ColumnKey = (typeof COLUMNS)[number]["key"];

export function ResultsTable({ rows }: ResultsTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#2a2a3e]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#2a2a3e]">
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={`${row.model}-${i}`}
              className={[
                "border-b border-[#2a2a3e] last:border-0",
                i % 2 === 0 ? "bg-[#1a1a2e]" : "bg-[#16162a]",
              ].join(" ")}
            >
              {COLUMNS.map((col) => (
                <td
                  key={col.key}
                  className={[
                    "px-4 py-3",
                    col.isText
                      ? "font-semibold text-slate-100"
                      : "text-slate-300",
                  ].join(" ")}
                >
                  {col.isText
                    ? (row[col.key as ColumnKey] as string)
                    : `${row[col.key as ColumnKey]}%`}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
