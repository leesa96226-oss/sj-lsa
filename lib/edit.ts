import type { CashRow, PartnerRow, ProjectRow, PurchaseRow, SalesRow } from "./types";

/** 오늘 날짜 yyyy-mm-dd (로컬 기준) */
export function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

/** 기존 ID(S26-001 형식)에서 다음 일련번호 생성 */
export function nextId(prefix: "S" | "P", ids: string[]): string {
  const yy = String(new Date().getFullYear()).slice(2);
  let max = 0;
  const re = new RegExp(`^${prefix}(\\d{2})-(\\d{3,})$`);
  for (const id of ids) {
    const m = id.match(re);
    if (m) max = Math.max(max, Number(m[2]));
  }
  return `${prefix}${yy}-${String(max + 1).padStart(3, "0")}`;
}

/** 공급가액 변경 시 부가세 10% 자동, 합계·미수금은 항상 재계산 */
export function recalcSales(row: SalesRow, changedKey?: string): SalesRow {
  const r = { ...row };
  if (changedKey === "supply") r.vat = Math.round(r.supply * 0.1);
  r.total = r.supply + r.vat;
  r.outstanding = r.total - r.received;
  return r;
}

export function recalcPurchase(row: PurchaseRow, changedKey?: string): PurchaseRow {
  const r = { ...row };
  if (changedKey === "supply") r.vat = Math.round(r.supply * 0.1);
  r.total = r.supply + r.vat;
  r.outstanding = r.total - r.paid;
  return r;
}

/** 자금수지 잔액 누계 재계산 */
export function recalcCash(rows: CashRow[]): CashRow[] {
  let bal = 0;
  return rows.map((c) => {
    bal += c.inflow - c.outflow;
    return { ...c, balance: bal };
  });
}

export function emptySales(ids: string[]): SalesRow {
  return {
    id: nextId("S", ids), date: today(), segment: "", partnerCode: "", partnerName: "",
    projectCode: "", projectName: "", description: "", supply: 0, vat: 0, total: 0,
    taxInvoiceDate: null, status: "미수", received: 0, outstanding: 0, dueDate: null, note: "",
  };
}

export function emptyPurchase(ids: string[]): PurchaseRow {
  return {
    id: nextId("P", ids), date: today(), segment: "", account: "", partnerCode: "",
    partnerName: "", projectCode: "", projectName: "", description: "", supply: 0, vat: 0,
    total: 0, taxInvoiceDate: null, status: "미지급", paid: 0, outstanding: 0, dueDate: null, note: "",
  };
}

export function emptyProject(): ProjectRow {
  return {
    code: "", name: "", segment: "", clientCode: "", clientName: "", location: "",
    contractDate: today(), startDate: null, endDate: null, contractAmount: 0,
    status: "수주", manager: "", note: "",
  };
}

export function emptyCash(): CashRow {
  return {
    date: today(), type: "입금", account: "", memo: "", inflow: 0, outflow: 0,
    balance: 0, bank: "", refId: "", note: "",
  };
}

export function emptyPartner(): PartnerRow {
  return {
    code: "", name: "", type: "매출처", bizNo: "", ceo: "", sector: "", item: "",
    contactName: "", phone: "", email: "", address: "", note: "",
  };
}
