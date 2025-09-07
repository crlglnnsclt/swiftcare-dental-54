/**
 * Interactive Dental Chart Module – SwiftCare Integration
 * Curved odontogram + Supabase persistence + timeline
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import {
  Download, History as HistoryIcon, RotateCcw, RotateCw, Save, Upload,
  FileSignature, Settings, Search, Stethoscope, StickyNote, Printer
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// -----------------------------
// Supabase client (Vite env)
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// -----------------------------
// Constants & Utilities
const SURFACES = ["M", "D", "B", "L", "O"]; // Mesial, Distal, Buccal, Lingual, Occlusal

const NUMBERING = {
  universalPermanent: Array.from({ length: 32 }, (_, i) => i + 1),
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

// -----------------------------
// Data model helpers
const EMPTY_TOOTH = (toothId) => ({
  toothId,
  surfaces: { M: null, D: null, B: null, L: null, O: null },
  whole: null,
  history: [],
});
const makeInitialTeeth = (list) => Object.fromEntries(list.map(t => [t, EMPTY_TOOTH(t)]));

const DEFAULT_CHART = {
  patientId: "demo-patient",
  patientName: "Demo Patient",
  dentition: "permanent", // "primary" for A-T
  numbering: "universal", // or "fdi"
  teeth: makeInitialTeeth(NUMBERING.universalPermanent),
  updatedAt: nowISO(),
};

// -----------------------------
// Persistence (Supabase table: dental_charts with columns patient_id text unique, chart jsonb)
async function saveChart(state) {
  try {
    const { error } = await supabase.from("dental_charts").upsert([
      { patient_id: state.patientId, chart: state, updated_at: new Date().toISOString() }
    ]);
    if (error) throw error;
    // console.log("Chart saved");
  } catch (err) {
    console.error("saveChart error:", err);
  }
}

async function loadChart(patientId) {
  try {
    const { data, error } = await supabase
      .from("dental_charts")
      .select("chart")
      .eq("patient_id", patientId)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null; // single not found in some setups
      // console.warn("loadChart supabase error (fall back to null):", error);
      return null;
    }
    return data?.chart || null;
  } catch (err) {
    console.error("loadChart error:", err);
    return null;
  }
}

// -----------------------------
// Small UI helpers
function TextInput(props) {
  return <input {...props} className={classNames("rounded-xl border px-3 py-2 shadow-sm bg-white", props.className)} />;
}
function IconButton({ title, onClick, children }) {
  return <button title={title} onClick={onClick} className="rounded-2xl border px-2.5 py-2 hover:bg-gray-50 active:scale-[0.98] transition shadow-sm">{children}</button>;
}

// -----------------------------
// ToothSVG - same shaded-surface visual, clickable surface handlers
function ToothSVG({ toothId, entry, selected, onSelect, onSurfaceClick }) {
  const surfaces = entry?.surfaces || { M:null,D:null,B:null,L:null,O:null };
  const isMissing = entry?.whole === "extracted";
  const getFill = (surface) => {
    const mark = surfaces[surface];
    return mark ? CONDITION_LOOKUP[mark.conditionId]?.color : "#ffffff";
  };

  return (
    <motion.div layout onClick={() => onSelect(toothId)} className={classNames("w-[56px] flex flex-col items-center cursor-pointer", selected ? "ring-2 ring-indigo-400 rounded-md" : "")}>
      <svg viewBox="0 0 50 60" className={classNames("w-12 h-14", isMissing ? "opacity-40" : "")} onClick={e=>e.stopPropagation()}>
        <path d="M5 20 Q25 0 45 20 L45 30 Q25 40 5 30 Z" fill={getFill("O")} stroke="#333" strokeWidth="1" onClick={() => onSurfaceClick(toothId,"O")} />
        <path d="M5 20 L5 30 Q25 40 25 20 Z" fill={getFill("M")} stroke="#333" strokeWidth="0.5" onClick={() => onSurfaceClick(toothId,"M")} />
        <path d="M45 20 L45 30 Q25 40 25 20 Z" fill={getFill("D")} stroke="#333" strokeWidth="0.5" onClick={() => onSurfaceClick(toothId,"D")} />
        <path d="M5 20 Q25 0 45 20 Q25 25 5 20 Z" fill={getFill("B")} stroke="#333" strokeWidth="0.5" onClick={() => onSurfaceClick(toothId,"B")} />
        <path d="M5 30 Q25 40 45 30 Q25 35 5 30 Z" fill={getFill("L")} stroke="#333" strokeWidth="0.5" onClick={() => onSurfaceClick(toothId,"L")} />
      </svg>
      <div className="text-xs mt-1 select-none">{toothId}</div>
      {entry?.whole && <div className="text-[10px] text-gray-500">{CONDITION_LOOKUP[entry.whole]?.label}</div>}
    </motion.div>
  );
}

// -----------------------------
// Utility: Build timeline array from teeth histories (descending)
function buildTimelineFromTeeth(teethObj) {
  const items = [];
  for (const [toothId, entry] of Object.entries(teethObj || {})) {
    (entry.history || []).forEach(h => {
      items.push({
        toothId,
        at: h.at,
        conditionId: h.conditionId,
        scope: h.scope,
        surface: h.surface || null,
        by: h.by || null,
        note: h.note || null,
      });
    });
  }
  items.sort((a,b) => new Date(b.at) - new Date(a.at));
  return items;
}

// -----------------------------
// Curved arch placement helpers
function placeOnArc(index, count, radius, centerX, centerY, startAngleDeg, endAngleDeg) {
  // index: 0..count-1
  const t = index / (count - 1); // 0..1
  const angleDeg = startAngleDeg + t * (endAngleDeg - startAngleDeg);
  const angleRad = (angleDeg * Math.PI) / 180;
  const x = centerX + radius * Math.cos(angleRad);
  const y = centerY + radius * Math.sin(angleRad);
  return { x, y, angleDeg };
}

// -----------------------------
// Main component
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

  // load chart when patientId changes
  useEffect(() => {
    (async () => {
      const loaded = await loadChart(state.patientId);
      if (loaded) setState(loaded);
      else {
        const list = state.dentition === "primary" ? NUMBERING.universalPrimary : NUMBERING.universalPermanent;
        setState(s => ({ ...s, teeth: makeInitialTeeth(list) }));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.patientId]);

  // autosave local snapshot on update (keeps local fallback)
  useEffect(() => {
    // keep updatedAt current
    setState(s => ({ ...s, updatedAt: nowISO() }));
    // save local fallback
    try { localStorage.setItem("dentalChart.v1:" + state.patientId, JSON.stringify(state)); } catch (e) {}
  }, [state]);

  // Undo/Redo helpers
  function pushUndo(prev) { setUndoStack(s => [...s, prev]); setRedoStack([]); }
  function mutate(mutator) {
    setState(prev => {
      const snapshot = JSON.parse(JSON.stringify(prev));
      const next = mutator(snapshot);
      next.updatedAt = nowISO();
      pushUndo(prev);
      return next;
    });
  }

  // Apply surface or whole-tooth condition and persist timeline entry
  async function handleSurfaceApply(toothId, surface) {
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
    // Save to Supabase (and update remote timeline)
    const newState = await (async () => {
      const s = await loadChart(state.patientId); // get latest
      if (!s) return state;
      return s;
    })();
    // After mutate, state is updated in React; call saveChart with current state
    saveChart({ ...state });
  }

  async function handleWholeApply(toothId, conditionId) {
    mutate(draft => {
      const entry = draft.teeth[toothId] || EMPTY_TOOTH(toothId);
      entry.whole = conditionId;
      entry.history.push({ scope: "whole", conditionId, note, by: clinician || "", at: nowISO() });
      draft.teeth[toothId] = entry;
      return draft;
    });
    saveChart({ ...state });
  }

  function handleClear(toothId) {
    mutate(draft => {
      draft.teeth[toothId] = EMPTY_TOOTH(toothId);
      return draft;
    });
    saveChart({ ...state });
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
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
    const w = canvas.width * ratio;
    const h = canvas.height * ratio;
    const x = (pageWidth - w) / 2;
    const y = (pageHeight - h) / 2;
    pdf.text(`Dental Chart – ${state.patientName || state.patientId} – ${new Date().toLocaleString()}`, 40, 30);
    pdf.addImage(imgData, "PNG", x, y, w, h);
    pdf.save(`dental-chart-${state.patientId}.pdf`);
  }

  // ordered teeth based on settings
  const orderedTeeth = useMemo(() => {
    const isPrimary = state.dentition === "primary";
    const universal = state.numbering === "universal";
    if (universal) return isPrimary ? NUMBERING.universalPrimary : NUMBERING.universalPermanent;
    return isPrimary ? NUMBERING.fdiPrimary : NUMBERING.fdiPermanent;
  }, [state.dentition, state.numbering]);

  // create quadrant groups: upper (first half) and lower (second half)
  function splitUpperLower(list) {
    if (state.numbering === "universal") {
      if (state.dentition === "primary") return [list.slice(0,10), list.slice(10)];
      return [list.slice(0,16), list.slice(16)];
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

  // timeline derived from state.teeth
  const timeline = useMemo(() => buildTimelineFromTeeth(state.teeth), [state.teeth]);

  // -----------------------------
  // Render curved arch helper using absolute positioned wrappers
  // containerWidth controls spacing; radius controls curve size
  function Arch({ teethList, arch }) {
    // teethList is an array of tooth ids in display order for that arch
    const count = teethList.length;
    const containerWidth = 740; // px
    const containerHeight = 220; // px
    const centerX = containerWidth / 2;
    const radius = 220; // circle radius
    // angles: upper arch from -140deg to -40deg (semi arc across top)
    // lower arch from 220deg to 320deg (mirrored bottom)
    const startAngle = arch === "upper" ? -140 : 220;
    const endAngle = arch === "upper" ? -40 : 320;

    return (
      <div style={{ width: containerWidth, height: containerHeight, position: "relative", margin: "0 auto" }}>
        {teethList.map((toothId, idx) => {
          const i = idx;
          const { x, y } = placeOnArc(i, count, radius, centerX, centerX, startAngle, endAngle);
          // subtract half tooth width/height to center the wrapper (approx 28)
          const left = x - 28;
          const top = y - 28;
          return (
            <div key={String(toothId)} style={{ position: "absolute", left: `${left}px`, top: `${top}px` }}>
              <ToothSVG
                toothId={toothId}
                entry={state.teeth[toothId] || EMPTY_TOOTH(toothId)}
                selected={selectedTooth === toothId}
                onSelect={(id) => setSelectedTooth(id)}
                onSurfaceClick={(id, surf) => handleSurfaceApply(id, surf)}
              />
            </div>
          );
        })}
      </div>
    );
  }

  // -----------------------------
  // UI
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
          <select value={state.dentition} onChange={e => setState(s => ({ ...s, dentition: e.target.value, teeth: makeInitialTeeth(e.target.value === "primary" ? NUMBERING.universalPrimary : NUMBERING.universalPermanent) }))} className="rounded-xl border px-3 py-2 shadow-sm bg-white">
            <option value="permanent">Permanent (1–32)</option>
            <option value="primary">Primary (A–T)</option>
          </select>
          <select value={state.numbering} onChange={e => setState(s => ({ ...s, numbering: e.target.value }))} className="rounded-xl border px-3 py-2 shadow-sm bg-white">
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

        <div className="flex items-center gap-2 ml-auto">
          <IconButton title="Undo" onClick={undo}><RotateCcw className="w-5 h-5" /></IconButton>
          <IconButton title="Redo" onClick={redo}><RotateCw className="w-5 h-5" /></IconButton>
          <IconButton title="Export PDF" onClick={exportPDF}><Download className="w-5 h-5" /></IconButton>
          <IconButton title="Print" onClick={() => window.print()}><Printer className="w-5 h-5" /></IconButton>
        </div>
      </div>

      {/* Condition picker */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2 items-center">
          {CONDITIONS.map(c => (
            <button key={c.id} onClick={() => setSelectedCondition(c.id)} className={classNames("px-3 py-1 rounded-xl border text-sm flex items-center gap-2", selectedCondition === c.id ? "ring-2 ring-indigo-400 bg-indigo-50" : "hover:bg-gray-50")}>
              <span style={{ width: 14, height: 14, backgroundColor: c.color }} className="inline-block rounded-sm border" />
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chart (curved arches) */}
      <div ref={chartRef} className="rounded-3xl border bg-white p-6 shadow-md">
        <div className="mb-2 text-sm font-medium">Upper Arch</div>
        <Arch teethList={upper.filter(t => filtered.includes(t))} arch="upper" />

        <div className="mt-6 mb-2 text-sm font-medium">Lower Arch</div>
        <Arch teethList={lower.filter(t => filtered.includes(t))} arch="lower" />
      </div>

      {/* Sidebar area: Conditions / history / actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Conditions */}
        <Card className="rounded-2xl shadow-md">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 mb-3"><FileSignature className="w-5 h-5" /><div className="font-medium">Conditions</div></div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {CONDITIONS.map(c => (
                <button key={c.id} onClick={() => setSelectedCondition(c.id)} className={classNames("px-3 py-2 rounded-xl flex items-center gap-2 text-sm border", selectedCondition === c.id ? "bg-indigo-50 ring-2 ring-indigo-400" : "hover:bg-gray-50")}>
                  <span>{c.icon}</span><span>{c.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tooth History / Timeline */}
        <Card className="rounded-2xl shadow-md">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 mb-3"><HistoryIcon className="w-5 h-5" /><div className="font-medium">Timeline</div></div>
            <div className="max-h-72 overflow-auto text-sm">
              {timeline.length === 0 ? <div className="text-gray-500">No history</div> :
                timeline.map((t, idx) => (
                  <div key={idx} className="py-2 border-b last:border-b-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <div><strong>{CONDITION_LOOKUP[t.conditionId]?.label || t.conditionId}</strong> {t.scope === "surface" ? `· ${t.surface}` : "· Tooth"}</div>
                        <div className="text-xs text-gray-500">{t.by || "—"} · {new Date(t.at).toLocaleString()}</div>
                        {t.note ? <div className="text-xs italic text-gray-600">{t.note}</div> : null}
                      </div>
                      <div style={{ width: 18, height: 18, backgroundColor: CONDITION_LOOKUP[t.conditionId]?.color }} className="rounded-full ml-2" />
                    </div>
                  </div>
                ))
              }
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="rounded-2xl shadow-md">
          <CardContent className="p-3 md:p-4 flex flex-col gap-2">
            <Button onClick={() => selectedTooth && handleWholeApply(selectedTooth, selectedCondition)} className="rounded-xl">Apply to Whole Tooth</Button>
            <Button onClick={() => saveChart(state)} className="rounded-xl" variant="outline">Save to Supabase</Button>
            <Button onClick={async () => { const loaded = await loadChart(state.patientId); if (loaded) setState(loaded); }} className="rounded-xl" variant="outline">Load from Supabase</Button>
            <Button onClick={exportPDF} className="rounded-xl" variant="outline">Download PDF</Button>
            <Button onClick={() => handleClear(selectedTooth)} disabled={!selectedTooth} className="rounded-xl" variant="outline">Clear Tooth</Button>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="mt-6 text-xs text-gray-500 flex items-center justify-between">
        <div>Updated: {new Date(state.updatedAt).toLocaleString()}</div>
        <div>Tip: Click a surface to apply the selected condition; use Quick Actions for whole-tooth changes.</div>
      </div>
    </div>
  );
}
