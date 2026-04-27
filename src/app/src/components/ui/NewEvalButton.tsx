import React, { useState } from "react";

export function NewEvalButton({
  onConfirm,
  disabled,
  title = "Start a new evaluation?",
  message = "This will clear the current wizard state and return you to Step 1.",
}: {
  onConfirm: () => void;
  disabled?: boolean;
  title?: string;
  message?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={disabled}
        className={[
          "rounded-xl border px-5 py-3 text-sm font-semibold shadow-sm",
          disabled
            ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
        ].join(" ")}
      >
        New Eval
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-base font-semibold text-slate-900">{title}</div>
            <div className="mt-2 text-sm text-slate-600">{message}</div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                No
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onConfirm();
                }}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

