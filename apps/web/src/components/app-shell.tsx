"use client";

import { Suspense, useEffect, useMemo, useState, ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Menu, LogOut, User as UserIcon, ChevronDown, Search, Sun, Moon } from "lucide-react";
import { BrandMark } from "@open-hrms/ui/brand-mark";
import { http } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { applyBrandColor } from "@/lib/brand-theme";
import { navLabel, resolveActiveHref, visibleNavGroups, type NavViewer } from "@/lib/nav";
import { productName } from "@/lib/runtime-env";
import { ProductTour } from "@/components/product-tour";
import { cn } from "@open-hrms/ui/cn";
import { Button } from "@open-hrms/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@open-hrms/ui/sheet";
import { Avatar, AvatarFallback } from "@open-hrms/ui/avatar";
import { CommandPalette } from "@/components/command-palette";
import { NotificationsBell } from "@/components/notifications-bell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@open-hrms/ui/dropdown-menu";

function useReminderCount() {
  const { data } = useQuery({
    queryKey: ["reminder-count"],
    queryFn: () => http.get<{ open: number; dueToday: number }>("/reminders/count"),
    refetchInterval: 60_000,
  });
  return data ?? { open: 0, dueToday: 0 };
}

function openCommandPalette() {
  window.dispatchEvent(new Event("cmdk:open"));
}

/** The one nav entry matching the current location (see resolveActiveHref). */
function useActiveHref(): string | null {
  const pathname = usePathname();
  const currentTab = useSearchParams().get("tab");
  return useMemo(() => resolveActiveHref(pathname, currentTab), [pathname, currentTab]);
}

function useNavViewer(): NavViewer {
  const { user, isStaff } = useAuth();
  return { isStaff, hasEmployee: !!user?.employeeId };
}

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = typeof window !== "undefined" && window.localStorage.getItem("hrms.theme") === "dark";
    setDark(saved);
    document.documentElement.classList.toggle("dark", saved);
  }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("hrms.theme", next ? "dark" : "light");
  };
  return (
    <DropdownMenuItem onClick={(e) => { e.preventDefault(); toggle(); }}>
      {dark ? <Sun /> : <Moon />}
      {dark ? "Light mode" : "Dark mode"}
    </DropdownMenuItem>
  );
}

