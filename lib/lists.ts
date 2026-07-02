/** 드롭다운 기본 목록 — 마스터 엑셀 '설정' 시트와 동일 */

export const SEGMENTS = ["무인로봇", "화학설비크리닝", "하수도준설", "공통(관리)"];

export const ACCOUNTS = [
  "외주비", "노무비", "자재비", "장비임차료", "유류비", "지급수수료",
  "여비교통비", "보험료", "안전관리비", "소모품비", "세금과공과", "접대비", "기타경비",
];

export const RECV_STATUS = ["미수", "부분수금", "수금완료"];
export const PAY_STATUS = ["미지급", "부분지급", "지급완료"];
export const PARTNER_TYPES = ["매출처", "매입처", "매출매입"];
export const PROG_STATUS = ["수주", "진행중", "준공", "정산완료"];
export const CF_TYPES = ["입금", "출금"];
export const CF_ACCOUNTS = [
  "매출수금", "매입지급", "급여지급", "세금납부", "일반경비", "차입금", "원리금상환", "기타",
];

/** 기본 목록 + 데이터에 이미 존재하는 값 합치기 (사용자 정의 값 보존) */
export function mergeOptions(defaults: string[], values: (string | undefined)[]): string[] {
  const set = new Set(defaults);
  for (const v of values) if (v) set.add(v);
  return [...set];
}
