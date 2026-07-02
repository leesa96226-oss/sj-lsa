"use client";

import { fmtDate, fmtPct, fmtWon } from "@/lib/format";
import type { DashboardData } from "@/lib/types";
import { Section, StatusBadge, segColor } from "./ui";

/** 프로젝트별 매출·원가·이익을 매출/매입 시트에서 프로젝트코드로 집계 */
export default function ProjectsView({ data }: { data: DashboardData }) {
  const salesBy = new Map<string, number>();
  for (const r of data.sales) {
    if (r.projectCode) salesBy.set(r.projectCode, (salesBy.get(r.projectCode) ?? 0) + r.supply);
  }
  const costBy = new Map<string, number>();
  for (const r of data.purchases) {
    if (r.projectCode) costBy.set(r.projectCode, (costBy.get(r.projectCode) ?? 0) + r.supply);
  }

  const rows = data.projects.map((p) => {
    const sales = salesBy.get(p.code) ?? 0;
    const cost = costBy.get(p.code) ?? 0;
    const profit = sales - cost;
    return { ...p, sales, cost, profit, margin: sales > 0 ? profit / sales : 0 };
  });

  // 시트에 없는 프로젝트코드가 매출에 있으면 경고성으로 함께 표시
  const known = new Set(data.projects.map((p) => p.code));
  const orphan = [...salesBy.keys()].filter((c) => !known.has(c));

  return (
    <div className="space-y-4">
      <Section title={`프로젝트 수익성 (${rows.length}건)`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="th">코드</th>
                <th className="th">프로젝트명</th>
                <th className="th">사업부문</th>
                <th className="th">발주처</th>
                <th className="th">준공예정</th>
                <th className="th text-right">계약금액</th>
                <th className="th text-right">매출(집계)</th>
                <th className="th text-right">투입원가</th>
                <th className="th text-right">이익</th>
                <th className="th text-right">이익률</th>
                <th className="th">상태</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.code} className="hover:bg-slate-50">
                  <td className="td text-slate-400">{p.code}</td>
                  <td className="td max-w-[280px] truncate font-medium">
                    <span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ background: segColor(p.segment) }} />
                    {p.name}
                  </td>
                  <td className="td">{p.segment}</td>
                  <td className="td">{p.clientName}</td>
                  <td className="td">{fmtDate(p.endDate)}</td>
                  <td className="td text-right tabular-nums">{fmtWon(p.contractAmount)}</td>
                  <td className="td text-right tabular-nums">{fmtWon(p.sales)}</td>
                  <td className="td text-right tabular-nums">{fmtWon(p.cost)}</td>
                  <td className={`td text-right font-semibold tabular-nums ${p.profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {fmtWon(p.profit)}
                  </td>
                  <td className={`td text-right tabular-nums ${p.margin >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {p.sales > 0 ? fmtPct(p.margin) : "-"}
                  </td>
                  <td className="td"><StatusBadge value={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {orphan.length > 0 && (
          <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
            ⚠️ 매출에 있으나 프로젝트 시트에 없는 코드: {orphan.join(", ")} — 프로젝트 시트에 등록해 주세요.
          </p>
        )}
      </Section>
    </div>
  );
}
