import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button, Card, CardContent } from "@/components/ui/card";
import { FileSignature, History as HistoryIcon, Stethoscope, StickyNote, Search, Settings } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { supabase } from "@/integrations/supabase/client";
import { usePatient } from "@/lib/PatientContext";
import { CONDITIONS, CONDITION_LOOKUP, NUMBERING, EMPTY_TOOTH, makeInitialTeeth } from "./dentalChartConstants"; // extract constants to reuse

export default function InteractiveDentalChart({ patientId: propPatientId }) {
  const { selectedPatient } = usePatient();
  const patientId = propPatientId || selectedPatient?.id || "";

  const [state, setState] = useState({ patientId, dentition: "permanent", numbering: "universal", teeth: makeInitialTeeth(NUMBERING.universalPermanent), updatedAt: new Date().toISOString() });
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [selectedCondition, setSelectedCondition] = useState("caries");
  const [clinician, setClinician] = useState("");
  const [note, setNote] = useState("");
  const chartRef = useRef(null);

  // Load chart on patient change
  useEffect(() => {
    if (!patientId) return;
    (async () => {
      const { data } = await supabase.from("dental_charts").select("chart").eq("patient_id", patientId).single();
      if (data?.chart) setState(data.chart);
      else setState(prev=>({...prev, teeth: makeInitialTeeth(NUMBERING.universalPermanent)}));
    })();
  }, [patientId]);

  const handleSurfaceApply = (toothId, surface) => {
    const cond = CONDITION_LOOKUP[selectedCondition];
    setState(prev => {
      const entry = prev.teeth[toothId] || EMPTY_TOOTH(toothId);
      if (cond.surface) entry.surfaces[surface] = { conditionId: cond.id, note, by: clinician, at: new Date().toISOString() };
      else entry.whole = cond.id;
      return { ...prev, teeth: { ...prev.teeth, [toothId]: entry }, updatedAt: new Date().toISOString() };
    });
  };

  const exportPDF = async () => {
    if (!chartRef.current) return;
    const canvas = await html2canvas(chartRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const ratio = Math.min(pdf.internal.pageSize.getWidth()/canvas.width, pdf.internal.pageSize.getHeight()/canvas.height);
    pdf.addImage(imgData,"PNG",(pdf.internal.pageSize.getWidth()-canvas.width*ratio)/2,(pdf.internal.pageSize.getHeight()-canvas.height*ratio)/2,canvas.width*ratio,canvas.height*ratio);
    pdf.save(`dental-chart-${patientId}.pdf`);
  };

  const orderedTeeth = useMemo(() => state.numbering==="universal"?NUMBERING.universalPermanent:NUMBERING.fdiPermanent, [state.numbering]);

  return (
    <div className="w-full p-4 bg-white text-slate-900">
      <div className="flex flex-wrap gap-2 mb-4">
        <Stethoscope className="w-5 h-5"/>
        <input type="text" placeholder="Clinician" value={clinician} onChange={e=>setClinician(e.target.value)} className="rounded-xl border px-3 py-2"/>
        <StickyNote className="w-5 h-5"/>
        <input type="text" placeholder="Note" value={note} onChange={e=>setNote(e.target.value)} className="rounded-xl border px-3 py-2"/>
        <Button onClick={exportPDF}>Export PDF</Button>
      </div>

      <div ref={chartRef} className="p-4 rounded-3xl border bg-white shadow-md">
        <div className="grid grid-cols-8 gap-2">
          {orderedTeeth.map(t => (
            <div key={t} onClick={()=>setSelectedTooth(t)} className={`p-1 border rounded-xl ${selectedTooth===t?"ring-2 ring-blue-400":""}`}>
              <svg width="60" height="60" viewBox="-30 -30 60 60">
                <circle cx="0" cy="0" r="25" fill="none" stroke="gray" strokeWidth="1.5"/>
                <circle cx="0" cy="0" r="10" fill={state.teeth[t]?.surfaces?.O?CONDITION_LOOKUP[state.teeth[t].surfaces.O.conditionId].color:"#fff"} stroke="gray" strokeWidth="1.5" onClick={e=>{e.stopPropagation(); handleSurfaceApply(t,"O")}}/>
              </svg>
              <div className="text-xs text-center mt-1">{t}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
