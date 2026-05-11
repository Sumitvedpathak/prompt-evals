import React from "react";

export function JsonViewer({
  value,
  visible,
}: {
  value: unknown;
  visible: boolean;
}) {
  if (!visible) return null;

  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-slate-700/60">
      <pre className="max-h-72 overflow-auto bg-[#0d0d1a] p-4 font-mono text-xs leading-relaxed text-slate-300 [scrollbar-color:theme(colors.slate.600)_transparent]">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}
