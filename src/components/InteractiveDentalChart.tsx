/*
 * Interactive Dental Chart Module – SwiftCare Integration
 * With Supabase persistence, quadrant grouping, stable IDs, legend, and UI labels in history
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Download, History as HistoryIcon, RotateCcw, RotateCw, Save, Upload,
  FileSignature, Settings, Search, Stethoscope, StickyNote, Printer, Info
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@supabase/supabase-js";

// -----------------------------
// Supabase
// -----------------------------
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// -----------------------------
// Constants & Utilities
// -----------------------------
const SURFACES = ["M", "D", "B", "L", "O"]; // Mesial, Distal, Buccal, Lingual, Occlusal

// Quadrant label sets for display (Universal / FDI; Permanent / Primary)
const QUADRANTS = {
  permanent: {
    universal: {
      UR: ["1","2","3","4","5","6","7","8"],
      UL: ["9","10","11","12","13","14","15","16"],
      LL: ["17","18","19","20","21","22","23","24"],
      LR: ["25","26","27","28","29","30","31","32"],
    },
    fdi: {
      UR: ["18","17","16","15","14","13","12","11"],
      UL: ["21","22","23","24","25","26","27","28"],
      LL: ["38","37","36","35","34","33","32","31"],
      LR: ["48","47","46","45","44","43","42","41"],
    },
  },
  primary: {
    universal: {
      UR: ["A","B","C","D","E"],
      UL: ["F","G","H","I","J"],
      LL: ["K","L","M","N","O"],
      LR: ["P","Q","R","S","T"],
    },
    fdi: {
      UR: ["55","54","53","52","51"],
      UL: ["61","62","63","64","65"],
      LL: ["75","74","73","72","71"],
      LR: ["85","84","83","82","81"],
    },
  },
};

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

const EMPTY_TOOTH = (toothId) => ({
  toothId,
  surfaces: { M: null, D: null, B: null, L: null, O: null },
  whole: null,
  history: [],
});

// Default chart shell (we’ll fill teeth lazily as they’re touched)
const DEFAULT_CHART = {
  patientId: "demo-patient",
  dentition: "permanent",   // "permanent" | "primary"
  numbering: "universal",   // "universal" | "fdi"
  teeth: {},                // keys are P1..P32 or D1..D20
  updatedAt: nowISO(),
};

// -----------------------------
// Stable internal IDs (persisted keys)
// P1..P32 (permanent) and D1..D20 (primary)
// -----------------------------
function getInternalId(dentition, quadrant, idx) {
  if (dentition === "primary") {
    // UR: 0..4 -> D1..D5, UL: D6..D10, LL: D11..D15, LR: D16..D20
    const base = quadrant === "UR" ? 0 : quadrant === "UL" ? 5 : quadrant === "LL" ? 10 : 15;
    return `D${base + idx + 1}`;
  } else {
    // UR: 0..7 -> P1..P8, UL: P9..P16, LL: P17..P24, LR: P25..P32
    const base = quadrant === "UR" ? 0 : quadrant === "UL" ? 8 : quadrant === "LL" ? 16 : 24;
    return `P${base + idx + 1}`;
  }
}

// Recover quadrant + index from internal ID (so we can map to current display label)
function internalIdToQuadrantIndex(internalId) {
  const kind = internalId[0]; // 'P' or 'D'
  const n = parseInt(internalId.slice(1), 10);
  if (kind === "P") {
    if (n >= 1 && n <= 8)  return { quadrant: "UR", idx: n - 1 };
    if (n >= 9 && n <= 16) return { quadrant: "UL", idx: n - 9 };
    if (n >= 17 && n <= 24) return { quadrant: "LL", idx: n - 17 };
    if (n >= 25 && n <= 32) return { quadrant: "LR", idx: n - 25 };
  } else if (kind === "D") {
    if (n >= 1 && n <= 5)   return { quadrant: "UR", idx: n - 1 };
    if (n >= 6 && n <= 10)  return { quadrant: "UL", idx: n - 6 };
    if (n >= 11 && n <= 15) return { quadrant: "LL", idx: n - 11 };
    if (n >= 16 && n <= 20) return { quadrant: "LR", idx: n - 16 };
  }
  return null;
}

// Get the UI label (Universal/FDI) for a given internal ID under current settings
function internalIdToUILabel(internalId, dentition, numbering) {
  const qi = internalIdToQuadrantIndex(internalId);
  if (!qi) return internalId;
  const labels = QUADRANTS[dentition]?.[numbering]?.[qi.quadrant] || [];
  const label = labels[qi.idx];
  return label ?? internalId;
}

// -----------------------------
// Persistence (Supabase)
// -----------------------------
async function saveChart(state) {
  const { error } = await supabase.from("dental_charts").upsert([
    {
      patient_id: state.patientId,
      chart: state,
      updated_at: new Date().toISOString(),
    },
  ]);
  if (error) console.error("Supabase save error:", error.message);
}

async function loadChart(patientId) {
  const { data, error } = await supabase
    .from("dental_charts")
    .select("chart")
    .eq("patient_id", patientId)
    .single();

  if (error) {
    console.error("Supabase load error:", error.message);
    return null;
  }
  return data?.chart || null;
}

// -----------------------------
// UI Helpers
// -----------------------------
function TextInput(props) {
  return (
    <input
      {...props}
      className={classNames("rounded-xl border px-3 py-2 shadow-sm bg-white", props.className)}
    />
  );
}

function IconButton({ title, onClick, children }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="rounded-2xl border px-2.5 py-2 hover:bg-gray-50 active:scale-[0.98] transition shadow-sm"
    >
      {children}
    </button>
  );
}

// -----------------------------
// Tooth Component
// -----------------------------
function ToothSVG({ label, internalId, entry, selected, onSelect, onSurfaceClick }) {
  const surfaces = entry.surfaces;
  const isMissing = entry.whole === "extracted";
  const getFill = (surface) =>
    surfaces[surface] ? CONDITION_LOOKUP[surfaces[surface].conditionId]?.color : "#ffffff";

  return (
    <motion.div
      layout
      onClick={() => onSelect(internalId)}
      className={classNames(
        "p-1 rounded-xl border bg-white shadow-sm cursor-pointer",
        selected && "ring-2 ring-blue-400"
      )}
    >
      <svg viewBox="0 0 50 60" className={classNames("w-12 h-14", isMissing ? "opacity-40" : "")}>
        {/* Occlusal / Incisal */}
        <path d="M5 20 Q25 0 45 20 L45 30 Q25 40 5 30 Z"
          fill={getFill("O")} stroke="#333" strokeWidth="1"
          onClick={(e) => { e.stopPropagation(); onSurfaceClick(internalId, "O"); }} />
        {/* Mesial */}
        <path d="M5 20 L5 30 Q25 40 25 20 Z"
          fill={getFill("M")} stroke="#333" strokeWidth="0.5"
          onClick={(e) => { e.stopPropagation(); onSurfaceClick(internalId, "M"); }} />
        {/* Distal */}
        <path d="M45 20 L45 30 Q25 40 25 20 Z"
          fill={getFill("D")} stroke="#333" strokeWidth="0.5"
          onClick={(e) => { e.stopPropagation(); onSurfaceClick(internalId, "D"); }} />
        {/* Buccal */}
        <path d="M5 20 Q25 0 45 20 Q25 25 5 20 Z"
          fill={getFill("B")} stroke="#333" strokeWidth="0.5"
          onClick={(e) => { e.stopPropagation(); onSurfaceClick(internalId, "B"); }} />
        {/* Lingual */}
        <path d="M5 30 Q25 40 45 30 Q25 35 5 30 Z"
          fill={getFill("L")} stroke="#333" strokeWidth="0.5"
          onClick={(e) => { e.stopPropagation(); onSurfaceClick(internalId, "L"); }} />
      </svg>
      <div className="text-xs text-center mt-1">{label}</div>
      {entry.whole && (
        <div className="text-[10px] text-gray-500">{CONDITION_LOOKUP[entry.whole]?.label}</div>
      )}
    </motion.div>
  );
}

