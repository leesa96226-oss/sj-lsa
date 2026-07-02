"use client";

import { fmtDate, fmtWon } from "@/lib/format";
import type { DashboardData } from "@/lib/types";
import { Section } from "./ui";

export default function CashView({ data }: { data: DashboardData }) {
  const totalIn = data.cash.reduce((s, c) => s + c.inflow, 0);
  const totalOut = data.cash.reduce((s, c) => s + c.outflow, 0);

  return (
    <div className="space-y-4">
      <Section title="자금수지 내역">
        <div className="mb-3 flex flex-wrap gap-4 text-sm">
          <span className="text-slate-500">
            총입금 <b className="text-brand">{fmtWon(totalIn)}</b>
          </span>
          <span className="text-slate-500">
            총출금 <b className="text-red-600">{fmtWon(totalOut)}</b>
          </span>
          <span className="text-slate-500">
            잔액 <b className="text-emerald-600">{fmtWon(totalIn - totalOut)}</b>
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="th">일자</th>
                <th className="th">구분</th>
                <th className="th">계정</th>
                <th className="th">적요</th>
                <th className="th text-right">입금액</th>
                <th className="th text-right">출금액</th>
                <th className="th text-right">잔액</th>
                <th className="th">관련ID</th>
              </tr>
            </thead>
            <tbody>
              {data.cash.map((c, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="td">{fmtDate(c.date)}</td>
                  <td className="td">
                    <span className={`badge ${c.type === "입금" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>
                      {c.type || "-"}
                    </span>
                  </td>
                  <td className="td">{c.account}</td>
                  <td className="td max-w-[320px] truncate">{c.memo}</td>
                  <td className="td text-right tabular-nums text-brand">{c.inflow ? fmtWon(c.inflow) : "-"}</td>
                  <td className="td text-right tabular-nums text-red-600">{c.outflow ? fmtWon(c.outflow) : "-"}</td>
                  <td className="td text-right font-medium tabular-nums">{fmtWon(c.balance)}</td>
                  <td className="td text-slate-400">{c.refId || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}
