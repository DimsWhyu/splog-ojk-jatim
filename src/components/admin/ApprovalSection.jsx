import React from 'react';
/* REVISI: Mengganti Eye menjadi PackageSearch untuk konsistensi */
import { Check, X, Clock, User, MessageSquare, Calendar, PackageSearch } from 'lucide-react';

const ApprovalSection = ({ requests, handleApproval, onViewDetails }) => {
  const pendingRequests = requests.filter(r => r.status === 'Menunggu');

  // Helper untuk format tanggal dd-mm-yyyy
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return dateStr.split('-').reverse().join('-');
  };

  return (
    <div className="bg-white rounded-[20px] border border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/50 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. HEADER SECTION (MAROON STYLE) */}
      <div className="p-6 bg-[#B91C1C] text-white flex justify-between items-center relative overflow-hidden">
        {/* Dekorasi Background Halus */}
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 border border-white/10"></div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
            <Clock className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h4 className="text-xl tracking-tight font-black tracking-[0.2em]"> Persetujuan Pengadaan</h4>
            <p className="text-[10px] font-medium text-red-100 mt-0.5">Antrian Pengajuan Logistik</p>
          </div>
        </div>

        <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/30 relative z-10">
           <span className="text-[11px] font-black">{pendingRequests.length} Permintaan Pending</span>
        </div>
      </div>

      {/* 2. LIST CONTENT */}
      <div className="divide-y divide-slate-50">
        {pendingRequests.map(req => (
          <div key={req.id} className="p-8 hover:bg-slate-50/50 transition-all flex flex-col md:flex-row md:items-center gap-6 group">
            
            {/* ID Badge Bulat Elegan */}
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border-2 border-slate-100 flex flex-col items-center justify-center shrink-0 group-hover:border-red-200 transition-colors shadow-inner">
               <span className="text-[9px] font-black text-slate-400 tracking-tighter">REQ</span>
               <span className="text-base font-black text-red-600 leading-none">{req.id.split('-')[1]}</span>
            </div>

            {/* Informasi Pengaju */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                   <User className="w-3.5 h-3.5 text-slate-500" />
                   <h5 className="font-bold text-slate-800 text-sm tracking-tight">{req.user}</h5>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                   <Calendar className="w-3.5 h-3.5" />
                   <span className="text-[11px] font-bold tracking-tight">{formatDate(req.date)}</span>
                </div>
              </div>

              {/* Justifikasi / Catatan */}
              <div className="flex items-start gap-3 pl-1">
                <MessageSquare className="w-4 h-4 text-red-300 mt-0.5 shrink-0" />
                <p className="text-[13px] text-slate-600 font-medium italic leading-relaxed">
                  "{req.note}"
                </p>
              </div>
            </div>

            {/* 3. ACTION BUTTONS (MODERN & TACTILE) */}
            <div className="flex items-center gap-3 shrink-0">
              {/* REVISI: Menggunakan ikon PackageSearch agar sama dengan tabel riwayat */}
              <button 
                onClick={() => onViewDetails(req)} 
                className="p-3.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border-2 border-blue-100 hover:border-blue-600 rounded-2xl transition-all active:scale-90 shadow-sm group/detail"
                title="Lihat Detail Barang"
              >
                <PackageSearch className="w-5 h-5 transition-transform group-hover/detail:scale-110" />
              </button>

              <button 
                onClick={() => handleApproval(req.id, 'Ditolak')} 
                className="group/btn flex items-center gap-2 px-5 py-3 bg-white text-slate-400 hover:text-red-600 border-2 border-slate-100 hover:border-red-500 rounded-2xl transition-all active:scale-90 shadow-sm font-bold text-xs uppercase tracking-tight"
              >
                <X className="w-4 h-4 transition-transform group-hover/btn:rotate-90" />
                Tolak
              </button>

              <button 
                onClick={() => handleApproval(req.id, 'Disetujui')} 
                className="group/btn flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white hover:bg-emerald-700 rounded-2xl transition-all active:scale-95 shadow-lg shadow-emerald-100 font-bold text-xs uppercase tracking-tight"
              >
                <Check className="w-4 h-4 transition-transform group-hover/btn:scale-125" />
                Setujui
              </button>
            </div>
          </div>
        ))}

        {/* EMPTY STATE */}
        {pendingRequests.length === 0 && (
          <div className="py-24 flex flex-col items-center justify-center opacity-40">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 border-2 border-dashed border-slate-300">
               <Check className="w-10 h-10 text-slate-400" />
            </div>
            <p className="font-black text-l text-slate-400">
              Semua Pengajuan Telah Diproses
            </p>
          </div>
        )}
      </div>

      {/* FOOTER INFO */}
      <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
         <p className="text-[12px] font-bold text-slate-300 tracking-tight">SPLOG Kantor OJK Provinsi Jawa Timur • Dashboard Approval</p>
         <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
         </div>
      </div>
    </div>
  );
};

export default ApprovalSection;