// -----------------------------
// Main Component
// -----------------------------
export default function InteractiveDentalChart() {
  const [state, setState] = useState(() => DEFAULT_CHART);
  const [selectedTooth, setSelectedTooth] = useState(null); // stores internalId (P#/D#)
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
        setState(s => ({ ...s, teeth: {} }));
      }
    })();
  }, [state.patientId]);

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

  function handleSurfaceApply(internalId, surface) {
    const cond = CONDITION_LOOKUP[selectedCondition];
    mutate(draft => {
      const entry = draft.teeth[internalId] || EMPTY_TOOTH(internalId);
      if (cond.surface) {
        entry.surfaces[surface] = { conditionId: cond.id, note, by: clinician || "", at: nowISO() };
        entry.history.push({ scope: "surface", surface, conditionId: cond.id, note, by: clinician || "", at: nowISO() });
      } else {
        entry.whole = cond.id;
        entry.history.push({ scope: "whole", conditionId: cond.id, note, by: clinician || "", at: nowISO() });
      }
      draft.teeth[internalId] = entry;
      return draft;
    });
  }

  function handleWholeApply(internalId, conditionId) {
    mutate(draft => {
      const entry = draft.teeth[internalId] || EMPTY_TOOTH(internalId);
      entry.whole = conditionId;
      entry.history.push({ scope: "whole", conditionId, note, by: clinician || "", at: nowISO() });
      draft.teeth[internalId] = entry;
      return draft;
    });
  }

  async function exportPDF() {
    const node = chartRef.current;
    if (!node) return;
    const canvas = await html2canvas(node, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
    const w = canvas.width * ratio;
    const h = canvas.height * ratio;
    const x = (pageWidth - w) / 2;
    const y = (pageHeight - h) / 2;
    pdf.text(`Dental Chart – Patient: ${state.patientId} – ${new Date().toLocaleString()}`, 40, 30);
    pdf.addImage(imgData, "PNG", x, y, w, h);
    pdf.save(`dental-chart-${state.patientId}.pdf`);
  }

  // Current quadrant label set for display
  const quadrants = QUADRANTS[state.dentition][state.numbering];

  // Query filter
  const filteredQuery = query.trim().toLowerCase();

  // Helper to render a quadrant block
  const QuadrantBlock = ({ quadrantKey }) => {
    const labels = quadrants[quadrantKey];
    const isPrimary = state.dentition === "primary";
    const cols = isPrimary ? "grid-cols-5" : "grid-cols-8";

    return (
      <div>
        <div className="text-sm font-medium text-center mb-2">{quadrantKey}</div>
        <div className={`grid ${cols} gap-2 justify-items-center`}>
          {labels.map((label, idx) => {
            if (filteredQuery && !label.toString().toLowerCase().includes(filteredQuery)) return null;
            const internalId = getInternalId(state.dentition, quadrantKey, idx);
            const entry = state.teeth[internalId] || EMPTY_TOOTH(internalId);
            return (
              <ToothSVG
                key={internalId}
                label={label}
                internalId={internalId}
                entry={entry}
                selected={selectedTooth === internalId}
                onSelect={setSelectedTooth}
                onSurfaceClick={handleSurfaceApply}
              />
            );
          })}
        </div>
      </div>
    );
  };

  // Build a human-readable label for the selected tooth in history panel
  const selectedToothUiLabel = useMemo(() => {
    if (!selectedTooth) return null;
    const qi = internalIdToQuadrantIndex(selectedTooth);
    const uiLabel = internalIdToUILabel(selectedTooth, state.dentition, state.numbering);
    const quadrant = qi?.quadrant ?? "";
    return `${quadrant ? quadrant + ": " : ""}${uiLabel} (${selectedTooth})`;
  }, [selectedTooth, state.dentition, state.numbering]);

  return (
    <div className="w-full p-4 md:p-6 lg:p-8 bg-gradient-to-b from-white to-slate-50 text-slate-900">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4">
        <div className="flex items-center gap-2 pr-3 mr-2 border-r">
          <Stethoscope className="w-5 h-5" />
          <TextInput
            placeholder="Patient ID"
            value={state.patientId}
            onChange={e => setState(s => ({ ...s, patientId: e.target.value }))}
          />
          <IconButton title="Save" onClick={() => saveChart(state)}>
            <Save className="w-5 h-5" />
          </IconButton>
          <IconButton
            title="Load"
            onClick={async () => {
              const loaded = await loadChart(state.patientId);
              if (loaded) setState(loaded);
            }}
          >
            <Upload className="w-5 h-5" />
          </IconButton>
        </div>

        <div className="flex items-center gap-2 pr-3 mr-2 border-r">
          <Settings className="w-5 h-5" />
          <select
            value={state.dentition}
            onChange={e => setState(s => ({ ...s, dentition: e.target.value }))}
            className="rounded-xl border px-3 py-2 shadow-sm bg-white"
          >
            <option value="permanent">Permanent (1–32)</option>
            <option value="primary">Primary (A–T)</option>
          </select>
          <select
            value={state.numbering}
            onChange={e => setState(s => ({ ...s, numbering: e.target.value }))}
            className="rounded-xl border px-3 py-2 shadow-sm bg-white"
          >
            <option value="universal">Universal</option>
            <option value="fdi">FDI</option>
          </select>
        </div>

        <div className="flex items-center gap-2 pr-3 mr-2 border-r">
          <Search className="w-5 h-5" />
          <TextInput
            placeholder="Find tooth…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 pr-3 mr-2 border-r">
          <StickyNote className="w-5 h-5" />
          <TextInput
            placeholder="Clinician (optional)"
            value={clinician}
            onChange={e => setClinician(e.target.value)}
          />
          <TextInput
            placeholder="Note (optional)"
            value={note}
            onChange={e => setNote(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <IconButton title="Undo" onClick={() => setState(undoStack.pop() || state)}>
            <RotateCcw className="w-5 h-5" />
          </IconButton>
          <IconButton title="Redo" onClick={() => setState(redoStack.pop() || state)}>
            <RotateCw className="w-5 h-5" />
          </IconButton>
          <IconButton title="Export PDF" onClick={exportPDF}>
            <Download className="w-5 h-5" />
          </IconButton>
          <IconButton title="Print" onClick={() => window.print()}>
            <Printer className="w-5 h-5" />
          </IconButton>
        </div>
      </div>

      {/* Chart */}
      <div ref={chartRef} className="rounded-3xl border bg-white p-4 shadow-md">
        {/* Top row: UR & UL */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <QuadrantBlock quadrantKey="UR" />
          <QuadrantBlock quadrantKey="UL" />
        </div>
        {/* Bottom row: LL & LR */}
        <div className="grid grid-cols-2 gap-4">
          <QuadrantBlock quadrantKey="LL" />
          <QuadrantBlock quadrantKey="LR" />
        </div>
      </div>

      {/* Sidebar */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Condition Palette */}
        <Card className="rounded-2xl shadow-md">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileSignature className="w-5 h-5" />
              <h3 className="text-sm font-medium">Conditions</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {CONDITIONS.map(c => (
                <Button
                  key={c.id}
                  onClick={() => setSelectedCondition(c.id)}
                  variant={selectedCondition === c.id ? "default" : "outline"}
                  className="rounded-xl flex items-center gap-1 px-2 py-1"
                >
                  <span>{c.icon}</span>
                  <span className="text-xs">{c.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tooth History (shows UI label + internal ID) */}
        <Card className="rounded-2xl shadow-md">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 mb-3">
              <HistoryIcon className="w-5 h-5" />
              <h3 className="text-sm font-medium">Tooth History</h3>
            </div>
            {selectedTooth ? (
              <>
                <div className="text-xs mb-2">
                  <span className="font-medium">{selectedToothUiLabel}</span>
                </div>
                <div className="text-xs max-h-60 overflow-y-auto space-y-1">
                  {(state.teeth[selectedTooth]?.history || []).map((h, i) => (
                    <div key={i} className="border rounded-lg px-2 py-1">
                      <div>
                        <b>{CONDITION_LOOKUP[h.conditionId]?.label || h.conditionId}</b>
                        {h.scope === "surface" && <span> ({h.surface})</span>}
                      </div>
                      {h.note && <div className="text-gray-600">{h.note}</div>}
                      <div className="text-gray-400">
                        {(h.by || "").trim()} {h.by ? "• " : ""}{new Date(h.at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-xs text-gray-500">Select a tooth to view history</div>
            )}
          </CardContent>
        </Card>

        {/* Legend + Actions */}
        <div className="flex flex-col gap-4">
          {/* Legend Panel */}
          <Card className="rounded-2xl shadow-md">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-5 h-5" />
                <h3 className="text-sm font-medium">Legend</h3>
              </div>
              <div className="text-xs space-y-2">
                <div><b>P#</b> → Permanent Tooth (1–32)</div>
                <div><b>D#</b> → Deciduous / Primary Tooth (1–20)</div>
                <div><b>Universal</b> → 1–32 / A–T display labels</div>
                <div><b>FDI</b> → 11–48 / 51–85 display labels</div>
                <div className="text-gray-500">* Stored IDs are always P#/D# (stable across views)</div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="rounded-2xl shadow-md">
            <CardContent className="p-3 md:p-4 flex flex-col gap-2">
              <Button
                onClick={() => selectedTooth && handleWholeApply(selectedTooth, selectedCondition)}
                className="rounded-xl"
              >
                Apply to Whole Tooth
              </Button>
              <Button onClick={() => saveChart(state)} className="rounded-xl" variant="outline">
                Save to Supabase
              </Button>
              <Button
                onClick={async () => {
                  const loaded = await loadChart(state.patientId);
                  if (loaded) setState(loaded);
                }}
                className="rounded-xl"
                variant="outline"
              >
                Load from Supabase
              </Button>
              <Button onClick={exportPDF} className="rounded-xl" variant="outline">
                Download PDF
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
