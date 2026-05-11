import React from "react";

export function ProgressBar({
  percent,
  className,
}: {
  percent: number;
  className?: string;
}) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div className={className}>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 transition-[width] duration-100 ease-linear"
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={Math.round(clamped)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <div className="mt-2 text-center text-sm text-slate-400">
        {Math.round(clamped)}% Complete
      </div>
    </div>
  );
}
