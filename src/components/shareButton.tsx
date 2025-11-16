import React, { useMemo, useState } from "react";

type ShareJobProps = {
  title: string;
};

export const ShareJob: React.FC<ShareJobProps> = ({ title }) => {
  const [open, setOpen] = useState(false);
  const url = useMemo(() => encodeURIComponent(window.location.href), []);
  const text = useMemo(() => encodeURIComponent(`Check out this job: ${title}`), [title]);

  const handleShare = () => {
    // 1) Native share (mobile & some desktops)
    if (navigator.share) {
      navigator
        .share({
          title,
          text: `Check out this job: ${title}`,
          url: window.location.href,
        })
        .catch(() => {});
      return;
    }

    // 2) Fallback: open modal with browser share URLs
    setOpen(true);
  };

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:translate-y-0.5 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
      >
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
          ↗
        </span>
        Share Job
      </button>

      {/* Fallback Share Modal */}
      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm"
          />

          <div className="fixed bottom-5 left-1/2 z-30 w-[92%] max-w-sm -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Share Job</p>
                <h3 className="text-base font-semibold text-slate-900">{title}</h3>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                aria-label="Close share modal"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <ShareRow
                label="Facebook"
                onClick={() =>
                  window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${url}`,
                    "_blank"
                  )
                }
              />
              <ShareRow
                label="WhatsApp"
                onClick={() =>
                  window.open(
                    `https://api.whatsapp.com/send?text=${text}%20${url}`,
                    "_blank"
                  )
                }
              />
              <ShareRow
                label="LinkedIn"
                onClick={() =>
                  window.open(
                    `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
                    "_blank"
                  )
                }
              />
              <ShareRow
                label="X (Twitter)"
                onClick={() =>
                  window.open(
                    `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
                    "_blank"
                  )
                }
              />
              <ShareRow
                label="Copy Link"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setOpen(false);
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

type ShareRowProps = {
  label: string;
  onClick: () => void;
};

const ShareRow = ({ label, onClick }: ShareRowProps) => (
  <button
    onClick={onClick}
    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-left text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
  >
    {label}
  </button>
);
