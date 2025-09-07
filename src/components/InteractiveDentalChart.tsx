/*
 * Interactive Dental Chart – SwiftCare Integration
 * Refactored with constants and utilities
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Download, History as HistoryIcon, Settings, Search,
  Stethoscope, StickyNote, FileSignature
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@supabase/supabase-js";
import { usePatient } from "@/lib/PatientContext"; // shared patient context
import {
  CONDITIONS,
  CONDITION_LOOKUP,
  NUMBERING,
  EMPTY_TOOTH,
  makeInitialTeeth,
  nowISO,
  classNames,
} from "./dentalChartConstants";

// -----------------------------
// Supabase
// -----------------------------
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// -----------------------------
// Default Chart
// -----------------------------
const DEFAULT_CHART = {
  patientId: "",
  dentition: "permanent",
  numbering: "universal",
  teeth: makeInitialTeeth(NUMBERING.universalPermanent),
  updatedAt: nowISO(),
};

// -----------------------------
// Persistence
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
  if (!patientId) return null;
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
      <svg
        width="60"
        height="60"
        viewBox="-30 -30 60 60"
        className={classNames("w-12 h-12", isMissing ? "opacity-40" : "")}
      >
        <circle cx="0" cy="0" r="25" fill="none" stroke="gray" strokeWidth="1.5" />
        <circle
          cx="0"
          cy="0"
          r="10"
          fill={getFill("O")}
          stroke="gray"
          strokeWidth="1.5"
          onClick={(e) => {
            e.stopPropagation();
            onSurfaceClick(toothId, "O");
          }}
        />
        <g transform="rotate(45)">
          {["B", "D", "L", "M"].map((s, i) => (
            <path
              key={i}
              d={`M ${s === "B" ? "0 -25" : s === "D" ? "25 0" : s === "L" ? "0 25" : "-25 0"} 
                  A 25 25 0 0 1 ${s === "B" ? "25 0" : s === "D" ? "0 25" : s === "L" ? "-25 0" : "0 -25"} 
                  L ${s === "B" ? "10 0" : s === "D" ? "0 10" : s === "L" ? "-10 0" : "0 -10"} 
                  A 10 10 0 0 0 0 0 Z`}
              fill={getFill(s)}
              stroke="gray"
              strokeWidth="1"
              onClick={(e) => {
                e.stopPropagation();
                onSurfaceClick(toothId, s);
              }}
            />
          ))}
        </g>
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
  const { selectedPatient } = usePatient(); 
  const patientId = selectedPatient?.id || "";

  const [state, setState] = useState({ ...DEFAULT_CHART, patientId });
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [selectedCondition, setSelectedCondition] = useState("caries");
  const [clinician, setClinician] = useState("");
  const [note, setNote] = useState("");
  const [query, setQuery] = useState("");

  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const chartRef = useRef(null);

  // Load chart on patient change
  useEffect(() => {
    if (!patientId) return;
    setState(s => ({ ...s, patientId }));
    (async () => {
      const loaded = await loadChart(patientId);
      if (loaded) setState(loaded);
      else setState(s => ({ ...s, teeth: makeInitialTeeth(NUMBERING.universalPermanent) }));
    })();
  }, [patientId]);

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
    if (!chartRef.current) return;
    const canvas = await html2canvas(chartRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const ratio = Math.min(pdf.internal.pageSize.getWidth() / canvas.width, pdf.internal.pageSize.getHeight() / canvas.height);
    pdf.addImage(imgData, "PNG", (pdf.internal.pageSize.getWidth() - canvas.width * ratio) / 2, (pdf.internal.pageSize.getHeight() - canvas.height * ratio) / 2, canvas.width * ratio, canvas.height * ratio);
    pdf.save(`dental-chart-${patientId}.pdf`);
  }

  const orderedTeeth = useMemo(() => {
    const isPrimary = state.dentition === "primary";
    const universal = state.numbering === "universal";
    if (universal) return isPrimary ? NUMBERING.universalPrimary : NUMBERING.universalPermanent;
    return isPrimary ? NUMBERING.fdiPrimary : NUMBERING.fdiPermanent;
  }, [state.dentition, state.numbering]);

  function splitUpperLower(list) {
    if (state.numbering === "universal") return state.dentition === "primary" ? [list.slice(0, 10), list.slice(10)] : [list.slice(0, 16), list.slice(16)];
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
      {/* Toolbar, Dental Chart, and Sidebar – same as your previous implementation */}
      {/* ... */}
    </div>
  );
}
