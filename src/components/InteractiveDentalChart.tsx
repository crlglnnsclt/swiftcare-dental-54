/*
 * Dental Chart Module – React (Lovable-ready)
 * ------------------------------------------------------------
 * What this gives you
 * - Interactive dental chart (32 permanent or 20 primary teeth)
 * - Clickable tooth surfaces (M, D, B, L, O) with color-coded conditions
 * - Whole-tooth actions (Missing/Extracted, Implant, Crown, RCT, etc.)
 * - Per-tooth history log (who/when/what/notes)
 * - Undo/Redo, Search patient, Numbering system (Universal or FDI)
 * - Local persistence (localStorage) + pluggable save/load (Supabase or REST)
 * - Export to PDF (via html2canvas + jsPDF)
 * - Clean Tailwind UI with lucide-react icons and subtle motion
 *
 * How to use in Lovable.dev
 * 1) Create a new React route/page and paste this file in as the default export.
 * 2) Ensure Tailwind is enabled (Lovable usually scaffolds it). If not, enable Tailwind.
 * 3) Install deps:
 *    npm i lucide-react html2canvas jspdf framer-motion
 * 4) (Optional) Wire the persistence adapters in saveChart()/loadChart() to Supabase/your backend.
 * 5) Drop <DentalChart /> anywhere in your app. It is self-contained.
 *
 * Step-by-step build roadmap (already implemented here):
 * 1) Data model: define Condition catalog + ChartState with surfaces + history.
 * 2) Numbering: Universal (1–32) + FDI (11–48). Primary set A–T (or FDI 51–85).
 * 3) Rendering: surface-based SVG (5-surface grid) per tooth, layout upper/lower arches.
 * 4) Interaction: pick a condition, click a surface/tooth, open quick form for notes.
 * 5) History: append entries; allow per-tooth sidebar review.
 * 6) State control: undo/redo stacks; localStorage autosave; patient switcher.
 * 7) Export: generate PNG via html2canvas and embed into a PDF with jsPDF.
 * 8) Integration: provide stubs for Supabase/REST; keep module API pure.
 *
 * Notes:
 * - This model uses a simplified 5-surface representation. Swap with real SVG teeth later if desired.
 * - Colors are semantic but accessible; adjust in CONDITIONS.
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Download, History as HistoryIcon, RotateCcw, RotateCw, Save, Upload, FileSignature, Settings, Search, Stethoscope, StickyNote, Printer } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// -----------------------------
// Constants & Utilities
// -----------------------------

const SURFACES = ["M", "D", "B", "L", "O"]; // Mesial, Distal, Buccal, Lingual, Occlusal

const NUMBERING = {
  universalPermanent: Array.from({ length: 32 }, (_, i) => i + 1), // 1..32
  universalPrimary: [
    "A", "B", "C", "D", "E", // upper right -> upper left
    "F", "G", "H", "I", "J",
    "K", "L", "M", "N", "O",
    "P", "Q", "R", "S", "T",
  ],
  fdiPermanent: [
    18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28, // upper
    48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38, // lower
  ],
  fdiPrimary: [
    55,54,53,52,51,61,62,63,64,65,
    85,84,83,82,81,71,72,73,74,75,
  ],
};

// Default condition catalog
const CONDITIONS = [
  { id: "caries", label: "Caries", surface: true, color: "#ef4444", icon: "🦷" },
  { id: "filling", label: "Filling", surface: true, color: "#3b82f6", icon: "◻" },
  { id: "composite", label: "Composite", surface: true, color: "#06b6d4", icon: "◆" },
  { id: "crown", label: "Crown", surface: true, color: "#f59e0b", icon: "👑" },
  { id: "rct", label: "Root Canal", surface: false, color: "#7c3aed", icon: "🪥" },
  { id: "implant", label: "Implant", surface: false, color: "#10b981", icon: "⚙" },
  { id: "extracted", label: "Missing/Extracted", surface: false, color: "#6b7280", icon: "✖" },
  { id: "fracture", label: "Fracture", surface: true, color: "#db2777", icon: "⚡" },
  { id: "mobility", label: "Mobility", surface: false, color: "#a3e635", icon: "↔" },
  { id: "veneer", label: "Veneer", surface: true, color: "#eab308", icon: "⟡" },
];

const CONDITION_LOOKUP = Object.fromEntries(CONDITIONS.map(c => [c.id, c]));

const nowISO = () => new Date().toISOString();

function classNames(...xs: (string | boolean | undefined | null)[]): string { 
  return xs.filter(Boolean).join(" "); 
}

// -----------------------------
// Data Types (JS Doc for clarity)
// -----------------------------
/**
 * @typedef {Object} SurfaceMark
 * @property {string} conditionId
 * @property {string} note
 * @property {string} by // clinician id or name
 * @property {string} at // ISO datetime
 */

