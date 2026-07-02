import type { DashboardData } from "./types";

/**
 * 데이터는 이 브라우저의 localStorage에만 저장된다.
 * 서버 전송·외부 저장 없음 — 탭을 닫아도 이 PC 안에만 남는다.
 */
const KEY = "sj-dashboard-data-v1";

export function saveData(data: DashboardData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // 저장 실패(용량 등)해도 화면 표시는 계속되므로 무시
  }
}

export function loadData(): DashboardData | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as DashboardData;
    if (!Array.isArray(d.sales) || !Array.isArray(d.purchases)) return null;
    return d;
  } catch {
    return null;
  }
}

export function clearData(): void {
  localStorage.removeItem(KEY);
}