function initials(name?: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Brand({ org, compact = false }: { org?: string; compact?: boolean }) {
  return (
    <Link href="/dashboard" className="press flex min-w-0 items-center gap-3 text-foreground">
      <BrandMark size={compact ? 34 : 38} />
      <span className={cn("min-w-0 leading-tight", compact && "hidden sm:block")}>
        <span className="block max-w-[180px] truncate text-[16px] font-semibold tracking-[-0.018em]">
          {org || productName()}
        </span>
        {org && (
          <span className="block max-w-[180px] truncate text-[12px] font-medium text-muted-foreground">
            {productName()}
          </span>
        )}
      </span>
    </Link>
  );
}

// ── Desktop: left sidebar with collapsible groups ──
function SideNav() {
  const viewer = useNavViewer();
  const reminders = useReminderCount();
  const activeHref = useActiveHref();
  const groups = visibleNavGroups(viewer);
  const activeGroup = groups.find((g) => g.items.some((i) => i.href === activeHref))?.label;
  // Groups opened or closed by hand; otherwise only the active group is open.
  const [toggled, setToggled] = useState<Record<string, boolean>>({});
  const isOpen = (label: string) => toggled[label] ?? label === activeGroup;

  const itemClass = (active: boolean) =>
    cn(
      "relative flex min-h-10 items-center gap-3 rounded-[10px] px-3 text-[14.5px] transition-colors duration-200",
      active
        ? "bg-accent font-semibold text-accent-foreground before:absolute before:inset-y-2 before:-left-3 before:w-[3px] before:rounded-full before:bg-primary"
        : "text-[color:var(--ink-2)] hover:bg-muted hover:text-foreground"
    );

  return (
    <nav className="flex flex-col gap-1 px-3 py-4">
      {groups.map((group) => {
        const items = group.items;
        const [only] = items;

        // Single-item group: a direct link, no section header.
        if (items.length === 1 && only) {
          const active = only.href === activeHref;
          const Icon = only.icon;
          return (
            <Link key={group.label} href={only.href} data-tour={`nav:${group.label}`} className={itemClass(active)}>
              <Icon className={cn("size-[18px] shrink-0", active ? "text-primary" : "text-muted-foreground")} />
              <span className="flex-1 truncate">{navLabel(only, viewer)}</span>
            </Link>
          );
        }

        const open = isOpen(group.label);
        const groupActive = group.label === activeGroup;
        return (
          <div key={group.label} data-tour={`nav:${group.label}`} className="mt-1">
            <button
              type="button"
              onClick={() => setToggled((t) => ({ ...t, [group.label]: !open }))}
              aria-expanded={open}
              className={cn(
                "flex h-8 w-full items-center justify-between rounded-[8px] px-3 text-[12px] font-semibold tracking-[0.06em] uppercase transition-colors",
                groupActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {group.label}
              <ChevronDown className={cn("size-3.5 transition-transform duration-200", !open && "-rotate-90")} />
            </button>
            {open && (
              <div className="mt-0.5 flex flex-col gap-0.5">
                {items.map((item) => {
                  const active = item.href === activeHref;
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} href={item.href} className={itemClass(active)}>
                      <Icon className={cn("size-[18px] shrink-0", active ? "text-primary" : "text-muted-foreground")} />
                      <span className="flex-1 truncate">{navLabel(item, viewer)}</span>
                      {item.href === "/reminders" && reminders.open > 0 && (
                        <span
                          className={cn(
                            "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold text-white",
                            reminders.dueToday > 0 ? "bg-[var(--bad)]" : "bg-primary"
                          )}
                        >
                          {reminders.open > 99 ? "99+" : reminders.open}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

// ── Mobile: flat vertical list inside the slide-over sheet ──
function MobileNav({ onNavigate }: { onNavigate?: () => void }) {
  const viewer = useNavViewer();
  const activeHref = useActiveHref();

  return (
    <nav className="flex flex-col gap-6 px-3 py-4">
      {visibleNavGroups(viewer).map((group) => {
        const items = group.items;
        return (
          <div key={group.label}>
            <div className="px-3 pb-2 text-[13px] font-semibold text-muted-foreground">
              {group.label}
            </div>
            <div className="flex flex-col gap-1">
              {items.map((item) => {
                const active = item.href === activeHref;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex min-h-11 items-center gap-3.5 rounded-[10px] px-3 text-[16px] transition-colors duration-200",
                      active
                        ? "bg-accent font-semibold text-accent-foreground"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className={cn("size-5 shrink-0", active ? "text-accent-foreground" : "text-muted-foreground")} />
                    {navLabel(item, viewer)}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, loading, logout, impersonated, suspended } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Not while suspended: the session is valid, the notice (see Providers) owns the screen.
  useEffect(() => {
    if (!loading && !user && !suspended) router.replace("/login");
  }, [loading, user, suspended, router]);

  // Org-configurable accent: apply the branding colour from the session
  // (Settings → Organization → Theme colour) as the app's --primary.
  const brandColor = (user?.org?.branding as { color?: string } | null)?.color;
  useEffect(() => {
    applyBrandColor(brandColor);
  }, [brandColor]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <ProductTour />

      {/* Desktop sidebar: brand, then the grouped navigation. */}
      <aside className="sticky top-0 hidden h-screen w-[268px] shrink-0 flex-col border-r border-[color:var(--hairline)] bg-sidebar lg:flex">
        <div className="flex h-[68px] shrink-0 items-center px-5">
          <Brand org={user.org?.name} />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <Suspense fallback={null}>
            <SideNav />
          </Suspense>
        </div>
        <button
          type="button"
          onClick={openCommandPalette}
          className="press m-3 rounded-[14px] bg-brand-gradient p-4 text-left text-white shadow-[var(--elev-2)]"
        >
          <div className="text-[13px] font-semibold">Find anything fast</div>
          <p className="mt-1 text-[12px] leading-[17px] text-white/75">
            Press <kbd className="rounded bg-white/20 px-1 font-mono">⌘K</kbd> to jump to any person or page.
          </p>
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Operator impersonation banner, only shows when an operator is acting as this user */}
        {impersonated && (
          <div className="flex items-center justify-center gap-3 bg-amber-500 px-4 py-2 text-center text-[14px] font-medium text-amber-950">
            <span>⚠ Operator support session, you are viewing as <strong>{user.name}</strong> ({user.org?.name}). Actions are audited.</span>
            <button onClick={logout} className="press rounded-full bg-amber-950/15 px-3 py-1 text-[13px] font-semibold hover:bg-amber-950/25">
              Exit
            </button>
          </div>
        )}

        {/* Top bar, translucent material over scrolling content */}
        <header className="material-thick sticky top-0 z-30 flex h-[68px] items-center gap-3 border-b border-[color:var(--hairline)] px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 lg:hidden">
            <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <Menu />
            </Button>
            <Brand org={user.org?.name} compact />
          </div>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetContent side="left" className="w-[85vw] max-w-sm p-0">
              <SheetTitle className="flex h-[68px] items-center gap-3 border-b border-[color:var(--hairline)] px-5 text-[18px] font-semibold">
                <BrandMark size={32} />
                <span className="truncate">{user.org?.name || productName()}</span>
              </SheetTitle>
              <div className="overflow-y-auto">
                <Suspense fallback={null}>
                  <MobileNav onNavigate={() => setMobileOpen(false)} />
                </Suspense>
              </div>
            </SheetContent>
          </Sheet>

          {/* Global search → opens the ⌘K palette */}
          <button
            onClick={openCommandPalette}
            data-tour="search"
            className="press hidden h-11 w-full max-w-[420px] items-center gap-3 rounded-full border border-border bg-card px-4 text-[14px] text-muted-foreground shadow-[var(--elev-1)] transition-colors hover:border-primary/40 hover:text-foreground sm:flex"
          >
            <Search className="size-[18px]" />
            <span className="flex-1 truncate text-left">Search people, pages, settings…</span>
            <kbd className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[12px]">⌘K</kbd>
          </button>

          <div className="ml-auto flex items-center gap-2 sm:gap-2.5">
            <Button variant="ghost" size="icon" className="sm:hidden" onClick={openCommandPalette} aria-label="Search">
              <Search />
            </Button>

            <NotificationsBell />

            <DropdownMenu>
              <DropdownMenuTrigger
                data-tour="user-menu"
                className="press flex items-center gap-2.5 rounded-full p-1 outline-none hover:bg-muted focus-visible:ring-4 focus-visible:ring-ring/30 md:pr-3"
                aria-label="Account menu"
              >
                <Avatar className="ring-2 ring-primary/25">
                  <AvatarFallback className="bg-accent font-semibold text-accent-foreground">{initials(user.name)}</AvatarFallback>
                </Avatar>
                <span className="hidden max-w-[140px] truncate text-[14px] font-medium text-foreground md:block">{user.name}</span>
                <ChevronDown className="hidden size-4 text-muted-foreground md:block" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-64">
                <div className="px-3 py-2">
                  <div className="text-[15px] font-semibold">{user.name}</div>
                  <div className="text-[13px] text-muted-foreground">{user.email}</div>
                  {user.org?.name && (
                    <div className="mt-1.5 text-[13px] text-muted-foreground">{user.org.name}</div>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <UserIcon /> My profile
                </DropdownMenuItem>
                <ThemeToggle />
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} variant="destructive">
                  <LogOut /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="bg-brand-glow min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
          {/* min-w-0 so a wide child (a table, a long unbroken string) scrolls inside its
              own container instead of stretching this column and the document with it. */}
          <div className="mx-auto min-w-0 max-w-[1240px]">{children}</div>
        </main>
      </div>

      <CommandPalette />
    </div>
  );
}
