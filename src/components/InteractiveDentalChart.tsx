/*
 * Interactive Dental Chart Module – SwiftCare Integration
 * Built for the SwiftCare Dental Management System
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

  // Split helper (upper vs lower arch)
  function split(teethArr) {
    return [teethArr.slice(0, 16), teethArr.slice(16, 32)];
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold text-center">Interactive Dental Chart</h2>

      {/* Chart container for PDF export */}
      <div ref={chartRef}>
        <Card>
          <CardContent className="flex flex-col items-center space-y-6 p-6">
            {/* Upper arch */}
            <div className="flex justify-center space-x-1">
              {split(Object.keys(state.teeth))[0].map((toothId) => (
                <Tooth
                  key={toothId}
                  number={toothId}
                  data={state.teeth[toothId]}
                  onSelectSurface={(t, s) => handleSurfaceApply(t, s, activeCondition)}
                  onSelectTooth={(t) => handleWholeApply(t, activeCondition)}
                />
              ))}
            </div>
            {/* Lower arch */}
            <div className="flex justify-center space-x-1">
              {split(Object.keys(state.teeth))[1].map((toothId) => (
                <Tooth
                  key={toothId}
                  number={toothId}
                  data={state.teeth[toothId]}
                  onSelectSurface={(t, s) => handleSurfaceApply(t, s, activeCondition)}
                  onSelectTooth={(t) => handleWholeApply(t, activeCondition)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Legend (interactive) */}
      <div className="flex flex-wrap justify-center gap-4 border-t pt-4">
        {[
          { label: "Healthy", id: "healthy", color: "bg-white border border-gray-400" },
          { label: "Caries", id: "caries", color: "bg-red-400" },
          { label: "Filling", id: "filling", color: "bg-blue-400" },
          { label: "Crown", id: "crown", color: "bg-yellow-400" },
          { label: "Extracted", id: "extracted", color: "bg-gray-400" },
          { label: "Implant", id: "implant", color: "bg-green-400" },
        ].map(({ label, id, color }) => (
          <div
            key={id}
            onClick={() => setActiveCondition(id)}
            className={`flex items-center cursor-pointer space-x-2 hover:scale-105 transition ${
              activeCondition === id ? "ring-2 ring-indigo-500 rounded" : ""
            }`}
          >
            <div className={`w-5 h-5 rounded ${color}`} />
            <span className="text-sm">{label}</span>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-3">
        <Button onClick={undo} disabled={!undoStack.length}>
          Undo
        </Button>
        <Button onClick={redo} disabled={!redoStack.length}>
          Redo
        </Button>
        <Button onClick={exportPDF}>Export PDF</Button>
        <Button onClick={() => handleClear(selectedTooth)} disabled={!selectedTooth}>
          Clear Tooth
        </Button>
      </div>
    </div>
  );
}

