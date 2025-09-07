import React, { createContext, useContext, useState } from "react";

interface PatientContextType {
  patientId: string;
  setPatientId: (id: string) => void;
}

const PatientContext = createContext<PatientContextType>({
  patientId: "",
  setPatientId: () => {},
});

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patientId, setPatientId] = useState("");
  return (
    <PatientContext.Provider value={{ patientId, setPatientId }}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatient = () => useContext(PatientContext);

