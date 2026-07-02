"use client";

import { useEffect, useState } from "react";
import CashView from "@/components/CashView";
import FileDropzone from "@/components/FileDropzone";
import Overview from "@/components/Overview";
import ProjectsView from "@/components/ProjectsView";
import PurchasesView from "@/components/PurchasesView";
import SalesView from "@/components/SalesView";
import { clearData, loadData, saveData } from "@/lib/storage";
import type { DashboardData, ParseResult } from "@/lib/types";

const TABS = ["개요", "매출", "매입", "프로젝트", "자금"] as const;
type Tab = (typeof TABS)[number];

export default function Page() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [tab, setTab] = useState<Tab>("개요");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setData(loadData());
    setReady(true);
  }, []);

  const onLoaded = (result: ParseResult) => {
    setData(result.data);
    setWarnings(result.warnings);
    saveData(result.data);
  };

  const onClear = () => {
    clearData();
    setData(null);
    setWarnings([]);
    setTab("개요");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16">
      <header className="flex flex-wrap items-center gap-3 py-5">
        <div>
          <h1 className="text-xl font-bold text-brand">신정개발 경영지원 대시보드</h1>
          <p className="text-xs text-slate-500">
            무인로봇 · 화학설비크리닝 · 하수도준설 — 매출/매입/자금 현황
          </p>
        </div>
        {data && (
          <div className="ml-auto flex items-center gap-3 text-xs text-slate-500">
            <span>
              📄 {data.fileName} · {new Date(data.loadedAt).toLocaleString("ko-KR")} 기준
            </span>
            <FileDropzone onLoaded={onLoaded} compact />
            <button
              onClick={onClear}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
            >
              데이터 지우기
            </button>
          </div>
        )}
      </header>

      {!ready ? null : !data ? (
        <FileDropzone onLoaded={onLoaded} />
      ) : (
        <>
          {warnings.length > 0 && (
            <div className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              {warnings.map((w, i) => (
                <p key={i}>⚠️ {w}</p>
              ))}
            </div>
          )}

          <nav className="mb-4 flex gap-1 rounded-xl bg-slate-200/60 p-1">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  tab === t ? "bg-white text-brand shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t}
              </button>
            ))}
          </nav>

          {tab === "개요" && <Overview data={data} />}
          {tab === "매출" && <SalesView data={data} />}
          {tab === "매입" && <PurchasesView data={data} />}
          {tab === "프로젝트" && <ProjectsView data={data} />}
          {tab === "자금" && <CashView data={data} />}

          <footer className="mt-8 text-center text-xs text-slate-400">
            🔒 모든 데이터는 이 브라우저에서만 처리됩니다 — 서버 전송·외부 저장 없음
          </footer>
        </>
      )}
    </div>
  );
}
