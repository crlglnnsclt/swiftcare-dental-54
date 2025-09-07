// src/lib/dentalChartConstants.ts

// -----------------------------
// Utilities
// -----------------------------
export const nowISO = () => new Date().toISOString();
export function classNames(...xs: any[]) { return xs.filter(Boolean).join(" "); }

// -----------------------------
// Tooth Numbering
// -----------------------------
export const NUMBERING = {
  universalPermanent: Array.from({ length: 32 }, (_, i) => i + 1),
  universalPrimary: ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T"],
  fdiPermanent: [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28,48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38],
  fdiPrimary: [55,54,53,52,51,61,62,63,64,65,85,84,83,82,81,71,72,73,74,75],
};

// -----------------------------
// Tooth Conditions
// -----------------------------
export const CONDITIONS = [
  { id: "caries", label: "Caries", surface: true, color: "#ef4444", icon: "🦷" },
  { id: "filling", label: "Filling", surface: true, color: "#3b82f6", icon: "◻" },
  { id: "composite", label: "Composite", surface: true, color: "#06b6d4", icon: "◆" },
  { id: "crown", label: "Crown", surface: false, color: "#f59e0b", icon: "👑" },
  { id: "rct", label: "Root Canal", surface: false, color: "#7c3aed", icon: "🪥" },
  { id: "implant", label: "Implant", surface: false, color: "#10b981", icon: "⚙" },
  { id: "extracted", label: "Missing/Extracted", surface: false, color: "#6b7280", icon: "✖" },
  { id: "fracture", label: "Fracture", surface: true, color: "#db2777", icon: "⚡" },
  { id: "mobility", label: "Mobility", surface: false, color: "#a3e635", icon: "↔" },
  { id: "veneer", label: "Veneer", surface: true, color: "#eab308", icon: "⟡" },
];

export const CONDITION_LOOKUP = Object.fromEntries(CONDITIONS.map(c => [c.id, c]));
export const EMPTY_TOOTH = (toothId: number | string) => ({
  toothId,
  surfaces: { M: null, D: null, B: null, L: null, O: null },
  whole: null,
  history: [],
});

// -----------------------------
// Initial Chart Template
// -----------------------------
export const DEFAULT_CHART = {
  patientId: "",
  dentition: "permanent",
  numbering: "universal",
  teeth: Object.fromEntries(NUMBERING.universalPermanent.map(t => [t, EMPTY_TOOTH(t)])),
  updatedAt: nowISO(),
};
