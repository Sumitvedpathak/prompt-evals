import React from "react";
import type { TargetModel } from "@/types/evaluation";

export function ModelCard({
  model,
  selected,
  onSelect,
  name,
}: {
  model: TargetModel;
  selected: boolean;
  onSelect: (modelId: string) => void;
  name: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(model.id)}
      className={[
        "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors",
        selected ? "border-violet-500 bg-violet-50" : "border-slate-200 bg-white hover:bg-slate-50",
      ].join(" ")}
      aria-pressed={selected}
    >
      <input
        type="radio"
        name={name}
        checked={selected}
        onChange={() => onSelect(model.id)}
        className="mt-1 size-4 accent-violet-600"
        aria-label={`Select ${model.name}`}
      />
      <div className="min-w-0">
        <div className="truncate font-semibold text-slate-900">{model.name}</div>
        <div className="truncate text-sm text-slate-500">{model.provider}</div>
        <div className="mt-2 text-sm text-slate-700">{model.description}</div>
      </div>
    </button>
  );
}

