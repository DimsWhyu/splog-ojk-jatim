import React from 'react';
import ApprovalSection from './ApprovalSection';
/* Tambahkan MinusCircle untuk ikon pembatalan */
import { History, CheckCircle2, XCircle, PackageSearch, LayoutDashboard, MinusCircle } from 'lucide-react';

const DashboardView = ({ requests, handleApproval, onViewDetails }) => {
  // Filter data untuk riwayat (yang sudah diproses: Disetujui atau Ditolak atau Dibatalkan)
  const historyRequests = requests.filter(r => r.status !== 'Menunggu');

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. HEADER SECTION */}
      <div className="space-y-1">
        <h2 className="text-3xl font-black text-slate-800 tracking-tighter flex items-center gap-3">
        <LayoutDashboard className="w-8 h-8 text-red-600" />Persetujuan & Riwayat Aktivitas</h2>
        <p className="text-slate-400 font-medium text-sm italic">
          Kelola antrian pengajuan pengadaan dan tinjau riwayat tindakan admin secara sistematis.
        </p>
      </div>

      {/* 2. SECTION: PERSETUJUAN PENDING */}
      <div className="space-y-4">
        <ApprovalSection 
          requests={requests} 
          handleApproval={handleApproval} 
          onViewDetails={onViewDetails} 
        />
      </div>

      {/* 3. SECTION: RIWAYAT AKTIVITAS PERSETUJUAN */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center gap-3">
           <History className="w-5 h-5 text-slate-400" />
           <h3 className="text-xl font-bold text-slate-800 tracking-tight">Riwayat Aktivitas Persetujuan</h3>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden relative">
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              {/* STICKY HEADER - SLATE STYLE */}
              <thead className="sticky top-0 z-20 shadow-sm">
                <tr className="bg-slate-800 text-white text-[13px] font-bold tracking-tight">
                  <th className="px-6 py-4 text-center w-16">No</th>
                  <th className="px-6 py-4">Referensi</th>
                  <th className="px-6 py-4">Nama Pengaju</th>
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4 text-center">Status Akhir</th>
                  {/* REVISI: Tambah Kolom Detail Item */}
                  <th className="px-6 py-4 text-center">Detail Item</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {historyRequests.map((req, index) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 text-center text-sm font-bold text-slate-300">
                      {String(index + 1).padStart(2, '0')}
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-slate-700">{req.id}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-600">{req.user}</td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-400">
                      {req.date.split('-').reverse().join('-')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        {/* --- REVISI LOGIKA STATUS: DISESUAIKAN UNTUK DIBATALKAN --- */}
                        {req.status === 'Disetujui' ? (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 font-bold text-[10px] uppercase tracking-tighter">
                            <CheckCircle2 className="w-3 h-3" /> Disetujui
                          </div>
                        ) : req.status === 'Dibatalkan' ? (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-500 rounded-full border border-slate-200 font-bold text-[10px] uppercase tracking-tighter">
                            <MinusCircle className="w-3 h-3" /> Dibatalkan
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full border border-red-100 font-bold text-[10px] uppercase tracking-tighter">
                            <XCircle className="w-3 h-3" /> Ditolak
                          </div>
                        )}
                      </div>
                    </td>
                    {/* REVISI: Tambah Button Detail (Sama persis dengan ApprovalSection) */}
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => onViewDetails?.(req)} 
                        className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-100 hover:border-blue-600 rounded-xl transition-all active:scale-90 shadow-sm group/detail"
                        title="Lihat Detail Barang"
                      >
                        <PackageSearch className="w-4 h-4 transition-transform group-hover/detail:scale-110" />
                      </button>
                    </td>
                  </tr>
                ))}
                
                {historyRequests.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-300 text-sm italic font-medium">
                      Belum Ada Riwayat Aktivitas Pengajuan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;