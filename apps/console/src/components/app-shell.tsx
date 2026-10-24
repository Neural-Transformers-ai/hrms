"use client";

import { useEffect, useState, ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Loader2,
  Menu,
  LogOut,
  ShieldCheck,
  LayoutDashboard,
  Building2,
  Users,
  Activity,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { productName } from "@/lib/runtime-env";
import { cn } from "@open-hrms/ui/cn";
import { Button } from "@open-hrms/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@open-hrms/ui/sheet";
import { Avatar, AvatarFallback } from "@open-hrms/ui/avatar";
import { BrandMark } from "@open-hrms/ui/brand-mark";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@open-hrms/ui/dropdown-menu";

const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/workspaces", label: "Workspaces", icon: Building2 },
  { href: "/operators", label: "Operators", icon: Users },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/security", label: "Security", icon: ShieldCheck },
];

function initials(email?: string) {
  if (!email) return "?";
  return email.slice(0, 2).toUpperCase();
}

export function AppShell({ children }: { children: ReactNode }) {
  const { admin, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !admin) router.replace("/login");
  }, [loading, admin, router]);

  if (loading || !admin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const navLinks = (onNavigate?: () => void) =>
    NAV.map((item) => {
      const active = isActive(item.href);
      const Icon = item.icon;
      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={cn(
            "relative flex min-h-11 items-center gap-3 rounded-[10px] px-3 text-[15px] transition-colors duration-200",
            active
              ? "bg-accent font-semibold text-accent-foreground before:absolute before:inset-y-2 before:-left-3 before:w-[3px] before:rounded-full before:bg-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Icon className={cn("size-[18px] shrink-0", active && "text-primary")} />
          {item.label}
        </Link>
      );
    });

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-[256px] shrink-0 flex-col border-r border-[color:var(--hairline)] bg-sidebar lg:flex">
        <Link href="/overview" className="press flex h-[68px] shrink-0 items-center gap-3 px-5">
          <BrandMark size={36} />
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-[15px] font-semibold tracking-[-0.018em]">{productName()}</span>
            <span className="block text-[12px] font-medium text-muted-foreground">Operator Console</span>
          </span>
        </Link>
        <div className="px-3 pt-3 pb-1 text-[12px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
          <span className="px-3">Control plane</span>
        </div>
        <nav className="flex flex-col gap-0.5 px-3">{navLinks()}</nav>
        <div className="mt-auto m-3 rounded-[14px] border border-[color:var(--hairline)] bg-brand-gradient p-4">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-white">
            <ShieldCheck className="size-4 text-[#fbbf24]" /> Audited session
          </div>
          <p className="mt-1 text-[12px] leading-[17px] text-white/70">
            Every operator action is written to the audit log.
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="material-thick sticky top-0 z-30 border-b border-[color:var(--hairline)]">
          <div className="flex h-[68px] items-center gap-3 px-4 sm:px-6 lg:px-8">
            <Button
              variant="ghost"
              size="icon"
              className="-ml-1 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu />
            </Button>
            <Link href="/overview" className="press flex items-center gap-3 lg:hidden">
              <BrandMark size={32} />
              <span className="hidden text-[16px] font-semibold tracking-[-0.018em] sm:inline">Operator Console</span>
            </Link>
            <div className="hidden text-[15px] font-semibold lg:block">
              {NAV.find((n) => isActive(n.href))?.label ?? "Operator Console"}
            </div>

            <div className="ml-auto flex items-center gap-3">
              <span className="hidden items-center gap-1.5 rounded-full bg-primary/12 px-3 py-1.5 text-[13px] font-semibold text-primary md:inline-flex">
                <span className="size-1.5 rounded-full bg-[var(--saffron)]" />
                Control plane
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="press flex items-center rounded-full outline-none focus-visible:ring-4 focus-visible:ring-ring/30"
                  aria-label="Account menu"
                >
                  <Avatar className="ring-2 ring-primary/30">
                    <AvatarFallback className="bg-accent font-semibold text-accent-foreground">{initials(admin.email)}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-64">
                  <div className="px-3 py-2">
                    <div className="text-[15px] font-semibold">Operator</div>
                    <div className="text-[13px] text-muted-foreground">{admin.email}</div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} variant="destructive">
                    <LogOut /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Mobile drawer */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-[85vw] max-w-sm p-0">
            <SheetTitle className="flex h-[68px] items-center gap-3 border-b border-[color:var(--hairline)] px-5 text-[18px] font-semibold">
              <BrandMark size={32} />
              Operator Console
            </SheetTitle>
            <nav className="flex flex-col gap-1 p-3 pl-6">{navLinks(() => setMobileOpen(false))}</nav>
          </SheetContent>
        </Sheet>

        <main className="bg-brand-glow mx-auto w-full min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
          <div className="mx-auto max-w-[1280px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
