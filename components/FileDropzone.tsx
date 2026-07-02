"use client";

import { useCallback, useRef, useState } from "react";
import { parseWorkbook } from "@/lib/parse";
import type { ParseResult } from "@/lib/types";

interface Props {
  onLoaded: (result: ParseResult) => void;
  compact?: boolean;
}

export default function FileDropzone({ onLoaded, compact }: Props) {
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      if (!/\.(xlsx|xlsm|xls)$/i.test(file.name)) {
        setError("엑셀 파일(.xlsx)만 열 수 있습니다.");
        return;
      }
      setBusy(true);
      try {
        const buf = await file.arrayBuffer();
        onLoaded(parseWorkbook(buf, file.name));
      } catch (e) {
        setError(e instanceof Error ? e.message : "파일을 읽는 중 오류가 발생했습니다.");
      } finally {
        setBusy(false);
      }
    },
    [onLoaded]
  );

  if (compact) {
    return (
      <span className="inline-flex items-center gap-2">
        <button
          onClick={() => inputRef.current?.click()}
          className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-light"
        >
          {busy ? "읽는 중..." : "엑셀 다시 불러오기"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xlsm,.xls"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        {error && <span className="text-xs text-red-600">{error}</span>}
      </span>
    );
  }

  return (
    <div className="mx-auto mt-16 max-w-xl">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
        }}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition
          ${drag ? "border-brand bg-blue-50" : "border-slate-300 bg-white hover:border-brand-light"}`}
      >
        <div className="text-5xl">📂</div>
        <p className="mt-4 text-lg font-semibold text-slate-700">
          {busy ? "파일을 읽는 중..." : "경영지원 마스터 엑셀을 여기에 끌어다 놓으세요"}
        </p>
        <p className="mt-1 text-sm text-slate-500">또는 클릭해서 파일 선택 (sj_management_data.xlsx)</p>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xlsm,.xls"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>
      {error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">⚠️ {error}</p>
      )}
      <div className="mt-6 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
        🔒 <b>보안 안내</b> — 선택한 파일은 <b>이 브라우저 안에서만</b> 읽고 계산합니다. 어떤 서버나
        GitHub로도 전송·저장되지 않으며, 데이터는 이 PC의 브라우저 저장소에만 남습니다.
      </div>
    </div>
  );
}