/**
 * @typedef {Object} ToothEntry
 * @property {string|number} toothId
 * @property {Object.<"M"|"D"|"B"|"L"|"O", SurfaceMark|null>} surfaces
 * @property {string|null} whole // conditionId for whole-tooth (extracted, implant, rct, crown applied to tooth-level)
 * @property {Array<SurfaceMark & { scope: 'surface'|'whole', surface?: string }>} history
 */

/**
 * @typedef {Object} ChartState
 * @property {string} patientId
 * @property {"permanent"|"primary"} dentition
 * @property {"universal"|"fdi"} numbering
 * @property {Record<string|number, ToothEntry>} teeth
 * @property {string} updatedAt
 */

interface SurfaceMark {
  conditionId: string;
  note: string;
  by: string;
  at: string;
}

interface ToothEntry {
  toothId: string | number;
  surfaces: Record<"M" | "D" | "B" | "L" | "O", SurfaceMark | null>;
  whole: string | null;
  history: Array<SurfaceMark & { scope: 'surface' | 'whole'; surface?: string }>;
}

interface ChartState {
  patientId: string;
  dentition: "permanent" | "primary";
  numbering: "universal" | "fdi";
  teeth: Record<string | number, ToothEntry>;
  updatedAt: string;
}

const EMPTY_TOOTH = (toothId: string | number): ToothEntry => ({
  toothId,
  surfaces: { M: null, D: null, B: null, L: null, O: null },
  whole: null,
  history: [],
});

const makeInitialTeeth = (list: (string | number)[]) => Object.fromEntries(list.map(t => [t, EMPTY_TOOTH(t)]));

const DEFAULT_CHART: ChartState = {
  patientId: "demo-patient",
  dentition: "permanent",
  numbering: "universal",
  teeth: makeInitialTeeth(NUMBERING.universalPermanent),
  updatedAt: nowISO(),
};

// -----------------------------
// Persistence (local + adapters)
// -----------------------------

const STORAGE_KEY = "dentalChart.v1";

function saveLocal(state: ChartState) {
  localStorage.setItem(STORAGE_KEY + ":" + state.patientId, JSON.stringify(state));
}

function loadLocal(patientId: string): ChartState | null {
  const raw = localStorage.getItem(STORAGE_KEY + ":" + patientId);
  return raw ? JSON.parse(raw) : null;
}

// --- Adapters (fill these if you want Supabase or REST) ---
// Supabase example (pseudo):
// import { createClient } from '@supabase/supabase-js';
// const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_KEY);
// async function saveChartSupabase(state) { await supabase.from('dental_charts').upsert({ patient_id: state.patientId, state }); }
// async function loadChartSupabase(patientId) { const { data } = await supabase.from('dental_charts').select('state').eq('patient_id', patientId).single(); return data?.state; }

// REST example (pseudo):
// async function saveChartREST(state) { await fetch('/api/chart', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(state) }); }
// async function loadChartREST(patientId) { const r = await fetch('/api/chart?patientId=' + encodeURIComponent(patientId)); return await r.json(); }

// Toggle which persistence to use
async function saveChart(state: ChartState) {
  saveLocal(state);
  // await saveChartSupabase(state)
  // await saveChartREST(state)
}
async function loadChart(patientId: string): Promise<ChartState | null> {
  const fromLocal = loadLocal(patientId);
  // const fromSupabase = await loadChartSupabase(patientId)
  // const fromREST = await loadChartREST(patientId)
  return fromLocal || null;
}

