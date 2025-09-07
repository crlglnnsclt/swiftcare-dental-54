/*
 * Interactive Dental Chart Module – SwiftCare Integration
 * Built for the SwiftCare Dental Management System
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Download, History as HistoryIcon, RotateCcw, RotateCw, Save, Upload, FileSignature, Settings, Search, Stethoscope, StickyNote, Printer } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

function classNames(...xs) { return xs.filter(Boolean).join(" "); }

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

const EMPTY_TOOTH = (toothId) => ({
  toothId,
  surfaces: { M: null, D: null, B: null, L: null, O: null },
  whole: null,
  history: [],
});

const makeInitialTeeth = (list) => Object.fromEntries(list.map(t => [t, EMPTY_TOOTH(t)]));

const DEFAULT_CHART = /** @type {ChartState} */ ({
  patientId: "demo-patient",
  dentition: "permanent",
  numbering: "universal",
  teeth: makeInitialTeeth(NUMBERING.universalPermanent),
  updatedAt: nowISO(),
});

// -----------------------------
// Persistence (local + adapters)
// -----------------------------

const STORAGE_KEY = "dentalChart.v1";

function saveLocal(state) {
  localStorage.setItem(STORAGE_KEY + ":" + state.patientId, JSON.stringify(state));
}

function loadLocal(patientId) {
  const raw = localStorage.getItem(STORAGE_KEY + ":" + patientId);
  return raw ? JSON.parse(raw) : null;
}

async function saveChart(state) {
  saveLocal(state);
}
async function loadChart(patientId) {
  const fromLocal = loadLocal(patientId);
  return fromLocal || null;
}

// -----------------------------
// Small UI helpers
// -----------------------------

function Badge({ children }) {
  return <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs text-gray-700 bg-white/70 shadow-sm">{children}</span>;
}

function IconButton({ title, onClick, children }) {
  return (
    <button title={title} onClick={onClick} className="rounded-2xl border px-2.5 py-2 hover:bg-gray-50 active:scale-[0.98] transition shadow-sm">
      {children}
    </button>
  );
}

function Select({ value, onChange, children }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className="rounded-xl border px-3 py-2 shadow-sm bg-white">
      {children}
    </select>
  );
}

function TextInput(props) {
  return <input {...props} className={classNames("rounded-xl border px-3 py-2 shadow-sm bg-white", props.className)} />
}

// -----------------------------
// Tooth Surface Cell with SVG Tooth
// -----------------------------

function ToothSVG({ toothId, entry, selected, onSelect, onSurfaceClick }) {
  const surfaces = entry.surfaces;
  const isMissing = entry.whole === "extracted";

  const getFill = (surface) => {
    const mark = surfaces[surface];
    return mark ? CONDITION_LOOKUP[mark.conditionId]?.color : "#ffffff";
  };

  return (
    <motion.div
      layout
      onClick={() => onSelect(toothId)}
      className={classNames("p-1 rounded-xl border bg-white shadow-sm cursor-pointer", selected && "ring-2 ring-blue-400")}
    >
      <svg viewBox="0 0 50 60" className={classNames("w-12 h-14", isMissing ? "opacity-40" : "")}>
        {/* Crown top */}
        <path d="M5 20 Q25 0 45 20 L45 30 Q25 40 5 30 Z" fill={getFill("O")} stroke="#333" strokeWidth="1" onClick={(e) => { e.stopPropagation(); onSurfaceClick(toothId, "O"); }} />
        {/* Mesial */}
        <path d="M5 20 L5 30 Q25 40 25 20 Z" fill={getFill("M")} stroke="#333" strokeWidth="0.5" onClick={(e) => { e.stopPropagation(); onSurfaceClick(toothId, "M"); }} />
        {/* Distal */}
        <path d="M45 20 L45 30 Q25 40 25 20 Z" fill={getFill("D")} stroke="#333" strokeWidth="0.5" onClick={(e) => { e.stopPropagation(); onSurfaceClick(toothId, "D"); }} />
        {/* Buccal */}
        <path d="M5 20 Q25 0 45 20 Q25 25 5 20 Z" fill={getFill("B")} stroke="#333" strokeWidth="0.5" onClick={(e) => { e.stopPropagation(); onSurfaceClick(toothId, "B"); }} />
        {/* Lingual */}
        <path d="M5 30 Q25 40 45 30 Q25 35 5 30 Z" fill={getFill("L")} stroke="#333" strokeWidth="0.5" onClick={(e) => { e.stopPropagation(); onSurfaceClick(toothId, "L"); }} />
      </svg>
      <div className="text-xs text-center mt-1">{toothId}</div>
      {entry.whole && <div className="text-[10px] text-gray-500">{CONDITION_LOOKUP[entry.whole]?.label}</div>}
    </motion.div>
  );
}

