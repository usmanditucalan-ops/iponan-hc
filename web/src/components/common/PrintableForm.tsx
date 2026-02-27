import React from 'react';
import logo from '../../assets/logo.png';

interface PrintableFormProps {
  title: string;
  subtitle?: string;
  patientInfo: {
    name: string;
    dob?: string;
    gender?: string;
    phone?: string;
  };
  children: React.ReactNode;
}

export const PrintableForm = ({ title, subtitle, patientInfo, children }: PrintableFormProps) => {
  return (
    <div className="printable-form bg-white text-black p-10 max-w-4xl mx-auto border-2 border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between border-b-4 border-primary pb-6 mb-8">
        <div className="flex items-center gap-4">
          <img src={logo} alt="Clinic Logo" className="w-16 h-16 object-contain" />
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-primary">Barangay Iponan Health Clinic</h1>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Digital EMR System • Official Documentation</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-black uppercase text-gray-800">{title}</h2>
          {subtitle && <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{subtitle}</p>}
        </div>
      </div>

      {/* Patient Info Block */}
      <div className="bg-gray-50 p-6 rounded-2xl mb-8 grid grid-cols-2 gap-6 border border-gray-100">
        <div>
          <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Patient Name</span>
          <p className="font-bold text-lg">{patientInfo.name}</p>
        </div>
        <div>
          <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Contact / Phone</span>
          <p className="font-bold">{patientInfo.phone || 'N/A'}</p>
        </div>
        <div>
          <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Date of Birth</span>
          <p className="font-bold">{patientInfo.dob ? new Date(patientInfo.dob).toLocaleDateString() : 'N/A'}</p>
        </div>
        <div>
          <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Gender</span>
          <p className="font-bold capitalize">{patientInfo.gender?.toLowerCase() || 'N/A'}</p>
        </div>
      </div>

      {/* Form Content */}
      <div className="space-y-8 min-h-[400px]">
        {children}
      </div>

      {/* Footer */}
      <div className="mt-20 pt-8 border-t border-gray-100 flex justify-between items-end">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Generated On</p>
          <p className="text-xs font-bold">{new Date().toLocaleString()}</p>
        </div>
        <div className="text-right">
           <div className="w-48 border-b-2 border-black mb-1"></div>
           <p className="text-[10px] font-bold text-gray-400 uppercase">Physician / Authorized Signature</p>
        </div>
      </div>

      {/* Print Instructions */}
      <div className="no-print fixed bottom-8 right-8 flex gap-3">
         <button 
            onClick={() => window.print()} 
            className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-xl hover:opacity-90 transition-opacity"
         >
            Print Now
         </button>
      </div>

      <style>{`
        @media print {
          body { background: white !important; -webkit-print-color-adjust: exact; }
          .no-print { display: none !important; }
          .printable-form { border: none !important; padding: 0 !important; width: 100% !important; max-width: none !important; }
        }
      `}</style>
    </div>
  );
};
