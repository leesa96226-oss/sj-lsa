/** 금액·날짜 표시 유틸 */

export function fmtWon(n: number): string {
  return n.toLocaleString("ko-KR") + "원";
}

/** 억/만 단위 축약 (KPI 카드용) */
export function fmtCompact(n: number): string {
  const sign = n < 0 ? "-" : "";
  const a = Math.abs(n);
  if (a >= 100_000_000) return sign + (a / 100_000_000).toFixed(2).replace(/\.?0+$/, "") + "억";
  if (a >= 10_000) return sign + Math.round(a / 10_000).toLocaleString("ko-KR") + "만";
  return sign + a.toLocaleString("ko-KR");
}

export function fmtDate(s: string | null): string {
  return s ?? "-";
}

export function fmtPct(n: number): string {
  return (n * 100).toFixed(1) + "%";
}

/** yyyy-mm-dd → 'M월' */
export function monthLabel(ym: string): string {
  const m = ym.slice(5, 7);
  return String(Number(m)) + "월";
}

/** yyyy-mm-dd → yyyy-mm (없으면 null) */
export function ym(date: string | null): string | null {
  return date ? date.slice(0, 7) : null;
}
