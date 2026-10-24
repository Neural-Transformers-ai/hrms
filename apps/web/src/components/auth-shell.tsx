"use client";

import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@open-hrms/ui/cn";
import { productName } from "@/lib/runtime-env";
import { ProductWordmark } from "@/components/product-wordmark";
import { BrandMark } from "@open-hrms/ui/brand-mark";

function Mark({ light = false, size = 40 }: { light?: boolean; size?: number }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-3 text-[20px] font-semibold tracking-[-0.02em]",
        light ? "text-white" : "text-foreground"
      )}
    >
      <BrandMark size={size} className={light ? "ring-1 ring-white/25" : undefined} />
      <span>
        <ProductWordmark tailClassName={light ? "text-white/60" : undefined} />
      </span>
    </span>
  );
}

/**
 * Shared frame for every unauthenticated screen (sign-in, sign-up, password
 * reset, invite acceptance) so they read as one product rather than four
 * separately-built forms.
 *
 * Desktop is a split: an AI Tamizhaa gradient panel carrying the pitch, and a calm
 * form column. Below `lg` the panel drops away and the form gets the full
 * width, with the wordmark moved inline.
 */
export function AuthShell({
  title,
  subtitle,
  headline,
  points,
  children,
  footer,
  wide = false,
}: {
  title: string;
  subtitle?: string;
  /** Large headline shown on the desktop brand panel. */
  headline: string;
  /** Three or four short proof points under the headline. */
  points: string[];
  children: ReactNode;
  footer?: ReactNode;
  /** Use a wider form column for multi-field forms like sign-up. */
  wide?: boolean;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      {/* ── Brand panel (desktop only) ──────────────────────────────────── */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-brand-gradient p-14 text-white lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 size-[460px] rounded-full bg-[#f59e0b]/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-44 -left-28 size-[520px] rounded-full bg-[#c026d3]/35 blur-3xl"
        />
        {/* faint dot field, for depth without noise */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage: "linear-gradient(to bottom, black, transparent 85%)",
          }}
        />

        <Link href="/" className="press relative w-fit">
          <Mark light />
        </Link>

        <div className="relative">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[13px] font-semibold tracking-wide text-white/90 backdrop-blur">
            <Sparkles className="size-3.5 text-[#fbbf24]" />
            Crafted by AI Tamizhaa
          </span>
          <h1 className="max-w-md text-[42px] leading-[1.08] font-bold tracking-[-0.03em]">
            {headline}
          </h1>
          <ul className="mt-10 max-w-md space-y-3">
            {points.map((line) => (
              <li
                key={line}
                className="flex items-start gap-3.5 rounded-[14px] border border-white/12 bg-white/[0.07] px-4 py-3 text-[16px] leading-[23px] text-white/90 backdrop-blur-sm"
              >
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-[#fbbf24] text-[#3b1a00]">
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-[14px] text-white/60">
          {productName()} · People, payroll and leave in one place
        </p>
      </div>

      {/* ── Form column ─────────────────────────────────────────────────── */}
      <div className="bg-brand-glow flex flex-col justify-center bg-background px-5 py-10 sm:px-10">
        <div className={cn("mx-auto w-full", wide ? "max-w-[520px]" : "max-w-[440px]")}>
          <Link href="/" className="press mb-9 inline-block lg:hidden">
            <Mark size={36} />
          </Link>

          <h2 className="text-[34px] leading-[40px] font-bold tracking-[-0.026em] text-foreground">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2.5 text-[17px] leading-[24px] text-muted-foreground">{subtitle}</p>
          )}

          <div className="mt-9">{children}</div>

          {footer && <div className="mt-8">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
