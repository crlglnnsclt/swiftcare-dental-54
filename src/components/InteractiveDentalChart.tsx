/*
 * Interactive Dental Chart Module – SwiftCare Integration
 * With Supabase persistence
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Download, History as HistoryIcon, RotateCcw, RotateCw, Save, Upload,
  FileSignature, Settings, Search, Stethoscope, StickyNote, Printer
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

const NUMBERING = {
  universalPermanent: Array.from({ length: 32 }, (_, i) => i + 1), // 1..32
  universalPrimary: ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T"],
  fdiPermanent: [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28,48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38],
  fdiPrimary: [55,54,53,52,51,61,62,63,64,65,85,84,83,82,81,71,72,73,74,75],
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

const makeInitialTeeth = (list) => Object.fromEntries(list.map(t => [t, EMPTY_TOOTH(t)]));

const DEFAULT_CHART = {
  patientId: "demo-patient",
  dentition: "permanent",
  numbering: "universal",
  teeth: makeInitialTeeth(NUMBERING.universalPermanent),
  updatedAt: nowISO(),
};

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
function ToothSVG({ toothId, entry, selected, onSelect, onSurfaceClick }) {
  const surfaces = entry.surfaces;
  const isMissing = entry.whole === "extracted";
  const getFill = (surface) =>
    surfaces[surface] ? CONDITION_LOOKUP[surfaces[surface].conditionId]?.color : "#ffffff";

  return (
    <motion.div
      layout
      onClick={() => onSelect(toothId)}
      className={classNames(
        "p-1 rounded-xl border bg-white shadow-sm cursor-pointer",
        selected && "ring-2 ring-blue-400"
      )}
    >
      <svg viewBox="0 0 50 60" className={classNames("w-12 h-14", isMissing ? "opacity-40" : "")}>
        {/* Crown top */}
        <path d="M5 20 Q25 0 45 20 L45 30 Q25 40 5 30 Z"
          fill={getFill("O")} stroke="#333" strokeWidth="1"
          onClick={(e) => { e.stopPropagation(); onSurfaceClick(toothId, "O"); }} />
        {/* Mesial */}
        <path d="M5 20 L5 30 Q25 40 25 20 Z"
          fill={getFill("M")} stroke="#333" strokeWidth="0.5"
          onClick={(e) => { e.stopPropagation(); onSurfaceClick(toothId, "M"); }} />
        {/* Distal */}
        <path d="M45 20 L45 30 Q25 40 25 20 Z"
          fill={getFill("D")} stroke="#333" strokeWidth="0.5"
          onClick={(e) => { e.stopPropagation(); onSurfaceClick(toothId, "D"); }} />
        {/* Buccal */}
        <path d="M5 20 Q25 0 45 20 Q25 25 5 20 Z"
          fill={getFill("B")} stroke="#333" strokeWidth="0.5"
          onClick={(e) => { e.stopPropagation(); onSurfaceClick(toothId, "B"); }} />
        {/* Lingual */}
        <path d="M5 30 Q25 40 45 30 Q25 35 5 30 Z"
          fill={getFill("L")} stroke="#333" strokeWidth="0.5"
          onClick={(e) => { e.stopPropagation(); onSurfaceClick(toothId, "L"); }} />
      </svg>
      <div className="text-xs text-center mt-1">{toothId}</div>
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
        const list = state.dentition === "primary"
          ? NUMBERING.universalPrimary
          : NUMBERING.universalPermanent;
        setState(s => ({ ...s, teeth: makeInitialTeeth(list) }));
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

  function handleSurfaceApply(toothId, surface) {
    const cond = CONDITION_LOOKUP[selectedCondition];
    mutate(draft => {
      const entry = draft.teeth[toothId] || EMPTY_TOOTH(toothId);
      if (cond.surface) {
        entry.surfaces[surface] = { conditionId: cond.id, note, by: clinician || "", at: nowISO() };
        entry.history.push({ scope: "surface", surface, conditionId: cond.id, note, by: clinician || "", at: nowISO() });
      } else {
        entry.whole = cond.id;
        entry.history.push({ scope: "whole", conditionId: cond.id, note, by: clinician || "", at: nowISO() });
      }
      draft.teeth[toothId] = entry;
      return draft;
    });
  }

  function handleWholeApply(toothId, conditionId) {
    mutate(draft => {
      const entry = draft.teeth[toothId] || EMPTY_TOOTH(toothId);
      entry.whole = conditionId;
      entry.history.push({ scope: "whole", conditionId, note, by: clinician || "", at: nowISO() });
      draft.teeth[toothId] = entry;
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

  const orderedTeeth = useMemo(() => {
    const isPrimary = state.dentition === "primary";
    const universal = state.numbering === "universal";
    if (universal) {
      return isPrimary ? NUMBERING.universalPrimary : NUMBERING.universalPermanent;
    } else {
      return isPrimary ? NUMBERING.fdiPrimary : NUMBERING.fdiPermanent;
    }
  }, [state.dentition, state.numbering]);

  function splitUpperLower(list) {
    if (state.numbering === "universal") {
      if (state.dentition === "primary") return [list.slice(0, 10), list.slice(10)];
      return [list.slice(0, 16), list.slice(16)];
    }
    const upperLen = state.dentition === "primary" ? 10 : 16;
    return [list.slice(0, upperLen), list.slice(upperLen)];
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
          <TextInput placeholder="Patient ID"
            value={state.patientId}
            onChange={e => setState(s => ({ ...s, patientId: e.target.value }))} />
          <IconButton title="Save" onClick={() => saveChart(state)}><Save className="w-5 h-5" /></IconButton>
          <IconButton title="Load" onClick={async () => {
            const loaded = await loadChart(state.patientId);
            if (loaded) setState(loaded);
          }}><Upload className="w-5 h-5" /></IconButton>
        </div>
        <div className="flex items-center gap-2 pr-3 mr-2 border-r">
          <Settings className="w-5 h-5" />
          <select value={state.dentition} onChange={e =>
            setState(s => ({
              ...s,
              dentition: e.target.value,
              teeth: makeInitialTeeth(e.target.value === "primary" ? NUMBERING.universalPrimary : NUMBERING.universalPermanent),
            }))
          } className="rounded-xl border px-3 py-2 shadow-sm bg-white">
            <option value="permanent">Permanent (1–32)</option>
            <option value="primary">Primary (A–T)</option>
          </select>
          <select value={state.numbering} onChange={e => setState(s => ({ ...s, numbering: e.target.value }))}
            className="rounded-xl border px-3 py-2 shadow-sm bg-white">
            <option value="universal">Universal</option>
            <option value="fdi">FDI</option>
          </select>
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
          <IconButton title="Undo" onClick={() => setState(undoStack.pop() || state)}><RotateCcw className="w-5 h-5" /></IconButton>
          <IconButton title="Redo" onClick={() => setState(redoStack.pop() || state)}><RotateCw className="w-5 h-5" /></IconButton>
          <IconButton title="Export PDF" onClick={exportPDF}><Download className="w-5 h-5" /></IconButton>
          <IconButton title="Print" onClick={() => window.print()}><Printer className="w-5 h-5" /></IconButton>
        </div>
      </div>

      {/* Chart */}
      <div ref={chartRef} className="rounded-3xl border bg-white p-4 shadow-md">
        <div className="mb-4">
          <div className="text-sm font-medium mb-2">Upper Arch</div>
          <div className="grid grid-cols-8 md:grid-cols-16 gap-2">
            {upper.filter(t => filtered.includes(t)).map(t => (
              <ToothSVG key={t}
                toothId={t}
                entry={state.teeth[t] || EMPTY_TOOTH(t)}
                selected={selectedTooth === t}
                onSelect={id => setSelectedTooth(id)}
                onSurfaceClick={(id, surf) => handleSurfaceApply(id, surf)} />
            ))}
          </div>
        </div>
        <div>
          <div className="text-sm font-medium mb-2">Lower Arch</div>
          <div className="grid grid-cols-8 md:grid-cols-16 gap-2">
            {lower.filter(t => filtered.includes(t)).map(t => (
              <ToothSVG key={t}
                toothId={t}
                entry={state.teeth[t] || EMPTY_TOOTH(t)}
                selected={selectedTooth === t}
                onSelect={id => setSelectedTooth(id)}
                onSurfaceClick={(id, surf) => handleSurfaceApply(id, surf)} />
            ))}
          </div>
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
                <Button key={c.id}
                  onClick={() => setSelectedCondition(c.id)}
                  variant={selectedCondition === c.id ? "default" : "outline"}
                  className="rounded-xl flex items-center gap-1 px-2 py-1">
                  <span>{c.icon}</span>
                  <span className="text-xs">{c.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tooth History */}
        <Card className="rounded-2xl shadow-md">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 mb-3">
              <HistoryIcon className="w-5 h-5" />
              <h3 className="text-sm font-medium">Tooth History</h3>
            </div>
            {selectedTooth ? (
              <div className="text-xs max-h-60 overflow-y-auto space-y-1">
                {(state.teeth[selectedTooth]?.history || []).map((h, i) => (
                  <div key={i} className="border rounded-lg px-2 py-1">
                    <div><b>{h.conditionId}</b> {h.scope === "surface" && <span>({h.surface})</span>}</div>
                    <div className="text-gray-600">{h.note}</div>
                    <div className="text-gray-400">{h.by} • {new Date(h.at).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-gray-500">Select a tooth to view history</div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="rounded-2xl shadow-md">
          <CardContent className="p-3 md:p-4 flex flex-col gap-2">
            <Button onClick={() => selectedTooth && handleWholeApply(selectedTooth, selectedCondition)} className="rounded-xl">
              Apply to Whole Tooth
            </Button>
            <Button onClick={() => saveChart(state)} className="rounded-xl" variant="outline">
              Save to Supabase
            </Button>
            <Button onClick={async () => {
              const loaded = await loadChart(state.patientId);
              if (loaded) setState(loaded);
            }} className="rounded-xl" variant="outline">
              Load from Supabase
            </Button>
            <Button onClick={exportPDF} className="rounded-xl" variant="outline">
              Download PDF
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
