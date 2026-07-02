import { fmtCompact } from "@/lib/format";

export const SEGMENT_COLORS: Record<string, string> = {
  무인로봇: "#2E75B6",
  화학설비크리닝: "#C55A11",
  하수도준설: "#548235",
  "공통(관리)": "#7F7F7F",
};

export function segColor(segment: string): string {
  return SEGMENT_COLORS[segment] ?? "#94A3B8";
}

const STATUS_STYLE: Record<string, string> = {
  수금완료: "bg-emerald-100 text-emerald-700",
  지급완료: "bg-emerald-100 text-emerald-700",
  정산완료: "bg-emerald-100 text-emerald-700",
  준공: "bg-sky-100 text-sky-700",
  부분수금: "bg-amber-100 text-amber-700",
  부분지급: "bg-amber-100 text-amber-700",
  진행중: "bg-blue-100 text-blue-700",
  수주: "bg-violet-100 text-violet-700",
  미수: "bg-red-100 text-red-700",
  미지급: "bg-red-100 text-red-700",
};

export function StatusBadge({ value }: { value: string }) {
  const cls = STATUS_STYLE[value] ?? "bg-slate-100 text-slate-600";
  return <span className={`badge ${cls}`}>{value || "-"}</span>;
}

interface KpiProps {
  label: string;
  value: number;
  accent?: "blue" | "red" | "green" | "slate";
  sub?: string;
}

const ACCENT = {
  blue: "text-brand",
  red: "text-red-600",
  green: "text-emerald-600",
  slate: "text-slate-700",
};

export function Kpi({ label, value, accent = "slate", sub }: KpiProps) {
  return (
    <div className="card">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${ACCENT[accent]}`}>
        {fmtCompact(value)}
        <span className="ml-0.5 text-sm font-medium text-slate-400">원</span>
      </p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card">
      <h3 className="mb-4 text-sm font-bold text-slate-700">{title}</h3>
      {children}
    </section>
  );
}