function Legend({ selectedId, setSelectedId }) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      {CONDITIONS.map(c => (
        <button
          key={c.id}
          onClick={() => setSelectedId(c.id)}
          className={classNames(
            "flex items-center gap-1 px-2 py-1 border rounded-lg text-xs",
            selectedId === c.id ? "ring-2 ring-blue-400 bg-gray-50" : "hover:bg-gray-50"
          )}
        >
          <span className="inline-block w-4 h-4 border rounded" style={{ backgroundColor: c.color }} />
          <span className="text-gray-700">{c.label}</span>
        </button>
      ))}
    </div>
  );
}

function ConditionPicker({ selectedId, setSelectedId }) {
  return (
    <div className="flex flex-wrap gap-1">
      {CONDITIONS.map(c => (
        <button key={c.id} onClick={() => setSelectedId(c.id)}
          className={classNames("px-2 py-1 border rounded-xl text-sm", selectedId === c.id ? "ring-2 ring-blue-400" : "hover:bg-gray-50")}
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
  const [state, setState] = useState(() => DEFAULT_CHART);
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [selectedCondition, setSelectedCondition] = useState("caries");
  const [clinician, setClinician] = useState("");
  const [note, setNote] = useState("");
  const [query, setQuery] = useState("");

  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const chartRef = useRef(null);

  // Load on patient switch
  useEffect(() => {
    (async () => {
      const loaded = await loadChart(state.patientId);
      if (loaded) {
        setState(loaded);
      } else {
        const list = state.dentition === "primary" ? NUMBERING.universalPrimary : NUMBERING.universalPermanent;
        setState(s => ({ ...s, teeth: makeInitialTeeth(list) }));
      }
    })();
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

  function pushUndo(prev) {
    setUndoStack(s => [...s, prev]);
    setRedoStack([]);
  }

  function mutate(mutator) {
    setState(prev => {
      const snapshot = JSON.parse(JSON.stringify(prev));
      const next = mutator(snapshot);
      next.updatedAt = nowISO();
      pushUndo(prev);
      return next;
    });
  }

  function handleSurfaceApply(toothId, surface) {
    const cond = CONDITION_LOOKUP[selectedCondition];
    mutate(draft => {
      const entry = draft.teeth[toothId] || EMPTY_TOOTH(toothId);
      if (cond.surface) {
        entry.surfaces[surface] = { conditionId: cond.id, note, by: clinician || "", at: nowISO() };
        entry.history.push({ scope: 'surface', surface, conditionId: cond.id, note, by: clinician || "", at: nowISO() });
      } else {
        entry.whole = cond.id;
        entry.history.push({ scope: 'whole', conditionId: cond.id, note, by: clinician || "", at: nowISO() });
      }
      draft.teeth[toothId] = entry;
      return draft;
    });
  }

  function handleWholeApply(toothId, conditionId) {
    mutate(draft => {
      const entry = draft.teeth[toothId] || EMPTY_TOOTH(toothId);
      entry.whole = conditionId;
      entry.history.push({ scope: 'whole', conditionId, note, by: clinician || "", at: nowISO() });
      draft.teeth[toothId] = entry;
      return draft;
    });
  }

  function handleClear(toothId) {
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

  function splitUpperLower(list) {
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
    <div className="w-full p-4 md:p-6 lg:p-8 bg-gradient-to-b from-white to-slate-50 text-slate-900">
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
          <Select value={state.dentition} onChange={(v) => setState(s => ({ ...s, dentition: v, teeth: makeInitialTeeth(v === 'primary' ? NUMBERING.universalPrimary : NUMBERING.universalPermanent) }))}>
            <option value="permanent">Permanent (1–32)</option>
            <option value="primary">Primary (A–T)</option>
          </Select>
          <Select value={state.numbering} onChange={(v) => setState(s => ({ ...s, numbering: v }))}>
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
      <div className="mb-4"><Legend selectedId={selectedCondition} setSelectedId={setSelectedCondition} /></div>

      {/* Chart */}
      <div ref={chartRef} className="rounded-3xl border bg-white p-4 shadow-md">
        {/* Upper arch */}
        <div className="mb-4">
          <div className="text-sm font-medium mb-2">Upper Arch</div>
          <div className="grid grid-cols-8 md:grid-cols-16 gap-2">
            {upper.filter(t => filtered.includes(t)).map(t => (
              <ToothSVG
                key={t}
                toothId={t}
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
              <ToothSVG
                key={t}
                toothId={t}
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
        <div className="lg:col-span-2 p-4 rounded-2xl border bg-white shadow-sm">
          <div className="flex items-center gap-2 mb-3"><FileSignature className="w-5 h-5" /><span className="font-medium">Quick Actions</span></div>
          {selectedTooth ? (
            <div className="flex flex-wrap gap-2 items-center">
              {/* Whole-tooth quick actions */}
              {["extracted", "implant", "rct", "crown"].map(cid => (
                <button key={cid} onClick={() => handleWholeApply(selectedTooth, cid)}
                        className="px-3 py-2 rounded-xl border shadow-sm hover:bg-gray-50">
                  {CONDITION_LOOKUP[cid]?.label}
                </button>
              ))}
              <button onClick={() => handleClear(selectedTooth)} className="px-3 py-2 rounded-xl border shadow-sm hover:bg-gray-50">Clear Tooth</button>
            </div>
          ) : (
            <div className="text-sm text-gray-500">Select a tooth to use quick actions.</div>
          )}
        </div>

        <div className="p-4 rounded-2xl border bg-white shadow-sm">
          <div className="flex items-center gap-2 mb-3"><HistoryIcon className="w-5 h-5" /><span className="font-medium">Tooth History</span></div>
          {selectedTooth ? (
            <div className="max-h-72 overflow-auto text-sm">
              {(state.teeth[selectedTooth]?.history || []).slice().reverse().map((h, idx) => (
                <div key={idx} className="flex items-start gap-2 py-1">
                  <span className="mt-0.5 inline-flex w-2 h-2 rounded-full" style={{ backgroundColor: CONDITION_LOOKUP[h.conditionId]?.color }} />
                  <div>
                    <div className="text-xs text-gray-500">{new Date(h.at).toLocaleString()} {h.by ? `· ${h.by}` : ""}</div>
                    <div>
                      <strong>{CONDITION_LOOKUP[h.conditionId]?.label}</strong> on <strong>{h.scope === 'surface' ? h.surface : 'Tooth'}</strong>
                      {h.note ? <> — <em className="text-gray-600">{h.note}</em></> : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500">Select a tooth to view its history.</div>
          )}
        </div>
      </div>

      {/* Footer meta */}
      <div className="mt-6 text-xs text-gray-500 flex items-center justify-between">
        <div>Updated: {new Date(state.updatedAt).toLocaleString()}</div>
        <div>Tip: Click a surface to apply the selected condition; use Quick Actions for whole-tooth changes.</div>
      </div>
    </div>
  );
}

