"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  UserPlus,
  Wallet,
  Clock,
  CalendarDays,
  Receipt,
  Users,
  Building2,
  CalendarClock,
  UserCheck,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import { http } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatMoney } from "@/lib/currency";
import { employmentBreakdown } from "@/lib/employment";
import { PageHeader } from "@open-hrms/ui/page-header";
import { OnboardingPendingBanner } from "@/components/onboarding/pending-banner";
import { Card, CardContent } from "@open-hrms/ui/card";
import { cn } from "@open-hrms/ui/cn";
import { Skeleton } from "@open-hrms/ui/skeleton";

interface QuickAction {
  href: string;
  label: string;
  icon: LucideIcon;
  primary?: boolean;
}

const QUICK_ACTIONS: QuickAction[] = [
  { href: "/onboarding", label: "Onboard employee", icon: UserPlus, primary: true },
  { href: "/payroll", label: "Run payroll", icon: Wallet },
  { href: "/attendance", label: "Today's attendance", icon: Clock },
  { href: "/leave", label: "Review leave", icon: CalendarDays },
];

// Employee-portal counterpart: the four everyday actions, with marking
// today's attendance as the headline action.
const EMPLOYEE_QUICK_ACTIONS: QuickAction[] = [
  { href: "/attendance", label: "Mark attendance", icon: Clock, primary: true },
  { href: "/leave", label: "Apply for leave", icon: CalendarDays },
  { href: "/payroll", label: "My payslips", icon: Wallet },
  { href: "/reimbursements", label: "Submit reimbursement", icon: Receipt },
];

function QuickActionsCard({ actions }: { actions: QuickAction[] }) {
  return (
    <section className="mt-8">
      <h3 className="mb-3 text-[13px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
        Quick actions
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.href}
              href={a.href}
              className={cn(
                "press group flex items-center gap-3.5 rounded-[16px] border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--elev-3)]",
                a.primary
                  ? "border-transparent bg-brand-gradient text-white shadow-[var(--elev-2)]"
                  : "border-border bg-card text-foreground shadow-[var(--elev-1)] hover:border-primary/30"
              )}
            >
              <span
                className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-[12px]",
                  a.primary ? "bg-white/15 text-white" : "bg-accent text-primary"
                )}
              >
                <Icon className="size-5" />
              </span>
              <span className="flex-1 text-[15px] font-semibold">{a.label}</span>
              <ArrowUpRight
                className={cn(
                  "size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
                  a.primary ? "text-white/80" : "text-muted-foreground"
                )}
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}

interface Dashboard {
  employees: number;
  byType: Record<string, number>;
  departments: number;
  pendingLeaves: number;
  attendanceToday: { present: number; remote: number; absent: number; total: number };
  monthlyPayrollNet: number;
  payrollCurrency?: string;
  isStaff: boolean;
}

function Stat({
  label,
  value,
  hint,
  icon: Icon,
  tone = "violet",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: "violet" | "saffron" | "sky" | "rose" | "green";
}) {
  const chip = {
    violet: "bg-accent text-primary",
    saffron: "bg-[var(--saffron-bg)] text-[var(--warn)]",
    sky: "bg-[var(--info-bg)] text-[var(--info)]",
    rose: "bg-[var(--bad-bg)] text-[var(--coral)]",
    green: "bg-[var(--ok-bg)] text-[var(--ok)]",
  }[tone];
  return (
    <div className="relative overflow-hidden rounded-[18px] border border-border bg-card p-5 shadow-[var(--elev-2)]">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[13px] font-semibold text-muted-foreground">{label}</div>
        <span className={cn("grid size-9 place-items-center rounded-[11px]", chip)}>
          <Icon className="size-[18px]" />
        </span>
      </div>
      <div className="mt-3 text-[30px] leading-none font-bold tracking-[-0.03em]">{value}</div>
      {hint && <div className="mt-2 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const { user, isStaff } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => http.get<Dashboard>("/reports/dashboard"),
    enabled: isStaff,
  });

  if (!isStaff) {
    return (
      <>
        <PageHeader title={`Welcome, ${user?.name?.split(" ")[0] || "there"}`} description="Your workspace at a glance." />
        <OnboardingPendingBanner className="mb-6" />
        {user?.employeeId ? (
          <QuickActionsCard actions={EMPLOYEE_QUICK_ACTIONS} />
        ) : (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Your account isn&apos;t linked to an employee profile, so personal features
              (attendance, leave, payslips) don&apos;t apply. You can still see company
              information and your team.
            </CardContent>
          </Card>
        )}
      </>
    );
  }

  return (
    <>
      <PageHeader title="Dashboard" description="Headline numbers for your organisation." />
      {/* HR have their own details to complete too, so this sits above the org numbers. */}
      <OnboardingPendingBanner className="mb-6" />
      {isLoading || !data ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-[18px]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <Stat label="Employees" value={data.employees} hint={employmentBreakdown(data.byType)} icon={Users} />
          <Stat label="Departments" value={data.departments} icon={Building2} tone="sky" />
          <Stat label="Pending leave" value={data.pendingLeaves} hint="Awaiting approval" icon={CalendarClock} tone="saffron" />
          <Stat
            label="Present today"
            icon={UserCheck}
            tone="green"
            value={`${data.attendanceToday.present + data.attendanceToday.remote}/${data.attendanceToday.total}`}
            hint={`${data.attendanceToday.remote} remote, ${data.attendanceToday.absent} absent`}
          />
          <Stat
            label="Payroll (net, this month)"
            icon={Wallet}
            tone="rose"
            value={formatMoney(data.monthlyPayrollNet, data.payrollCurrency || "INR")}
          />
        </div>
      )}

      <QuickActionsCard actions={QUICK_ACTIONS} />
    </>
  );
}
