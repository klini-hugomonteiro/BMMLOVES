"use client";
import { useState, useRef, useCallback, useEffect } from "react";

const GRID_SIZE = 10;
const FILL = "ABCDEFGHIJLMNOPRSTUVXZ";

function normalize(w: string) {
  return w.toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s/g, "");
}

function buildGrid(words: string[]) {
  const grid: string[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(""));
  const placed: { norm: string; cells: [number, number][] }[] = [];
  const dirs: [number, number][] = [[0, 1], [1, 0], [1, 1], [-1, 1]];

  for (const raw of words) {
    const w = normalize(raw);
    let ok = false;
    for (let t = 0; t < 200 && !ok; t++) {
      const [dr, dc] = dirs[Math.floor(Math.random() * dirs.length)];
      const r0 = Math.floor(Math.random() * GRID_SIZE);
      const c0 = Math.floor(Math.random() * GRID_SIZE);
      const cells: [number, number][] = [];
      let valid = true;
      for (let i = 0; i < w.length; i++) {
        const r = r0 + dr * i, c = c0 + dc * i;
        if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE || (grid[r][c] && grid[r][c] !== w[i])) {
          valid = false; break;
        }
        cells.push([r, c]);
      }
      if (valid) {
        cells.forEach(([r, c], i) => { grid[r][c] = w[i]; });
        placed.push({ norm: w, cells });
        ok = true;
      }
    }
  }

  for (let r = 0; r < GRID_SIZE; r++)
    for (let c = 0; c < GRID_SIZE; c++)
      if (!grid[r][c]) grid[r][c] = FILL[Math.floor(Math.random() * FILL.length)];

  return { grid, placed };
}

function getLine(a: [number, number], b: [number, number]): [number, number][] | null {
  const [r1, c1] = a, [r2, c2] = b;
  const dr = r2 - r1, dc = c2 - c1;
  if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return null;
  const n = Math.max(Math.abs(dr), Math.abs(dc)) + 1;
  const sr = dr === 0 ? 0 : dr / Math.abs(dr);
  const sc = dc === 0 ? 0 : dc / Math.abs(dc);
  return Array.from({ length: n }, (_, i) => [r1 + sr * i, c1 + sc * i] as [number, number]);
}

type Props = { words: string[] };

export default function WordSearch({ words }: Props) {
  const [{ grid, placed }] = useState(() => buildGrid(words));
  const [found, setFound] = useState<Set<string>>(new Set());
  const [foundCells, setFoundCells] = useState<Set<string>>(new Set());
  const [selecting, setSelecting] = useState(false);
  const [startCell, setStartCell] = useState<[number, number] | null>(null);
  const [endCell, setEndCell] = useState<[number, number] | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const ck = (r: number, c: number) => `${r},${c}`;

  const previewLine = startCell && endCell ? getLine(startCell, endCell) : null;
  const previewKeys = new Set(previewLine?.map(([r, c]) => ck(r, c)) ?? []);

  const confirm = useCallback((start: [number, number] | null, end: [number, number] | null) => {
    if (!start || !end) return;
    const line = getLine(start, end);
    if (!line || line.length < 2) return;
    const str = line.map(([r, c]) => grid[r][c]).join("");
    const rev = str.split("").reverse().join("");
    const match = placed.find(p => p.norm === str || p.norm === rev);
    if (match && !found.has(match.norm)) {
      setFound(prev => new Set(prev).add(match.norm));
      setFoundCells(prev => {
        const next = new Set(prev);
        match.cells.forEach(([r, c]) => next.add(ck(r, c)));
        return next;
      });
    }
  }, [grid, placed, found]);

  const getCellFromPoint = useCallback((x: number, y: number): [number, number] | null => {
    if (!gridRef.current) return null;
    for (const el of gridRef.current.querySelectorAll("[data-cell]")) {
      const rect = el.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        const [r, c] = (el as HTMLElement).dataset.cell!.split(",").map(Number);
        return [r, c];
      }
    }
    return null;
  }, []);

  useEffect(() => {
    const onTouchMove = (e: TouchEvent) => {
      if (!selecting) return;
      e.preventDefault();
      const t = e.touches[0];
      const cell = getCellFromPoint(t.clientX, t.clientY);
      if (cell) setEndCell(cell);
    };
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => window.removeEventListener("touchmove", onTouchMove);
  }, [selecting, getCellFromPoint]);

  const normWords = words.map(normalize);
  const allFound = found.size === normWords.length;

  return (
    <div className="select-none">
      <div
        ref={gridRef}
        className="inline-grid gap-1 touch-none"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
        onPointerLeave={() => { confirm(startCell, endCell); setSelecting(false); setStartCell(null); setEndCell(null); }}
      >
        {grid.map((row, r) =>
          row.map((letter, c) => {
            const key = ck(r, c);
            const isFound = foundCells.has(key);
            const isPreview = previewKeys.has(key);
            return (
              <div
                key={key}
                data-cell={key}
                onPointerDown={() => { setSelecting(true); setStartCell([r, c]); setEndCell([r, c]); }}
                onPointerEnter={() => { if (selecting) setEndCell([r, c]); }}
                onPointerUp={() => { confirm(startCell, endCell); setSelecting(false); setStartCell(null); setEndCell(null); }}
                className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-md text-[11px] sm:text-xs font-black cursor-pointer transition-all duration-150
                  ${isFound
                    ? "bg-[#E8185A] text-white scale-105"
                    : isPreview
                    ? "bg-[#E8185A]/50 text-white scale-105"
                    : "bg-[#1e1e1e] text-gray-400 hover:bg-[#2a2a2a] hover:text-white"
                  }`}
              >
                {letter}
              </div>
            );
          })
        )}
      </div>

      {/* Word list */}
      <div className="flex flex-wrap gap-2 mt-5">
        {words.map((w, i) => (
          <span
            key={i}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
              found.has(normWords[i])
                ? "bg-[#E8185A]/20 text-[#E8185A] line-through"
                : "bg-[#1e1e1e] text-gray-400 border border-white/10"
            }`}
          >
            {w}
          </span>
        ))}
      </div>

      {allFound && (
        <p className="text-[#E8185A] font-black text-base mt-5 animate-pulse">
          ❤️ Vocês encontraram todas as palavras!
        </p>
      )}
    </div>
  );
}
