/** 엑셀 시트(매출/매입/프로젝트/자금수지/거래처)를 파싱한 표준 데이터 구조 */

export interface SalesRow {
  id: string;
  date: string | null; // yyyy-mm-dd
  segment: string; // 사업부문
  partnerCode: string;
  partnerName: string;
  projectCode: string;
  projectName: string;
  description: string;
  supply: number; // 공급가액
  vat: number;
  total: number;
  taxInvoiceDate: string | null;
  status: string; // 미수 | 부분수금 | 수금완료
  received: number; // 수금액
  outstanding: number; // 미수금
  dueDate: string | null;
  note: string;
}

export interface PurchaseRow {
  id: string;
  date: string | null;
  segment: string;
  account: string; // 계정과목
  partnerCode: string;
  partnerName: string;
  projectCode: string;
  projectName: string;
  description: string;
  supply: number;
  vat: number;
  total: number;
  taxInvoiceDate: string | null;
  status: string; // 미지급 | 부분지급 | 지급완료
  paid: number;
  outstanding: number; // 미지급금
  dueDate: string | null;
  note: string;
}

export interface ProjectRow {
  code: string;
  name: string;
  segment: string;
  clientCode: string;
  clientName: string;
  location: string;
  contractDate: string | null;
  startDate: string | null;
  endDate: string | null;
  contractAmount: number;
  status: string; // 수주 | 진행중 | 준공 | 정산완료
  manager: string;
  note: string;
}

export interface CashRow {
  date: string | null;
  type: string; // 입금 | 출금
  account: string;
  memo: string;
  inflow: number;
  outflow: number;
  balance: number; // 계산값
  bank: string;
  refId: string;
  note: string;
}

export interface PartnerRow {
  code: string;
  name: string;
  type: string; // 매출처 | 매입처 | 매출매입
  bizNo: string;
  ceo: string;
  sector: string;
  item: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  note: string;
}

export interface DashboardData {
  fileName: string;
  loadedAt: string; // ISO
  sales: SalesRow[];
  purchases: PurchaseRow[];
  projects: ProjectRow[];
  cash: CashRow[];
  partners: PartnerRow[];
}

export interface ParseResult {
  data: DashboardData;
  warnings: string[];
}
