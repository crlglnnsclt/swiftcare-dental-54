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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

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
const SURFACES = ["M", "D", "B", "L", "O"];
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
const EMPTY_TOOTH = (toothId) => ({ toothId, surfaces: { M: null, D: null, B: null, L: null, O: null }, whole: null, history: [] });
const makeInitialTeeth = (list) => Object.fromEntries(list.map(t => [t, EMPTY_TOOTH(t)]));
const DEFAULT_CHART = { patientId: "", dentition: "permanent", numbering: "universal", teeth: makeInitialTeeth(NUMBERING.universalPermanent), updatedAt: nowISO() };

// -----------------------------
// Persistence (Supabase)
// -----------------------------
async function saveChart(state) {
  const { error } = await supabase.from("dental_charts").upsert([
    { patient_id: state.patientId, chart: state, updated_at: nowISO() },
  ]);
  if (error) console.error("Supabase save error:", error.message);
}

async function loadChart(patientId) {
  const { data, error } = await supabase
    .from("dental_charts")
    .select("chart")
    .eq("patient_id", patientId)
    .single();
  if (error) console.error("Supabase load error:", error.message);
  return data?.chart || null;
}

// -----------------------------
// Tooth Component
// -----------------------------
function ToothSVG({ toothId, entry, selected, onSelect, onSurfaceClick }) {
  const surfaces = entry.surfaces;
  const isMissing = entry.whole === "extracted";
  const getFill = (surface) => surfaces[surface] ? CONDITION_LOOKUP[surfaces[surface].conditionId]?.color : "#ffffff";
  return (
    <motion.div
      layout
      onClick={() => onSelect(toothId)}
      className={classNames("p-1 rounded-xl border bg-white shadow-sm cursor-pointer", selected && "ring-2 ring-blue-400")}
    >
      <svg width="60" height="60" viewBox="-30 -30 60 60" className={classNames("w-12 h-12", isMissing ? "opacity-40" : "")}>
        <circle cx="0" cy="0" r="25" fill="none" stroke="gray" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="10" fill={getFill("O")} stroke="gray" strokeWidth="1.5" onClick={(e)=>{e.stopPropagation(); onSurfaceClick(toothId,"O")}} />
        <g transform="rotate(45)">
          <path d="M 0 -25 A 25 25 0 0 1 25 0 L 10 0 A 10 10 0 0 0 0 -10 Z" fill={getFill("B")} stroke="gray" strokeWidth="1" onClick={(e)=>{e.stopPropagation(); onSurfaceClick(toothId,"B")}} />
          <path d="M 25 0 A 25 25 0 0 1 0 25 L 0 10 A 10 10 0 0 0 10 0 Z" fill={getFill("D")} stroke="gray" strokeWidth="1" onClick={(e)=>{e.stopPropagation(); onSurfaceClick(toothId,"D")}} />
          <path d="M 0 25 A 25 25 0 0 1 -25 0 L -10 0 A 10 10 0 0 0 0 10 Z" fill={getFill("L")} stroke="gray" strokeWidth="1" onClick={(e)=>{e.stopPropagation(); onSurfaceClick(toothId,"L")}} />
          <path d="M -25 0 A 25 25 0 0 1 0 -25 L 0 -10 A 10 10 0 0 0 -10 0 Z" fill={getFill("M")} stroke="gray" strokeWidth="1" onClick={(e)=>{e.stopPropagation(); onSurfaceClick(toothId,"M")}} />
        </g>
      </svg>
      <div className="text-xs text-center mt-1">{toothId}</div>
      {entry.whole && <div className="text-[10px] text-gray-500">{CONDITION_LOOKUP[entry.whole]?.label}</div>}
    </motion.div>
  );
}

// -----------------------------
// Main Component
// -----------------------------
export default function InteractiveDentalChart() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [state, setState] = useState(DEFAULT_CHART);
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [selectedCondition, setSelectedCondition] = useState("caries");
  const chartRef = useRef(null);

  // Fetch patients
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("patients").select("id, full_name");
      if (error) {
        console.error(error);
        toast.error("Failed to fetch patients");
        return;
      }
      setPatients(data || []);
      if (data && data.length > 0) setSelectedPatient(data[0].id);
    })();
  }, []);

  // Load chart on patient change
  useEffect(() => {
    if (!selectedPatient) return;
    (async () => {
      const loaded = await loadChart(selectedPatient);
      if (loaded) setState(loaded);
      else {
        const list = NUMBERING.universalPermanent;
        setState({ ...DEFAULT_CHART, patientId: selectedPatient, teeth: makeInitialTeeth(list) });
      }
    })();
  }, [selectedPatient]);

  // Apply surface or whole
  const handleSurfaceApply = (toothId, surface) => {
    const cond = CONDITION_LOOKUP[selectedCondition];
    setState(prev => {
      const draft = { ...prev, teeth: { ...prev.teeth } };
      const entry = draft.teeth[toothId] || EMPTY_TOOTH(toothId);
      if (cond.surface) entry.surfaces[surface] = { conditionId: cond.id, at: nowISO() };
      else entry.whole = cond.id;
      draft.teeth[toothId] = entry;
      draft.updatedAt = nowISO();
      return draft;
    });
  };
  const handleWholeApply = (toothId, conditionId) => handleSurfaceApply(toothId, null);

  // Export PDF
  const exportPDF = async () => {
    if (!chartRef.current) return;
    const canvas = await html2canvas(chartRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
    const w = canvas.width * ratio;
    const h = canvas.height * ratio;
    const x = (pageWidth - w) / 2;
    const y = (pageHeight - h) / 2;
    pdf.text(`Dental Chart – Patient: ${selectedPatient} – ${new Date().toLocaleString()}`, 40, 30);
    pdf.addImage(imgData, "PNG", x, y, w, h);
    pdf.save(`dental-chart-${selectedPatient}.pdf`);
  };

  const orderedTeeth = NUMBERING.universalPermanent;
  const [upper, lower] = [orderedTeeth.slice(0, 16), orderedTeeth.slice(16)];

  return (
    <div className="w-full p-4 md:p-6 lg:p-8 bg-gradient-to-b from-white to-slate-50 text-slate-900">
      {/* Patient Select */}
      <div className="mb-4 flex items-center gap-2">
        <Select value={selectedPatient} onValueChange={setSelectedPatient}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select a patient" />
          </SelectTrigger>
          <SelectContent>
            {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={() => saveChart(state)}>Save</Button>
        <Button onClick={exportPDF}>Export PDF</Button>
      </div>

      {/* Chart */}
      <div ref={chartRef} className="rounded-3xl border bg-white p-4 shadow-md">
        <div className="mb-4">
          <div className="text-sm font-medium mb-2">Upper Arch</div>
          <div className="grid grid-cols-8 md:grid-cols-16 gap-2">
            {upper.map(t => <ToothSVG key={t} toothId={t} entry={state.teeth[t] || EMPTY_TOOTH(t)} selected={selectedTooth===t} onSelect={setSelectedTooth} onSurfaceClick={handleSurfaceApply} />)}
          </div>
        </div>
        <div>
          <div className="text-sm font-medium mb-2">Lower Arch</div>
          <div className="grid grid-cols-8 md:grid-cols-16 gap-2">
            {lower.map(t => <ToothSVG key={t} toothId={t} entry={state.teeth[t] || EMPTY_TOOTH(t)} selected={selectedTooth===t} onSelect={setSelectedTooth} onSurfaceClick={handleSurfaceApply} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
