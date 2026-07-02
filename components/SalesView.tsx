"use client";

import { useMemo, useState } from "react";
import { fmtDate, fmtWon } from "@/lib/format";
import type { DashboardData } from "@/lib/types";
import { Section, StatusBadge } from "./ui";

export default function SalesView({ data }: { data: DashboardData }) {
  const [status, setStatus] = useState("전체");
  const [segment, setSegment] = useState("전체");

  const segments = useMemo(
    () => ["전체", ...new Set(data.sales.map((r) => r.segment).filter(Boolean))],
    [data.sales]
  );
  const statuses = ["전체", "미수", "부분수금", "수금완료"];

  const rows = data.sales.filter(
    (r) => (status === "전체" || r.status === status) && (segment === "전체" || r.segment === segment)
  );
  const sumSupply = rows.reduce((s, r) => s + r.supply, 0);
  const sumOutstanding = rows.reduce((s, r) => s + Math.max(r.outstanding, 0), 0);

  const receivables = data.sales
    .filter((r) => r.outstanding > 0)
    .sort((a, b) => (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999"));

  return (
    <div className="space-y-4">
      {receivables.length > 0 && (
        <Section title={`미수금 현황 (${receivables.length}건)`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="th">수금예정일</th>
                  <th className="th">거래처</th>
                  <th className="th">건명</th>
                  <th className="th text-right">합계금액</th>
                  <th className="th text-right">수금액</th>
                  <th className="th text-right">미수금</th>
                  <th className="th">상태</th>
                </tr>
              </thead>
              <tbody>
                {receivables.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="td">{fmtDate(r.dueDate)}</td>
                    <td className="td">{r.partnerName}</td>
                    <td className="td max-w-[320px] truncate">{r.projectName || r.description}</td>
                    <td className="td text-right tabular-nums">{fmtWon(r.total)}</td>
                    <td className="td text-right tabular-nums">{fmtWon(r.received)}</td>
                    <td className="td text-right font-semibold tabular-nums text-red-600">
                      {fmtWon(r.outstanding)}
                    </td>
                    <td className="td"><StatusBadge value={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      <Section title="매출 내역">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
          <select value={segment} onChange={(e) => setSegment(e.target.value)}
            className="rounded-lg border border-slate-300 px-2 py-1.5">
            {segments.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-slate-300 px-2 py-1.5">
            {statuses.map((s) => <option key={s}>{s}</option>)}
          </select>
          <span className="ml-auto text-xs text-slate-500">
            {rows.length}건 · 공급가 {fmtWon(sumSupply)} · 미수 {fmtWon(sumOutstanding)}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="th">ID</th>
                <th className="th">거래일자</th>
                <th className="th">사업부문</th>
                <th className="th">거래처</th>
                <th className="th">거래내용</th>
                <th className="th text-right">공급가액</th>
                <th className="th text-right">합계금액</th>
                <th className="th">상태</th>
                <th className="th text-right">미수금</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="td text-slate-400">{r.id}</td>
                  <td className="td">{fmtDate(r.date)}</td>
                  <td className="td">{r.segment}</td>
                  <td className="td">{r.partnerName}</td>
                  <td className="td max-w-[300px] truncate">{r.description}</td>
                  <td className="td text-right tabular-nums">{fmtWon(r.supply)}</td>
                  <td className="td text-right tabular-nums">{fmtWon(r.total)}</td>
                  <td className="td"><StatusBadge value={r.status} /></td>
                  <td className={`td text-right tabular-nums ${r.outstanding > 0 ? "font-semibold text-red-600" : "text-slate-400"}`}>
                    {r.outstanding > 0 ? fmtWon(r.outstanding) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}
