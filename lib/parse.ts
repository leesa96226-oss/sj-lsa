import * as XLSX from "xlsx";
import type {
  CashRow,
  DashboardData,
  ParseResult,
  PartnerRow,
  ProjectRow,
  PurchaseRow,
  SalesRow,
} from "./types";

/** 셀 값 → 숫자 (빈 값/문자 콤마 허용) */
function num(v: unknown): number {
  if (v == null || v === "") return 0;
  if (typeof v === "number") return isFinite(v) ? v : 0;
  const n = Number(String(v).replace(/[,\s원]/g, ""));
  return isNaN(n) ? 0 : n;
}

/** 셀 값 → yyyy-mm-dd (엑셀 시리얼 / Date / 문자열 모두 처리, 타임존 무관) */
function dstr(v: unknown): string | null {
  if (v == null || v === "") return null;
  if (typeof v === "number") {
    // 엑셀 날짜 시리얼(1900 기준) → UTC 산술 변환 (타임존 영향 차단)
    const d = new Date(Date.UTC(1899, 11, 30) + Math.floor(v) * 86400000);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(
      d.getUTCDate()
    ).padStart(2, "0")}`;
  }
  if (v instanceof Date) {
    if (isNaN(v.getTime())) return null;
    // UTC 자정이면 UTC 기준, 아니면 로컬 기준으로 날짜 추출
    const utcMidnight = v.getUTCHours() === 0 && v.getUTCMinutes() === 0;
    const y = utcMidnight ? v.getUTCFullYear() : v.getFullYear();
    const m = utcMidnight ? v.getUTCMonth() + 1 : v.getMonth() + 1;
    const d = utcMidnight ? v.getUTCDate() : v.getDate();
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }
  const s = String(v).trim();
  const m = s.match(/^(\d{4})[-./](\d{1,2})[-./](\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  return null;
}

function str(v: unknown): string {
  return v == null ? "" : String(v).trim();
}

type Row = Record<string, unknown>;

function readSheet(wb: XLSX.WorkBook, name: string): Row[] {
  const ws = wb.Sheets[name];
  if (!ws) return [];
  return XLSX.utils.sheet_to_json<Row>(ws, { defval: "" });
}

function parseSales(rows: Row[]): SalesRow[] {
  return rows
    .filter((r) => str(r["매출ID"]) || num(r["공급가액"]) !== 0)
    .map((r) => {
      const supply = num(r["공급가액"]);
      const vat = r["부가세(자동)"] === "" ? Math.round(supply * 0.1) : num(r["부가세(자동)"]);
      const total = r["합계금액(자동)"] === "" ? supply + vat : num(r["합계금액(자동)"]);
      const received = num(r["수금액"]);
      return {
        id: str(r["매출ID"]),
        date: dstr(r["거래일자"]),
        segment: str(r["사업부문"]),
        partnerCode: str(r["거래처코드"]),
        partnerName: str(r["거래처명"]),
        projectCode: str(r["프로젝트코드"]),
        projectName: str(r["프로젝트명"]),
        description: str(r["거래내용"]),
        supply,
        vat,
        total,
        taxInvoiceDate: dstr(r["세금계산서발행일"]),
        status: str(r["수금상태"]),
        received,
        outstanding: total - received,
        dueDate: dstr(r["수금예정일"]),
        note: str(r["비고"]),
      };
    });
}

function parsePurchases(rows: Row[]): PurchaseRow[] {
  return rows
    .filter((r) => str(r["매입ID"]) || num(r["공급가액"]) !== 0)
    .map((r) => {
      const supply = num(r["공급가액"]);
      const vat = r["부가세(자동)"] === "" ? Math.round(supply * 0.1) : num(r["부가세(자동)"]);
      const total = r["합계금액(자동)"] === "" ? supply + vat : num(r["합계금액(자동)"]);
      const paid = num(r["지급액"]);
      return {
        id: str(r["매입ID"]),
        date: dstr(r["거래일자"]),
        segment: str(r["사업부문"]),
        account: str(r["계정과목"]),
        partnerCode: str(r["거래처코드"]),
        partnerName: str(r["거래처명"]),
        projectCode: str(r["프로젝트코드"]),
        projectName: str(r["프로젝트명"]),
        description: str(r["거래내용"]),
        supply,
        vat,
        total,
        taxInvoiceDate: dstr(r["세금계산서수취일"]),
        status: str(r["지급상태"]),
        paid,
        outstanding: total - paid,
        dueDate: dstr(r["지급예정일"]),
        note: str(r["비고"]),
      };
    });
}

function parseProjects(rows: Row[]): ProjectRow[] {
  return rows
    .filter((r) => str(r["프로젝트코드"]))
    .map((r) => ({
      code: str(r["프로젝트코드"]),
      name: str(r["프로젝트명"]),
      segment: str(r["사업부문"]),
      clientCode: str(r["발주처코드"]),
      clientName: str(r["발주처명"]),
      location: str(r["현장위치"]),
      contractDate: dstr(r["계약일"]),
      startDate: dstr(r["착공일"]),
      endDate: dstr(r["준공예정일"]),
      contractAmount: num(r["계약금액(공급가)"]),
      status: str(r["진행상태"]),
      manager: str(r["현장책임자"]),
      note: str(r["비고"]),
    }));
}

function parseCash(rows: Row[]): CashRow[] {
  const list = rows
    .filter((r) => dstr(r["일자"]) || num(r["입금액"]) !== 0 || num(r["출금액"]) !== 0)
    .map((r) => ({
      date: dstr(r["일자"]),
      type: str(r["구분"]),
      account: str(r["계정"]),
      memo: str(r["적요"]),
      inflow: num(r["입금액"]),
      outflow: num(r["출금액"]),
      balance: 0,
      bank: str(r["계좌"]),
      refId: str(r["관련ID"]),
      note: str(r["비고"]),
    }));
  // 잔액은 신뢰성을 위해 입력 순서 기준으로 재계산
  let bal = 0;
  for (const c of list) {
    bal += c.inflow - c.outflow;
    c.balance = bal;
  }
  return list;
}

function parsePartners(rows: Row[]): PartnerRow[] {
  return rows
    .filter((r) => str(r["거래처코드"]))
    .map((r) => ({
      code: str(r["거래처코드"]),
      name: str(r["거래처명"]),
      type: str(r["거래구분"]),
      bizNo: str(r["사업자등록번호"]),
      ceo: str(r["대표자"]),
      sector: str(r["업태"]),
      item: str(r["종목"]),
      contactName: str(r["담당자"]),
      phone: str(r["연락처"]),
      email: str(r["이메일"]),
      address: str(r["주소"]),
      note: str(r["비고"]),
    }));
}

/** 엑셀 ArrayBuffer → 대시보드 데이터. 브라우저 밖으로 나가지 않는다. */
export function parseWorkbook(buf: ArrayBuffer, fileName: string): ParseResult {
  // cellDates를 끄면 날짜가 시리얼 숫자로 들어와 dstr()이 타임존 없이 정확히 변환한다
  const wb = XLSX.read(buf, { type: "array" });
  const warnings: string[] = [];

  const required = ["매출", "매입"];
  const missing = required.filter((s) => !wb.SheetNames.includes(s));
  if (missing.length) {
    throw new Error(
      `필수 시트가 없습니다: ${missing.join(", ")} — 마스터 엑셀(sj_management_data.xlsx) 형식인지 확인해 주세요.`
    );
  }
  for (const s of ["프로젝트", "자금수지", "거래처"]) {
    if (!wb.SheetNames.includes(s)) warnings.push(`'${s}' 시트가 없어 해당 화면은 비어 있습니다.`);
  }

  const data: DashboardData = {
    fileName,
    loadedAt: new Date().toISOString(),
    sales: parseSales(readSheet(wb, "매출")),
    purchases: parsePurchases(readSheet(wb, "매입")),
    projects: parseProjects(readSheet(wb, "프로젝트")),
    cash: parseCash(readSheet(wb, "자금수지")),
    partners: parsePartners(readSheet(wb, "거래처")),
  };

  if (data.sales.length === 0) warnings.push("매출 시트에 데이터가 없습니다.");
  return { data, warnings };
}
