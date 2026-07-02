"use client";

import { useState } from "react";
import {
  emptyCash, emptyPartner, emptyProject, emptyPurchase, emptySales,
  recalcCash, recalcPurchase, recalcSales,
} from "@/lib/edit";
import { fmtWon } from "@/lib/format";
import {
  ACCOUNTS, CF_ACCOUNTS, CF_TYPES, mergeOptions, PARTNER_TYPES, PAY_STATUS,
  PROG_STATUS, RECV_STATUS, SEGMENTS,
} from "@/lib/lists";
import type { CashRow, DashboardData, PartnerRow, ProjectRow, PurchaseRow, SalesRow } from "@/lib/types";

interface Col {
  key: string;
  label: string;
  type: "text" | "date" | "number" | "select" | "computed";
  options?: string[];
  width?: number;
}

type AnyRow = Record<string, unknown>;

function Grid({
  cols, rows, onEdit, onDelete, onAdd,
}: {
  cols: Col[];
  rows: AnyRow[];
  onEdit: (i: number, key: string, value: string) => void;
  onDelete: (i: number) => void;
  onAdd: () => void;
}) {
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              {cols.map((c) => (
                <th key={c.key} className="th" style={c.width ? { minWidth: c.width } : undefined}>
                  {c.label}
                </th>
              ))}
              <th className="th w-10"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50">
                {cols.map((c) => (
                  <td key={c.key} className="border-b border-slate-100 p-0.5">
                    {c.type === "computed" ? (
                      <span className="block bg-slate-50 px-2 py-1.5 text-right text-sm tabular-nums text-slate-500">
                        {fmtWon(Number(row[c.key]) || 0)}
                      </span>
                    ) : c.type === "select" ? (
                      <select
                        value={String(row[c.key] ?? "")}
                        onChange={(e) => onEdit(i, c.key, e.target.value)}
                        className="w-full rounded border border-transparent bg-transparent px-1.5 py-1.5 text-sm hover:border-slate-300 focus:border-brand focus:outline-none"
                      >
                        <option value=""></option>
                        {c.options?.map((o) => <option key={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input
                        type={c.type}
                        value={
                          c.type === "number"
                            ? Number(row[c.key]) === 0 ? "" : String(row[c.key])
                            : String(row[c.key] ?? "")
                        }
                        placeholder={c.type === "number" ? "0" : ""}
                        onChange={(e) => onEdit(i, c.key, e.target.value)}
                        className={`w-full rounded border border-transparent bg-transparent px-1.5 py-1.5 text-sm hover:border-slate-300 focus:border-brand focus:outline-none ${
                          c.type === "number" ? "text-right tabular-nums" : ""
                        }`}
                        style={c.width ? { minWidth: c.width } : undefined}
                      />
                    )}
                  </td>
                ))}
                <td className="border-b border-slate-100 text-center">
                  <button
                    onClick={() => { if (confirm("이 행을 삭제할까요?")) onDelete(i); }}
                    className="px-2 text-slate-300 hover:text-red-500"
                    title="행 삭제"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        onClick={onAdd}
        className="mt-3 rounded-lg border border-dashed border-slate-300 px-4 py-2 text-sm text-slate-500 hover:border-brand hover:text-brand"
      >
        ＋ 행 추가
      </button>
    </div>
  );
}

const SHEETS = ["매출", "매입", "프로젝트", "자금수지", "거래처"] as const;
type Sheet = (typeof SHEETS)[number];

export default function EditView({
  data, onChange,
}: {
  data: DashboardData;
  onChange: (d: DashboardData) => void;
}) {
  const [sheet, setSheet] = useState<Sheet>("매출");

  const setNum = (v: string) => Number(v.replace(/[,\s]/g, "")) || 0;

  // ── 매출
  const salesCols: Col[] = [
    { key: "id", label: "매출ID", type: "text", width: 76 },
    { key: "date", label: "거래일자", type: "date", width: 130 },
    { key: "segment", label: "사업부문", type: "select", options: mergeOptions(SEGMENTS, data.sales.map((r) => r.segment)) },
    { key: "partnerName", label: "거래처명", type: "text", width: 110 },
    { key: "partnerCode", label: "거래처코드", type: "text", width: 70 },
    { key: "projectCode", label: "프로젝트코드", type: "text", width: 76 },
    { key: "projectName", label: "프로젝트명", type: "text", width: 160 },
    { key: "description", label: "거래내용", type: "text", width: 160 },
    { key: "supply", label: "공급가액", type: "number", width: 100 },
    { key: "vat", label: "부가세", type: "number", width: 90 },
    { key: "total", label: "합계(자동)", type: "computed" },
    { key: "status", label: "수금상태", type: "select", options: RECV_STATUS },
    { key: "received", label: "수금액", type: "number", width: 100 },
    { key: "outstanding", label: "미수금(자동)", type: "computed" },
    { key: "dueDate", label: "수금예정일", type: "date", width: 130 },
    { key: "taxInvoiceDate", label: "계산서발행일", type: "date", width: 130 },
    { key: "note", label: "비고", type: "text", width: 100 },
  ];
  const editSales = (i: number, key: string, v: string) => {
    const rows = [...data.sales];
    const isNum = ["supply", "vat", "received"].includes(key);
    const isDate = ["date", "dueDate", "taxInvoiceDate"].includes(key);
    rows[i] = recalcSales(
      { ...rows[i], [key]: isNum ? setNum(v) : isDate ? v || null : v } as SalesRow,
      key
    );
    onChange({ ...data, sales: rows });
  };

  // ── 매입
  const purchaseCols: Col[] = [
    { key: "id", label: "매입ID", type: "text", width: 76 },
    { key: "date", label: "거래일자", type: "date", width: 130 },
    { key: "segment", label: "사업부문", type: "select", options: mergeOptions(SEGMENTS, data.purchases.map((r) => r.segment)) },
    { key: "account", label: "계정과목", type: "select", options: mergeOptions(ACCOUNTS, data.purchases.map((r) => r.account)) },
    { key: "partnerName", label: "거래처명", type: "text", width: 110 },
    { key: "partnerCode", label: "거래처코드", type: "text", width: 70 },
    { key: "projectCode", label: "프로젝트코드", type: "text", width: 76 },
    { key: "projectName", label: "프로젝트명", type: "text", width: 160 },
    { key: "description", label: "거래내용", type: "text", width: 160 },
    { key: "supply", label: "공급가액", type: "number", width: 100 },
    { key: "vat", label: "부가세", type: "number", width: 90 },
    { key: "total", label: "합계(자동)", type: "computed" },
    { key: "status", label: "지급상태", type: "select", options: PAY_STATUS },
    { key: "paid", label: "지급액", type: "number", width: 100 },
    { key: "outstanding", label: "미지급(자동)", type: "computed" },
    { key: "dueDate", label: "지급예정일", type: "date", width: 130 },
    { key: "taxInvoiceDate", label: "계산서수취일", type: "date", width: 130 },
    { key: "note", label: "비고", type: "text", width: 100 },
  ];
  const editPurchase = (i: number, key: string, v: string) => {
    const rows = [...data.purchases];
    const isNum = ["supply", "vat", "paid"].includes(key);
    const isDate = ["date", "dueDate", "taxInvoiceDate"].includes(key);
    rows[i] = recalcPurchase(
      { ...rows[i], [key]: isNum ? setNum(v) : isDate ? v || null : v } as PurchaseRow,
      key
    );
    onChange({ ...data, purchases: rows });
  };

  // ── 프로젝트
  const projectCols: Col[] = [
    { key: "code", label: "코드", type: "text", width: 76 },
    { key: "name", label: "프로젝트명", type: "text", width: 200 },
    { key: "segment", label: "사업부문", type: "select", options: mergeOptions(SEGMENTS, data.projects.map((r) => r.segment)) },
    { key: "clientName", label: "발주처", type: "text", width: 110 },
    { key: "clientCode", label: "발주처코드", type: "text", width: 70 },
    { key: "location", label: "현장위치", type: "text", width: 110 },
    { key: "contractDate", label: "계약일", type: "date", width: 130 },
    { key: "startDate", label: "착공일", type: "date", width: 130 },
    { key: "endDate", label: "준공예정일", type: "date", width: 130 },
    { key: "contractAmount", label: "계약금액", type: "number", width: 110 },
    { key: "status", label: "진행상태", type: "select", options: PROG_STATUS },
    { key: "manager", label: "현장책임자", type: "text", width: 80 },
    { key: "note", label: "비고", type: "text", width: 100 },
  ];
  const editProject = (i: number, key: string, v: string) => {
    const rows = [...data.projects];
    const isNum = key === "contractAmount";
    const isDate = ["contractDate", "startDate", "endDate"].includes(key);
    rows[i] = { ...rows[i], [key]: isNum ? setNum(v) : isDate ? v || null : v } as ProjectRow;
    onChange({ ...data, projects: rows });
  };

  // ── 자금수지
  const cashCols: Col[] = [
    { key: "date", label: "일자", type: "date", width: 130 },
    { key: "type", label: "구분", type: "select", options: CF_TYPES },
    { key: "account", label: "계정", type: "select", options: mergeOptions(CF_ACCOUNTS, data.cash.map((r) => r.account)) },
    { key: "memo", label: "적요", type: "text", width: 220 },
    { key: "inflow", label: "입금액", type: "number", width: 110 },
    { key: "outflow", label: "출금액", type: "number", width: 110 },
    { key: "balance", label: "잔액(자동)", type: "computed" },
    { key: "bank", label: "계좌", type: "text", width: 90 },
    { key: "refId", label: "관련ID", type: "text", width: 76 },
    { key: "note", label: "비고", type: "text", width: 100 },
  ];
  const editCash = (i: number, key: string, v: string) => {
    const rows = [...data.cash];
    const isNum = ["inflow", "outflow"].includes(key);
    rows[i] = { ...rows[i], [key]: isNum ? setNum(v) : key === "date" ? v || null : v } as CashRow;
    onChange({ ...data, cash: recalcCash(rows) });
  };

  // ── 거래처
  const partnerCols: Col[] = [
    { key: "code", label: "코드", type: "text", width: 66 },
    { key: "name", label: "거래처명", type: "text", width: 130 },
    { key: "type", label: "거래구분", type: "select", options: PARTNER_TYPES },
    { key: "bizNo", label: "사업자번호", type: "text", width: 110 },
    { key: "ceo", label: "대표자", type: "text", width: 70 },
    { key: "sector", label: "업태", type: "text", width: 90 },
    { key: "item", label: "종목", type: "text", width: 100 },
    { key: "contactName", label: "담당자", type: "text", width: 70 },
    { key: "phone", label: "연락처", type: "text", width: 110 },
    { key: "email", label: "이메일", type: "text", width: 140 },
    { key: "address", label: "주소", type: "text", width: 160 },
    { key: "note", label: "비고", type: "text", width: 100 },
  ];
  const editPartner = (i: number, key: string, v: string) => {
    const rows = [...data.partners];
    rows[i] = { ...rows[i], [key]: v } as PartnerRow;
    onChange({ ...data, partners: rows });
  };

  const del = (list: "sales" | "purchases" | "projects" | "cash" | "partners", i: number) => {
    const rows = [...(data[list] as unknown as AnyRow[])];
    rows.splice(i, 1);
    const next = { ...data, [list]: rows } as unknown as DashboardData;
    if (list === "cash") next.cash = recalcCash(next.cash);
    onChange(next);
  };

  return (
    <div className="card">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
          {SHEETS.map((s) => (
            <button
              key={s}
              onClick={() => setSheet(s)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                sheet === s ? "bg-white text-brand shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <p className="ml-auto text-xs text-slate-400">
          수정 즉시 저장(이 브라우저) · 회색 칸은 자동계산 · 완료 후 「엑셀 다운로드」로 파일 보관
        </p>
      </div>

      {sheet === "매출" && (
        <Grid cols={salesCols} rows={data.sales as unknown as AnyRow[]} onEdit={editSales}
          onDelete={(i) => del("sales", i)}
          onAdd={() => onChange({ ...data, sales: [...data.sales, emptySales(data.sales.map((r) => r.id))] })} />
      )}
      {sheet === "매입" && (
        <Grid cols={purchaseCols} rows={data.purchases as unknown as AnyRow[]} onEdit={editPurchase}
          onDelete={(i) => del("purchases", i)}
          onAdd={() => onChange({ ...data, purchases: [...data.purchases, emptyPurchase(data.purchases.map((r) => r.id))] })} />
      )}
      {sheet === "프로젝트" && (
        <Grid cols={projectCols} rows={data.projects as unknown as AnyRow[]} onEdit={editProject}
          onDelete={(i) => del("projects", i)}
          onAdd={() => onChange({ ...data, projects: [...data.projects, emptyProject()] })} />
      )}
      {sheet === "자금수지" && (
        <Grid cols={cashCols} rows={data.cash as unknown as AnyRow[]} onEdit={editCash}
          onDelete={(i) => del("cash", i)}
          onAdd={() => onChange({ ...data, cash: recalcCash([...data.cash, emptyCash()]) })} />
      )}
      {sheet === "거래처" && (
        <Grid cols={partnerCols} rows={data.partners as unknown as AnyRow[]} onEdit={editPartner}
          onDelete={(i) => del("partners", i)}
          onAdd={() => onChange({ ...data, partners: [...data.partners, emptyPartner()] })} />
      )}
    </div>
  );
}
