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
        selected
          ? "border-violet-400 bg-violet-500/10 shadow-[0_0_0_1px_rgba(167,139,250,0.45)]"
          : "border-slate-700 bg-slate-900/70 hover:border-slate-600 hover:bg-slate-800/80",
      ].join(" ")}
      aria-pressed={selected}
    >
      <input
        type="radio"
        name={name}
        checked={selected}
        onChange={() => onSelect(model.id)}
        className="mt-1 size-4 accent-violet-500"
        aria-label={`Select ${model.name}`}
      />
      <div className="min-w-0">
        <div className="truncate font-semibold text-slate-100">{model.name}</div>
        <div className="truncate text-sm text-slate-400">{model.provider}</div>
        <div className="mt-2 text-sm text-slate-300">{model.description}</div>
      </div>
    </button>
  );
}

