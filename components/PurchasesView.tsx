"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fmtCompact, fmtDate, fmtWon } from "@/lib/format";
import type { DashboardData } from "@/lib/types";
import { Section, StatusBadge } from "./ui";

export default function PurchasesView({ data }: { data: DashboardData }) {
  const [status, setStatus] = useState("전체");
  const [account, setAccount] = useState("전체");

  const accounts = useMemo(
    () => ["전체", ...new Set(data.purchases.map((r) => r.account).filter(Boolean))],
    [data.purchases]
  );
  const statuses = ["전체", "미지급", "부분지급", "지급완료"];

  // 계정과목별 합계
  const byAccount = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of data.purchases) m.set(r.account || "기타", (m.get(r.account || "기타") ?? 0) + r.supply);
    return [...m.entries()].sort(([, a], [, b]) => b - a).map(([name, 금액]) => ({ name, 금액 }));
  }, [data.purchases]);

  const rows = data.purchases.filter(
    (r) => (status === "전체" || r.status === status) && (account === "전체" || r.account === account)
  );
  const sumSupply = rows.reduce((s, r) => s + r.supply, 0);
  const sumOutstanding = rows.reduce((s, r) => s + Math.max(r.outstanding, 0), 0);

  return (
    <div className="space-y-4">
      <Section title="계정과목별 매입 (공급가 기준)">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={byAccount}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={50} />
            <YAxis tickFormatter={(v) => fmtCompact(Number(v))} tick={{ fontSize: 11 }} width={56} />
            <Tooltip formatter={(v) => fmtWon(Number(v))} />
            <Bar dataKey="금액" fill="#C55A11" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Section>

      <Section title="매입 내역">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
          <select value={account} onChange={(e) => setAccount(e.target.value)}
            className="rounded-lg border border-slate-300 px-2 py-1.5">
            {accounts.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-slate-300 px-2 py-1.5">
            {statuses.map((s) => <option key={s}>{s}</option>)}
          </select>
          <span className="ml-auto text-xs text-slate-500">
            {rows.length}건 · 공급가 {fmtWon(sumSupply)} · 미지급 {fmtWon(sumOutstanding)}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="th">ID</th>
                <th className="th">거래일자</th>
                <th className="th">계정과목</th>
                <th className="th">거래처</th>
                <th className="th">프로젝트</th>
                <th className="th">거래내용</th>
                <th className="th text-right">공급가액</th>
                <th className="th text-right">합계금액</th>
                <th className="th">상태</th>
                <th className="th text-right">미지급금</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="td text-slate-400">{r.id}</td>
                  <td className="td">{fmtDate(r.date)}</td>
                  <td className="td">{r.account}</td>
                  <td className="td">{r.partnerName}</td>
                  <td className="td max-w-[220px] truncate">{r.projectName || "-"}</td>
                  <td className="td max-w-[260px] truncate">{r.description}</td>
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
