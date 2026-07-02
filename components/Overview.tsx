"use client";

import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fmtCompact, fmtWon, monthLabel, ym } from "@/lib/format";
import type { DashboardData } from "@/lib/types";
import { Kpi, Section, segColor } from "./ui";

export default function Overview({ data }: { data: DashboardData }) {
  const totalSales = data.sales.reduce((s, r) => s + r.supply, 0);
  const totalPurchases = data.purchases.reduce((s, r) => s + r.supply, 0);
  const grossProfit = totalSales - totalPurchases;
  const receivable = data.sales.reduce((s, r) => s + Math.max(r.outstanding, 0), 0);
  const payable = data.purchases.reduce((s, r) => s + Math.max(r.outstanding, 0), 0);
  const cashBalance = data.cash.length ? data.cash[data.cash.length - 1].balance : 0;

  // 월별 매출/매입/이익
  const months = new Map<string, { sales: number; purchases: number }>();
  for (const r of data.sales) {
    const k = ym(r.date);
    if (!k) continue;
    const m = months.get(k) ?? { sales: 0, purchases: 0 };
    m.sales += r.supply;
    months.set(k, m);
  }
  for (const r of data.purchases) {
    const k = ym(r.date);
    if (!k) continue;
    const m = months.get(k) ?? { sales: 0, purchases: 0 };
    m.purchases += r.supply;
    months.set(k, m);
  }
  const monthly = [...months.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => ({
      month: monthLabel(k),
      매출: v.sales,
      매입: v.purchases,
      이익: v.sales - v.purchases,
    }));

  // 사업부문별 매출
  const segs = new Map<string, number>();
  for (const r of data.sales) {
    segs.set(r.segment, (segs.get(r.segment) ?? 0) + r.supply);
  }
  const segData = [...segs.entries()]
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({ name, value }));

  // 자금 잔액 추이
  const cashSeries = data.cash
    .filter((c) => c.date)
    .map((c) => ({ date: (c.date as string).slice(5), 잔액: c.balance }));

  const tipFmt = (v: number | string) => fmtWon(Number(v));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <Kpi label="총매출 (공급가)" value={totalSales} accent="blue" sub={`${data.sales.length}건`} />
        <Kpi label="총매입 (공급가)" value={totalPurchases} accent="slate" sub={`${data.purchases.length}건`} />
        <Kpi label="매출총이익" value={grossProfit} accent="green"
          sub={totalSales > 0 ? `이익률 ${((grossProfit / totalSales) * 100).toFixed(1)}%` : undefined} />
        <Kpi label="미수금" value={receivable} accent="red" />
        <Kpi label="미지급금" value={payable} accent="red" />
        <Kpi label="자금 잔액" value={cashBalance} accent="blue" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Section title="월별 매출·매입·이익 (공급가 기준)">
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => fmtCompact(Number(v))} tick={{ fontSize: 11 }} width={56} />
                <Tooltip formatter={tipFmt} />
                <Legend />
                <Bar dataKey="매출" fill="#2E75B6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="매입" fill="#C9CDD4" radius={[3, 3, 0, 0]} />
                <Line dataKey="이익" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </Section>
        </div>

        <Section title="사업부문별 매출 비중">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={segData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95}
                paddingAngle={2} label={({ name }) => name as string} labelLine={false} fontSize={12}>
                {segData.map((s) => (
                  <Cell key={s.name} fill={segColor(s.name)} />
                ))}
              </Pie>
              <Tooltip formatter={tipFmt} />
            </PieChart>
          </ResponsiveContainer>
        </Section>
      </div>

      {cashSeries.length > 0 && (
        <Section title="자금 잔액 추이">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={cashSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => fmtCompact(Number(v))} tick={{ fontSize: 11 }} width={56} />
              <Tooltip formatter={tipFmt} />
              <Line dataKey="잔액" stroke="#1F4E78" strokeWidth={2} dot={{ r: 2.5 }} />
            </LineChart>
          </ResponsiveContainer>
        </Section>
      )}
    </div>
  );
}
