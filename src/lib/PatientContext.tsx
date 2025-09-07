import React, { createContext, useContext, useState, ReactNode } from "react";

interface Patient {
  id: string;
  full_name: string;
}

interface PatientContextType {
  patient: Patient | null;
  setPatient: (p: Patient | null) => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider = ({ children }: { children: ReactNode }) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  return (
    <PatientContext.Provider value={{ patient, setPatient }}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatient = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error("usePatient must be used within a PatientProvider");
  }
  return context;
};