// -----------------------------
// Small UI helpers
// -----------------------------

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs text-muted-foreground bg-background/70 shadow-sm">{children}</span>;
}

function IconButton({ title, onClick, children }: { title: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button title={title} onClick={onClick} className="rounded-2xl border px-2.5 py-2 hover:bg-muted/50 active:scale-[0.98] transition shadow-sm bg-background">
      {children}
    </button>
  );
}

function Select({ value, onChange, children }: { value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className="rounded-xl border px-3 py-2 shadow-sm bg-background">
      {children}
    </select>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={classNames("rounded-xl border px-3 py-2 shadow-sm bg-background", props.className)} />
}

// -----------------------------
// Tooth Surface Cell (SVG-like grid)
// -----------------------------

function SurfaceCell({ tooth, surface, mark, isSelected, onClick }: {
  tooth: string | number;
  surface: string;
  mark: SurfaceMark | null;
  isSelected: boolean;
  onClick: () => void;
}) {
  const bg = mark ? CONDITION_LOOKUP[mark.conditionId]?.color : "hsl(var(--background))";
  const border = isSelected ? "ring-2 ring-primary" : "";
  return (
    <div
      onClick={onClick}
      title={`${tooth.toString()} · ${surface}${mark ? ` · ${CONDITION_LOOKUP[mark.conditionId]?.label}` : ""}`}
      className={classNames("w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 border flex items-center justify-center cursor-pointer select-none", border)}
      style={{ backgroundColor: bg }}
    >
      <span className="text-[10px] text-muted-foreground">{surface}</span>
    </div>
  );
}

function ToothTile({ entry, selected, onSelect, onSurfaceClick }: {
  entry: ToothEntry;
  selected: boolean;
  onSelect: (toothId: string | number) => void;
  onSurfaceClick: (toothId: string | number, surface: string) => void;
}) {
  const isMissing = entry.whole === "extracted";
  return (
    <motion.div
      layout
      className={classNames("p-2 rounded-2xl border bg-background shadow-sm", selected && "ring-2 ring-primary")}
      onClick={() => onSelect(entry.toothId)}
    >
      <div className="flex items-center justify-between mb-1">
        <span className={classNames("text-xs font-medium", isMissing ? "line-through text-muted-foreground" : "")}>{entry.toothId}</span>
        {entry.whole && <Badge>{CONDITION_LOOKUP[entry.whole]?.label}</Badge>}
      </div>
      <div className={classNames("grid grid-cols-3 grid-rows-3 gap-0.5", isMissing ? "opacity-50" : "")}
           onClick={(e) => e.stopPropagation()}>
        {/* 3x3 grid approximating 5 surfaces: center = O, and edges for M/D/B/L */}
        <div className="col-start-1 row-start-2"><SurfaceCell tooth={entry.toothId} surface="M" mark={entry.surfaces.M} isSelected={false} onClick={() => onSurfaceClick(entry.toothId, "M")} /></div>
        <div className="col-start-2 row-start-1"><SurfaceCell tooth={entry.toothId} surface="B" mark={entry.surfaces.B} isSelected={false} onClick={() => onSurfaceClick(entry.toothId, "B")} /></div>
        <div className="col-start-2 row-start-2"><SurfaceCell tooth={entry.toothId} surface="O" mark={entry.surfaces.O} isSelected={false} onClick={() => onSurfaceClick(entry.toothId, "O")} /></div>
        <div className="col-start-2 row-start-3"><SurfaceCell tooth={entry.toothId} surface="L" mark={entry.surfaces.L} isSelected={false} onClick={() => onSurfaceClick(entry.toothId, "L")} /></div>
        <div className="col-start-3 row-start-2"><SurfaceCell tooth={entry.toothId} surface="D" mark={entry.surfaces.D} isSelected={false} onClick={() => onSurfaceClick(entry.toothId, "D")} /></div>
      </div>
    </motion.div>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      {CONDITIONS.map(c => (
        <div key={c.id} className="flex items-center gap-1">
          <span className="inline-block w-4 h-4 border rounded" style={{ backgroundColor: c.color }} />
          <span className="text-xs text-muted-foreground">{c.label}</span>
        </div>
      ))}
    </div>
  );
}

function ConditionPicker({ selectedId, setSelectedId }: { selectedId: string; setSelectedId: (id: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1">
      {CONDITIONS.map(c => (
        <button key={c.id} onClick={() => setSelectedId(c.id)}
          className={classNames("px-2 py-1 border rounded-xl text-sm", selectedId === c.id ? "ring-2 ring-primary" : "hover:bg-muted/50")}
          title={c.label}
        >
          <span className="mr-1">{c.icon}</span>
          {c.label}
        </button>
      ))}
    </div>
  );
}

// -----------------------------
// Main Component
// -----------------------------

export default function InteractiveDentalChart() {
  const [state, setState] = useState<ChartState>(() => DEFAULT_CHART);
  const [selectedTooth, setSelectedTooth] = useState<string | number | null>(null);
  const [selectedCondition, setSelectedCondition] = useState("caries");
  const [clinician, setClinician] = useState("");
  const [note, setNote] = useState("");
  const [query, setQuery] = useState("");

  const [undoStack, setUndoStack] = useState<ChartState[]>([]);
  const [redoStack, setRedoStack] = useState<ChartState[]>([]);

  const chartRef = useRef<HTMLDivElement>(null);

  // Load on patient switch
  useEffect(() => {
    (async () => {
      const loaded = await loadChart(state.patientId);
      if (loaded) {
        setState(loaded);
      } else {
        // fresh chart for patient
        const list = state.dentition === "primary" ? NUMBERING.universalPrimary : NUMBERING.universalPermanent;
        setState(s => ({ ...s, teeth: makeInitialTeeth(list) }));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.patientId]);

  // Autosave
  useEffect(() => { saveLocal(state); }, [state]);

  const orderedTeeth = useMemo(() => {
    const isPrimary = state.dentition === "primary";
    const universal = state.numbering === "universal";
    if (universal) {
      return isPrimary ? NUMBERING.universalPrimary : NUMBERING.universalPermanent;
    } else {
      return isPrimary ? NUMBERING.fdiPrimary : NUMBERING.fdiPermanent;
    }
  }, [state.dentition, state.numbering]);

  function pushUndo(prev: ChartState) {
    setUndoStack(s => [...s, prev]);
    setRedoStack([]);
  }

  function mutate(mutator: (draft: ChartState) => ChartState) {
    setState(prev => {
      const snapshot = JSON.parse(JSON.stringify(prev));
      const next = mutator(snapshot);
      next.updatedAt = nowISO();
      pushUndo(prev);
      return next;
    });
  }

  function handleSurfaceApply(toothId: string | number, surface: string) {
    const cond = CONDITION_LOOKUP[selectedCondition];
    mutate(draft => {
      const entry = draft.teeth[toothId] || EMPTY_TOOTH(toothId);
      if (cond.surface) {
        entry.surfaces[surface as keyof typeof entry.surfaces] = { conditionId: cond.id, note, by: clinician || "", at: nowISO() };
        entry.history.push({ scope: 'surface', surface, conditionId: cond.id, note, by: clinician || "", at: nowISO() });
      } else {
        entry.whole = cond.id;
        entry.history.push({ scope: 'whole', conditionId: cond.id, note, by: clinician || "", at: nowISO() });
      }
      draft.teeth[toothId] = entry;
      return draft;
    });
  }

  function handleWholeApply(toothId: string | number, conditionId: string) {
    mutate(draft => {
      const entry = draft.teeth[toothId] || EMPTY_TOOTH(toothId);
      entry.whole = conditionId;
      entry.history.push({ scope: 'whole', conditionId, note, by: clinician || "", at: nowISO() });
      draft.teeth[toothId] = entry;
      return draft;
    });
  }

  function handleClear(toothId: string | number) {
    mutate(draft => {
      draft.teeth[toothId] = EMPTY_TOOTH(toothId);
      return draft;
    });
  }

  function undo() {
    setUndoStack(prev => {
      if (!prev.length) return prev;
      setRedoStack(r => [...r, state]);
      const last = prev[prev.length - 1];
      setState(last);
      return prev.slice(0, -1);
    });
  }

  function redo() {
    setRedoStack(prev => {
      if (!prev.length) return prev;
      setUndoStack(u => [...u, state]);
      const last = prev[prev.length - 1];
      setState(last);
      return prev.slice(0, -1);
    });
  }

  async function exportPDF() {
    const node = chartRef.current;
    if (!node) return;
    const canvas = await html2canvas(node, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    // Fit image within page while preserving aspect ratio
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
    const w = imgWidth * ratio;
    const h = imgHeight * ratio;
    const x = (pageWidth - w) / 2;
    const y = (pageHeight - h) / 2;
    pdf.text(`Dental Chart – Patient: ${state.patientId} – ${new Date().toLocaleString()}`, 40, 30);
    pdf.addImage(imgData, 'PNG', x, y, w, h);
    pdf.save(`dental-chart-${state.patientId}.pdf`);
  }

  function splitUpperLower(list: (string | number)[]) {
    // For simplicity, split halves for universal; for FDI we already ordered as upper then lower
    if (state.numbering === 'universal') {
      if (state.dentition === 'primary') {
        const upper = list.slice(0, 10); // A..J
        const lower = list.slice(10);    // K..T
        return [upper, lower];
      } else {
        const upper = list.slice(0, 16); // 1..16
        const lower = list.slice(16);    // 17..32
        return [upper, lower];
      }
    } else {
      // FDI arrays already upper then lower in NUMBERING
      const upperLen = state.dentition === 'primary' ? 10 : 16;
      return [list.slice(0, upperLen), list.slice(upperLen)];
    }
  }

  const [upper, lower] = splitUpperLower(orderedTeeth);

  const filtered = useMemo(() => {
    if (!query) return orderedTeeth;
    const q = query.toString().toLowerCase();
    return orderedTeeth.filter(t => t.toString().toLowerCase().includes(q));
  }, [orderedTeeth, query]);

  return (
    <div className="w-full p-4 md:p-6 lg:p-8 bg-gradient-to-b from-background to-muted/20 text-foreground">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4">
        <div className="flex items-center gap-2 pr-3 mr-2 border-r">
          <Stethoscope className="w-5 h-5" />
          <TextInput placeholder="Patient ID" value={state.patientId} onChange={e => setState(s => ({ ...s, patientId: e.target.value }))} />
          <IconButton title="Save" onClick={() => saveChart(state)}><Save className="w-5 h-5" /></IconButton>
          <IconButton title="Load" onClick={async () => {
            const loaded = await loadChart(state.patientId);
            if (loaded) setState(loaded);
          }}><Upload className="w-5 h-5" /></IconButton>
        </div>

        <div className="flex items-center gap-2 pr-3 mr-2 border-r">
          <Settings className="w-5 h-5" />
          <Select value={state.dentition} onChange={(v) => setState(s => ({ ...s, dentition: v as "permanent" | "primary", teeth: makeInitialTeeth(v === 'primary' ? NUMBERING.universalPrimary : NUMBERING.universalPermanent) }))}>
            <option value="permanent">Permanent (1–32)</option>
            <option value="primary">Primary (A–T)</option>
          </Select>
          <Select value={state.numbering} onChange={(v) => setState(s => ({ ...s, numbering: v as "universal" | "fdi" }))}>
            <option value="universal">Universal</option>
            <option value="fdi">FDI</option>
          </Select>
        </div>

        <div className="flex items-center gap-2 pr-3 mr-2 border-r">
          <Search className="w-5 h-5" />
          <TextInput placeholder="Find tooth…" value={query} onChange={e => setQuery(e.target.value)} />
        </div>

        <div className="flex items-center gap-2 pr-3 mr-2 border-r">
          <StickyNote className="w-5 h-5" />
          <TextInput placeholder="Clinician (optional)" value={clinician} onChange={e => setClinician(e.target.value)} />
          <TextInput placeholder="Note (optional)" value={note} onChange={e => setNote(e.target.value)} />
        </div>

        <div className="flex items-center gap-2">
          <IconButton title="Undo" onClick={undo}><RotateCcw className="w-5 h-5" /></IconButton>
          <IconButton title="Redo" onClick={redo}><RotateCw className="w-5 h-5" /></IconButton>
          <IconButton title="Export PDF" onClick={exportPDF}><Download className="w-5 h-5" /></IconButton>
          <IconButton title="Print" onClick={() => window.print()}><Printer className="w-5 h-5" /></IconButton>
        </div>
      </div>

      {/* Condition Picker */}
      <div className="mb-3">
        <ConditionPicker selectedId={selectedCondition} setSelectedId={setSelectedCondition} />
      </div>

      {/* Legend */}
      <div className="mb-4"><Legend /></div>

      {/* Chart */}
      <div ref={chartRef} className="rounded-3xl border bg-background p-4 shadow-md">
        {/* Upper arch */}
        <div className="mb-4">
          <div className="text-sm font-medium mb-2">Upper Arch</div>
          <div className="grid grid-cols-8 md:grid-cols-16 gap-2">
            {upper.filter(t => filtered.includes(t)).map(t => (
              <ToothTile key={t}
                entry={state.teeth[t] || EMPTY_TOOTH(t)}
                selected={selectedTooth === t}
                onSelect={(id) => setSelectedTooth(id)}
                onSurfaceClick={(id, surf) => handleSurfaceApply(id, surf)}
              />
            ))}
          </div>
        </div>

        {/* Lower arch */}
        <div>
          <div className="text-sm font-medium mb-2">Lower Arch</div>
          <div className="grid grid-cols-8 md:grid-cols-16 gap-2">
            {lower.filter(t => filtered.includes(t)).map(t => (
              <ToothTile key={t}
                entry={state.teeth[t] || EMPTY_TOOTH(t)}
                selected={selectedTooth === t}
                onSelect={(id) => setSelectedTooth(id)}
                onSurfaceClick={(id, surf) => handleSurfaceApply(id, surf)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Selected tooth actions + history */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 p-4 rounded-2xl border bg-background shadow-sm">
          <div className="flex items-center gap-2 mb-3"><FileSignature className="w-5 h-5" /><span className="font-medium">Quick Actions</span></div>
          {selectedTooth ? (
            <div className="flex flex-wrap gap-2 items-center">
              {/* Whole-tooth quick actions */}
              {["extracted", "implant", "rct", "crown"].map(cid => (
                <button key={cid} onClick={() => handleWholeApply(selectedTooth, cid)}
                        className="px-3 py-2 rounded-xl border shadow-sm hover:bg-muted/50">
                  {CONDITION_LOOKUP[cid]?.label}
                </button>
              ))}
              <button onClick={() => handleClear(selectedTooth)} className="px-3 py-2 rounded-xl border shadow-sm hover:bg-muted/50">Clear Tooth</button>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Select a tooth to use quick actions.</div>
          )}
        </div>

        <div className="p-4 rounded-2xl border bg-background shadow-sm">
          <div className="flex items-center gap-2 mb-3"><HistoryIcon className="w-5 h-5" /><span className="font-medium">Tooth History</span></div>
          {selectedTooth ? (
            <div className="max-h-72 overflow-auto text-sm">
              {(state.teeth[selectedTooth]?.history || []).slice().reverse().map((h, idx) => (
                <div key={idx} className="flex items-start gap-2 py-1">
                  <span className="mt-0.5 inline-flex w-2 h-2 rounded-full" style={{ backgroundColor: CONDITION_LOOKUP[h.conditionId]?.color }} />
                  <div>
                    <div className="text-xs text-muted-foreground">{new Date(h.at).toLocaleString()} {h.by ? `· ${h.by}` : ""}</div>
                    <div>
                      <strong>{CONDITION_LOOKUP[h.conditionId]?.label}</strong> on <strong>{h.scope === 'surface' ? h.surface : 'Tooth'}</strong>
                      {h.note ? <> — <em className="text-muted-foreground">{h.note}</em></> : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Select a tooth to view its history.</div>
          )}
        </div>
      </div>

      {/* Footer meta */}
      <div className="mt-6 text-xs text-muted-foreground flex items-center justify-between">
        <div>Updated: {new Date(state.updatedAt).toLocaleString()}</div>
        <div>Tip: Click a surface to apply the selected condition; use Quick Actions for whole-tooth changes.</div>
      </div>
    </div>
  );
}