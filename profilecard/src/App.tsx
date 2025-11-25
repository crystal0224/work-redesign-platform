import React from 'react';
import PersonaCard from './components/PersonaCard';
import { PERSONAS_V3 } from './data/personas';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-8 print:bg-white print:py-0">
      <div className="max-w-[210mm] mx-auto print:max-w-none">
        <div className="mb-8 text-center print:hidden">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Persona Cards ({PERSONAS_V3.length})</h1>
          <p className="text-gray-600 mb-4">Press Cmd+P / Ctrl+P to save as PDF</p>
        </div>

        {PERSONAS_V3.map((persona, index) => (
          <div key={persona.id} className="print:break-after-page">
            <PersonaCard persona={persona} index={index} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
