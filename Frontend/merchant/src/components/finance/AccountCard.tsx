"use client";

import { useMemo, useRef, useState } from "react";
import { Button } from "@vayva/ui";
import { Copy, DotsThree, ShareNetwork } from "@phosphor-icons/react";

type CopyItem = { label: string; value: string };

function buildShareText(title: string, lines: string[]) {
  return [title, ...lines].filter(Boolean).join("\n");
}

export function AccountCard({
  title,
  badge,
  subtitle,
  primaryValue,
  secondaryValue,
  lines,
  copyItems,
  primaryAction,
  secondaryAction,
}: {
  title: string;
  badge?: string;
  subtitle?: string;
  primaryValue?: string;
  secondaryValue?: string;
  lines?: string[];
  copyItems?: CopyItem[];
  primaryAction?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const shareText = useMemo(() => {
    const body: string[] = [];
    if (primaryValue) body.push(primaryValue);
    if (secondaryValue) body.push(secondaryValue);
    for (const l of lines || []) body.push(l);
    for (const it of copyItems || []) body.push(`${it.label}: ${it.value}`);
    return buildShareText(title, body);
  }, [title, primaryValue, secondaryValue, lines, copyItems]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title, text: shareText });
        return;
      }
      await handleCopy(shareText);
    } catch {
      // ignore
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="text-sm font-semibold text-gray-900">{title}</div>
            {badge ? (
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-700">
                {badge}
              </span>
            ) : null}
          </div>
          {subtitle ? <div className="text-xs text-gray-500 mt-1">{subtitle}</div> : null}
        </div>

        <div className="relative flex items-center gap-2" ref={menuRef}>
          {secondaryAction ? (
            <Button
              variant="outline"
              onClick={secondaryAction.onClick}
              className="h-9 px-3 rounded-xl"
            >
              {secondaryAction.label}
            </Button>
          ) : null}
          {primaryAction ? (
            <Button onClick={primaryAction.onClick} className="h-9 px-3 rounded-xl bg-green-600 hover:bg-green-700 text-white">
              {primaryAction.label}
            </Button>
          ) : null}

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50"
            aria-label="More actions"
          >
            <DotsThree size={18} className="text-gray-600" />
          </button>

          {open ? (
            <div className="absolute right-0 top-10 z-20 w-56 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  void handleShare();
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-50 flex items-center gap-2"
              >
                <ShareNetwork size={16} className="text-gray-500" />
                Share / Copy details
              </button>
              {(copyItems || []).length > 0 ? (
                <div className="border-t border-gray-100">
                  {(copyItems || []).map((it) => (
                    <button
                      key={it.label}
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        void handleCopy(it.value);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-50 flex items-center justify-between gap-3"
                    >
                      <span className="truncate">{it.label}</span>
                      <Copy size={16} className="text-gray-500 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {primaryValue ? (
        <div className="mt-4 text-2xl font-bold text-gray-900">{primaryValue}</div>
      ) : null}
      {secondaryValue ? (
        <div className="mt-1 text-sm text-gray-600">{secondaryValue}</div>
      ) : null}

      {(lines || []).length > 0 ? (
        <div className="mt-3 space-y-1">
          {(lines || []).map((l) => (
            <div key={l} className="text-xs text-gray-500">
              {l}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

