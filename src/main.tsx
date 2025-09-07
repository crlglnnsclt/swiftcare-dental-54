import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { PatientProvider } from './lib/PatientContext'; // <-- import your context provider

createRoot(document.getElementById("root")!).render(
  <PatientProvider>
    <App />
  </PatientProvider>
);
