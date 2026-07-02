import * as XLSX from "xlsx";
import {
  ACCOUNTS, CF_ACCOUNTS, CF_TYPES, PARTNER_TYPES, PAY_STATUS, PROG_STATUS, RECV_STATUS, SEGMENTS,
} from "./lists";
import type { DashboardData } from "./types";

/**
 * 대시보드 데이터 → 마스터 엑셀과 동일한 스키마(시트명·1행 헤더·수식)로 생성.
 * 다운로드 파일은 그대로 다시 대시보드에 불러올 수 있다(라운드트립).
 */

const EPOCH = Date.UTC(1899, 11, 30);
type Cell = XLSX.CellObject;

function T(v: string): Cell | null {
  return v ? { t: "s", v } : null;
}
function N(v: number, z = "#,##0"): Cell {
  return { t: "n", v, z };
}
function D(iso: string | null): Cell | null {
  if (!iso) return null;
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const serial = Math.round((Date.UTC(+m[1], +m[2] - 1, +m[3]) - EPOCH) / 86400000);
  return { t: "n", v: serial, z: "yyyy-mm-dd" };
}
function F(f: string, z = "#,##0"): Cell {
  return { t: "n", f, z };
}

function sheet(headers: string[], rows: (Cell | null)[][], widths: number[]): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = {};
  headers.forEach((h, c) => {
    ws[XLSX.utils.encode_cell({ r: 0, c })] = { t: "s", v: h } as Cell;
  });
  rows.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell) ws[XLSX.utils.encode_cell({ r: r + 1, c })] = cell;
    });
  });
  ws["!ref"] = XLSX.utils.encode_range({
    s: { r: 0, c: 0 },
    e: { r: rows.length, c: headers.length - 1 },
  });
  ws["!cols"] = widths.map((wch) => ({ wch }));
  return ws;
}

export function buildWorkbook(data: DashboardData): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  // ── 매출 (부가세를 수동 수정한 건은 값으로, 아니면 수식으로 보존)
  const salesRows = data.sales.map((s, i) => {
    const r = i + 2;
    const vatIsAuto = s.vat === Math.round(s.supply * 0.1);
    return [
      T(s.id), D(s.date), T(s.segment), T(s.partnerCode), T(s.partnerName),
      T(s.projectCode), T(s.projectName), T(s.description), N(s.supply),
      vatIsAuto ? F(`ROUND(I${r}*0.1,0)`) : N(s.vat),
      F(`I${r}+J${r}`), D(s.taxInvoiceDate), T(s.status),
      s.received ? N(s.received) : null, F(`K${r}-N${r}`), D(s.dueDate), T(s.note),
    ];
  });
  XLSX.utils.book_append_sheet(
    wb,
    sheet(
      ["매출ID","거래일자","사업부문","거래처코드","거래처명","프로젝트코드","프로젝트명",
       "거래내용","공급가액","부가세(자동)","합계금액(자동)","세금계산서발행일",
       "수금상태","수금액","미수금(자동)","수금예정일","비고"],
      salesRows,
      [9,12,14,10,16,10,26,28,13,12,13,15,10,13,13,13,16]
    ),
    "매출"
  );

  // ── 매입
  const purchaseRows = data.purchases.map((p, i) => {
    const r = i + 2;
    const vatIsAuto = p.vat === Math.round(p.supply * 0.1);
    return [
      T(p.id), D(p.date), T(p.segment), T(p.account), T(p.partnerCode), T(p.partnerName),
      T(p.projectCode), T(p.projectName), T(p.description), N(p.supply),
      vatIsAuto ? F(`ROUND(J${r}*0.1,0)`) : N(p.vat),
      F(`J${r}+K${r}`), D(p.taxInvoiceDate), T(p.status),
      p.paid ? N(p.paid) : null, F(`L${r}-O${r}`), D(p.dueDate), T(p.note),
    ];
  });
  XLSX.utils.book_append_sheet(
    wb,
    sheet(
      ["매입ID","거래일자","사업부문","계정과목","거래처코드","거래처명","프로젝트코드","프로젝트명",
       "거래내용","공급가액","부가세(자동)","합계금액(자동)","세금계산서수취일",
       "지급상태","지급액","미지급금(자동)","지급예정일","비고"],
      purchaseRows,
      [9,12,14,11,10,16,10,24,24,13,12,13,15,10,13,13,13,14]
    ),
    "매입"
  );

  // ── 거래처
  XLSX.utils.book_append_sheet(
    wb,
    sheet(
      ["거래처코드","거래처명","거래구분","사업자등록번호","대표자","업태","종목",
       "담당자","연락처","이메일","주소","비고"],
      data.partners.map((p) => [
        T(p.code), T(p.name), T(p.type), T(p.bizNo), T(p.ceo), T(p.sector), T(p.item),
        T(p.contactName), T(p.phone), T(p.email), T(p.address), T(p.note),
      ]),
      [11,18,10,16,10,12,14,10,16,22,24,14]
    ),
    "거래처"
  );

  // ── 프로젝트
  XLSX.utils.book_append_sheet(
    wb,
    sheet(
      ["프로젝트코드","프로젝트명","사업부문","발주처코드","발주처명","현장위치",
       "계약일","착공일","준공예정일","계약금액(공급가)","진행상태","현장책임자","비고"],
      data.projects.map((p) => [
        T(p.code), T(p.name), T(p.segment), T(p.clientCode), T(p.clientName), T(p.location),
        D(p.contractDate), D(p.startDate), D(p.endDate), N(p.contractAmount),
        T(p.status), T(p.manager), T(p.note),
      ]),
      [12,28,14,11,16,12,12,12,12,16,11,12,14]
    ),
    "프로젝트"
  );

  // ── 자금수지 (잔액은 누계 수식)
  XLSX.utils.book_append_sheet(
    wb,
    sheet(
      ["일자","구분","계정","적요","입금액","출금액","잔액(자동)","계좌","관련ID","비고"],
      data.cash.map((c, i) => {
        const r = i + 2;
        return [
          D(c.date), T(c.type), T(c.account), T(c.memo),
          c.inflow ? N(c.inflow) : null, c.outflow ? N(c.outflow) : null,
          F(`SUM($E$2:E${r})-SUM($F$2:F${r})`), T(c.bank), T(c.refId), T(c.note),
        ];
      }),
      [12,8,12,26,14,14,16,12,10,16]
    ),
    "자금수지"
  );

  // ── 설정 (드롭다운 목록 원본)
  const lists = [
    ["사업부문", SEGMENTS], ["매입계정과목", ACCOUNTS], ["수금상태", RECV_STATUS],
    ["지급상태", PAY_STATUS], ["거래구분", PARTNER_TYPES], ["진행상태", PROG_STATUS],
    ["자금구분", CF_TYPES], ["자금계정", CF_ACCOUNTS],
  ] as const;
  const maxLen = Math.max(...lists.map(([, v]) => v.length));
  const settingRows: (Cell | null)[][] = [];
  for (let r = 0; r < maxLen; r++) {
    settingRows.push(lists.map(([, vals]) => T(vals[r] ?? "")));
  }
  XLSX.utils.book_append_sheet(
    wb,
    sheet(lists.map(([name]) => name), settingRows, lists.map(() => 14)),
    "설정"
  );

  return wb;
}

/** 브라우저에서 엑셀 다운로드 실행 */
export function downloadExcel(data: DashboardData): void {
  XLSX.writeFile(buildWorkbook(data), "sj_management_data.xlsx", { compression: true });
}
