/*
 * Interactive Dental Chart – SwiftCare Integration
 * With Supabase persistence & shared patient selection
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Download,
  History as HistoryIcon,
  RotateCcw,
  RotateCw,
  Save,
  Upload,
  FileSignature,
  Settings,
  Search,
  Stethoscope,
  StickyNote,
  Printer,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@supabase/supabase-js";
import { usePatient } from "@/lib/PatientContext"; // <- shared context
import {
  CONDITIONS,
  CONDITION_LOOKUP,
  NUMBERING,
  EMPTY_TOOTH,
  DEFAULT_CHART,
  nowISO,
  classNames,
  createInitialTeeth,
} from "@/lib/dentalChartConstants";

// -----------------------------
// Supabase
// -----------------------------
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

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
    surfaces[surface]
      ? CONDITION_LOOKUP[surfaces[surface].conditionId]?.color
      : "#ffffff";

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
        <circle
          cx="0"
          cy="0"
          r="25"
          fill="none"
          stroke="gray"
          strokeWidth="1.5"
        />
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
          <path
            d="M 0 -25 A 25 25 0 0 1 25 0 L 10 0 A 10 10 0 0 0 0 -10 Z"
            fill={getFill("B")}
            stroke="gray"
            strokeWidth="1"
            onClick={(e) => {
              e.stopPropagation();
              onSurfaceClick(toothId, "B");
            }}
          />
          <path
            d="M 25 0 A 25 25 0 0 1 0 25 L 0 10 A 10 10 0 0 0 10 0 Z"
            fill={getFill("D")}
            stroke="gray"
            strokeWidth="1"
            onClick={(e) => {
              e.stopPropagation();
              onSurfaceClick(toothId, "D");
            }}
          />
          <path
            d="M 0 25 A 25 25 0 0 1 -25 0 L -10 0 A 10 10 0 0 0 0 10 Z"
            fill={getFill("L")}
            stroke="gray"
            strokeWidth="1"
            onClick={(e) => {
              e.stopPropagation();
              onSurfaceClick(toothId, "L");
            }}
          />
          <path
            d="M -25 0 A 25 25 0 0 1 0 -25 L 0 -10 A 10 10 0 0 0 -10 0 Z"
            fill={getFill("M")}
            stroke="gray"
            strokeWidth="1"
            onClick={(e) => {
              e.stopPropagation();
              onSurfaceClick(toothId, "M");
            }}
          />
        </g>
      </svg>
      <div className="text-xs text-center mt-1">{toothId}</div>
      {entry.whole && (
        <div className="text-[10px] text-gray-500">
          {CONDITION_LOOKUP[entry.whole]?.label}
        </div>
      )}
    </motion.div>
  );
}

// -----------------------------
// Main Component
// -----------------------------
export default function InteractiveDentalChart() {
  const { selectedPatient } = usePatient(); // <- shared patient context
  const patientId = selectedPatient?.id || "";

  const [state, setState] = useState(() => ({ ...DEFAULT_CHART, patientId }));
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
    setState((s) => ({ ...s, patientId }));
    (async () => {
      const loaded = await loadChart(patientId);
      if (loaded) setState(loaded);
      else
        setState((s) => ({
          ...s,
          teeth: Object.fromEntries(
            NUMBERING.universalPermanent.map((t) => [t, EMPTY_TOOTH(t)])
          ),
        }));
    })();
  }, [patientId]);

  function pushUndo(prev) {
    setUndoStack((s) => [...s, prev]);
    setRedoStack([]);
  }

  function mutate(mutator) {
    setState((prev) => {
      const snapshot = JSON.parse(JSON.stringify(prev));
      const next = mutator(snapshot);
      next.updatedAt = nowISO();
      pushUndo(prev);
      return next;
    });
  }

  function handleSurfaceApply(toothId, surface) {
    const cond = CONDITION_LOOKUP[selectedCondition];
    mutate((draft) => {
      const entry = draft.teeth[toothId] || EMPTY_TOOTH(toothId);
      if (cond.surface) {
        entry.surfaces[surface] = {
          conditionId: cond.id,
          note,
          by: clinician || "",
          at: nowISO(),
        };
        entry.history.push({
          scope: "surface",
          surface,
          conditionId: cond.id,
          note,
          by: clinician || "",
          at: nowISO(),
        });
      } else {
        entry.whole = cond.id;
        entry.history.push({
          scope: "whole",
          conditionId: cond.id,
          note,
          by: clinician || "",
          at: nowISO(),
        });
      }
      draft.teeth[toothId] = entry;
      return draft;
    });
  }

  function handleWholeApply(toothId, conditionId) {
    mutate((draft) => {
      const entry = draft.teeth[toothId] || EMPTY_TOOTH(toothId);
      entry.whole = conditionId;
      entry.history.push({
        scope: "whole",
        conditionId,
        note,
        by: clinician || "",
        at: nowISO(),
      });
      draft.teeth[toothId] = entry;
      return draft;
    });
  }

  async function exportPDF() {
    if (!chartRef.current) return;
    const canvas = await html2canvas(chartRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const ratio = Math.min(
      pdf.internal.pageSize.getWidth() / canvas.width,
      pdf.internal.pageSize.getHeight() / canvas.height
    );
    pdf.addImage(
      imgData,
      "PNG",
      (pdf.internal.pageSize.getWidth() - canvas.width * ratio) / 2,
      (pdf.internal.pageSize.getHeight() - canvas.height * ratio) / 2,
      canvas.width * ratio,
      canvas.height * ratio
    );
    pdf.save(`dental-chart-${patientId}.pdf`);
  }

  const orderedTeeth = useMemo(() => {
    const isPrimary = state.dentition === "primary";
    const universal = state.numbering === "universal";
    if (universal)
      return isPrimary ? NUMBERING.universalPrimary : NUMBERING.universalPermanent;
    return isPrimary ? NUMBERING.fdiPrimary : NUMBERING.fdiPermanent;
  }, [state.dentition, state.numbering]);

  function splitUpperLower(list) {
    if (state.numbering === "universal")
      return state.dentition === "primary"
        ? [list.slice(0, 10), list.slice(10)]
        : [list.slice(0, 16), list.slice(16)];
    const upperLen = state.dentition === "primary" ? 10 : 16;
    return [list.slice(0, upperLen), list.slice(upperLen)];
  }

  const [upper, lower] = splitUpperLower(orderedTeeth);

  const filtered = useMemo(() => {
    if (!query) return orderedTeeth;
    const q = query.toString().toLowerCase();
    return orderedTeeth.filter((t) => t.toString().toLowerCase().includes(q));
  }, [orderedTeeth, query]);

  return (
    <div className="w-full p-4 md:p-6 lg:p-8 bg-gradient-to-b from-white to-slate-50 text-slate-900">
      {/* Toolbar & Filters */}
      <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4">
        <div className="flex items-center gap-2 pr-3 mr-2 border-r">
          <Stethoscope className="w-5 h-5" />
          <input
            type="text"
            placeholder="Patient ID"
            value={state.patientId}
            onChange={(e) =>
              setState((s) => ({ ...s, patientId: e.target.value }))
            }
            className="rounded-xl border px-3 py-2 shadow-sm bg-white"
          />
          <Button onClick={() => saveChart(state)}>Save</Button>
          <Button
            onClick={async () => {
              const loaded = await loadChart(patientId);
              if (loaded) setState(loaded);
            }}
          >
            Load
          </Button>
        </div>
        <div className="flex items-center gap-2 pr-3 mr-2 border-r">
          <Settings className="w-5 h-5" />
          <select
            value={state.dentition}
            onChange={(e) =>
              setState((s) => ({
                ...s,
                dentition: e.target.value,
                teeth: createInitialTeeth(
                  e.target.value === "primary"
                    ? NUMBERING.universalPrimary
                    : NUMBERING.universalPermanent
                ),
              }))
            }
            className="rounded-xl border px-3 py-2 shadow-sm bg-white"
          >
            <option value="permanent">Permanent</option>
            <option value="primary">Primary</option>
          </select>
          <select
            value={state.numbering}
            onChange={(e) => setState((s) => ({ ...s, numbering: e.target.value }))}
            className="rounded-xl border px-3 py-2 shadow-sm bg-white"
          >
            <option value="universal">Universal</option>
            <option value="fdi">FDI</option>
          </select>
        </div>
        <div className="flex items-center gap-2 pr-3 mr-2 border-r">
          <Search className="w-5 h-5" />
          <input
            placeholder="Find tooth…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="rounded-xl border px-3 py-2 shadow-sm bg-white"
          />
        </div>
        <div className="flex items-center gap-2 pr-3 mr-2 border-r">
          <StickyNote className="w-5 h-5" />
          <input
            placeholder="Clinician (optional)"
            value={clinician}
            onChange={(e) => setClinician(e.target.value)}
            className="rounded-xl border px-3 py-2 shadow-sm bg-white"
          />
          <input
            placeholder="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="rounded-xl border px-3 py-2 shadow-sm bg-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setState(undoStack.pop() || state)}>Undo</Button>
          <Button onClick={() => setState(redoStack.pop() || state)}>Redo</Button>
          <Button onClick={exportPDF}>Export PDF</Button>
          <Button onClick={() => window.print()}>Print</Button>
        </div>
      </div>

      {/* Dental Chart */}
      <div ref={chartRef} className="rounded-3xl border bg-white p-4 shadow-md">
        <div className="mb-4">
          <div className="text-sm font-medium mb-2">Upper Arch</div>
          <div className="grid grid-cols-8 md:grid-cols-16 gap-2">
            {upper
              .filter((t) => filtered.includes(t))
              .map((t) => (
                <ToothSVG
                  key={t}
                  toothId={t}
                  entry={state.teeth[t] || EMPTY_TOOTH(t)}
                  selected={selectedTooth === t}
                  onSelect={setSelectedTooth}
                  onSurfaceClick={handleSurfaceApply}
                />
              ))}
          </div>
        </div>
        <div>
          <div className="text-sm font-medium mb-2">Lower Arch</div>
          <div className="grid grid-cols-8 md:grid-cols-16 gap-2">
            {lower
              .filter((t) => filtered.includes(t))
              .map((t) => (
                <ToothSVG
                  key={t}
                  toothId={t}
                  entry={state.teeth[t] || EMPTY_TOOTH(t)}
                  selected={selectedTooth === t}
                  onSelect={setSelectedTooth}
                  onSurfaceClick={handleSurfaceApply}
                />
              ))}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-2xl shadow-md">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileSignature className="w-5 h-5" />
              <h3 className="text-sm font-medium">Conditions</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {CONDITIONS.map((c) => (
                <Button
                  key={c.id}
                  onClick={() => setSelectedCondition(c.id)}
                  variant={selectedCondition === c.id ? "default" : "outline"}
                  className="rounded-xl flex items-center gap-1 px-2 py-1"
                >
                  <span>{c.icon}</span>{" "}
                  <span className="text-xs">{c.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

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
                    <div>
                      <b>{h.conditionId}</b>{" "}
                      {h.scope === "surface" && <span>({h.surface})</span>}
                    </div>
                    <div className="text-gray-600">{h.note}</div>
                    <div className="text-gray-400">
                      {h.by} • {new Date(h.at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-gray-500">Select a tooth to view history</div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-md">
          <CardContent className="p-3 md:p-4 flex flex-col gap-2">
            <Button
              onClick={() =>
                selectedTooth && handleWholeApply(selectedTooth, selectedCondition)
              }
              className="rounded-xl"
            >
              Apply to Whole Tooth
            </Button>
            <Button onClick={() => saveChart(state)} className="rounded-xl" variant="outline">
              Save to Supabase
            </Button>
            <Button
              onClick={async () => {
                const loaded = await loadChart(patientId);
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
  );
}
