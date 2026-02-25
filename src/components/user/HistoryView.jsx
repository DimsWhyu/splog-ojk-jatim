import React, { useState } from 'react';
import StatusBadge from '../common/StatusBadge';
import { Eye, XCircle, ClipboardList, FileText, PackageSearch, AlertCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

const HostoryView = ({ requests, currentUser, onViewDetails, onCancel, downloadXLSX }) => {
  // Filter data milik user yang sedang login
  const userRequests = requests.filter(r => r.user === currentUser?.name);
  const [expandedReason, setExpandedReason] = useState(null);

  // Toggle expand/collapse reason
  const toggleReason = (reqId) => {
    setExpandedReason(expandedReason === reqId ? null : reqId);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-end px-2">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.3)]"></div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tighter flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-red-600" />
            Riwayat Pengajuan
          </h3>
          <p className="text-slate-400 font-bold text-sm italic mt-1 ml-1">
            Pantau status permintaan logistik Anda secara real-time.
          </p>
        </div>
      </div>

      {/* --- CONTAINER SCROLLABLE DENGAN STICKY HEADER --- */}
      <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/40 relative">
        <div className="max-h-[550px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            
            {/* STICKY HEADER */}
            <thead className="sticky top-0 z-20 shadow-md">
              <tr className="bg-slate-800 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-6 border-b border-slate-700">No. Referensi</th>
                <th className="px-8 py-6 border-b border-slate-700">Tgl Pengajuan</th>
                <th className="px-8 py-6 border-b border-slate-700">Tujuan Kebutuhan</th>
                <th className="px-8 py-6 border-b border-slate-700 text-center">Status</th>
                <th className="px-8 py-6 border-b border-slate-700 text-right">Aksi</th>
              </tr>
            </thead>

            {/* BODY TABEL */}
            <tbody className="divide-y divide-slate-50">
              {userRequests.map((req) => (
                <React.Fragment key={req.id}>
                  <tr className="hover:bg-red-50/20 transition-all duration-300 group">
                    <td className="px-8 py-6 font-black text-slate-800 group-hover:text-red-600 transition-colors">
                      {req.id}
                    </td>
                    <td className="px-8 py-6 text-sm text-slate-400 font-black italic">
                      {req.date || "-"}
                    </td>
                    <td className="px-8 py-6 text-sm text-slate-600 font-bold italic truncate max-w-[250px]">
                      "{req.note || "Tanpa Catatan"}"
                    </td>
                    <td className="px-8 py-6 text-center">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-end gap-3">
                        {/* Tombol Detail */}
                        <button 
                          onClick={() => onViewDetails(req)}
                          className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all active:scale-90 shadow-sm"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Tombol Download Excel */}
                        <button 
                          onClick={() => downloadXLSX(req)}
                          className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all active:scale-90 shadow-sm"
                          title="Download Excel"
                        >
                          <FileText className="w-4 h-4" />
                        </button>

                        {/* Tombol Batal: Hanya muncul jika status masih 'Menunggu' */}
                        {req.status === 'Menunggu' && (
                          <button 
                            onClick={() => onCancel(req)}
                            className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all active:scale-90 shadow-sm"
                            title="Batalkan Pengajuan"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* REJECTION REASON ROW - Admin Reject */}
                  {req.status === 'Ditolak' && req.rejectionReason && (
                    <tr className="bg-red-50/30">
                      <td colSpan="5" className="px-8 py-0">
                        <div className="py-4">
                          <button
                            onClick={() => toggleReason(req.id)}
                            className="flex items-center gap-2 text-red-600 font-bold text-[11px] tracking-tight hover:text-red-700 transition-colors"
                          >
                            <AlertTriangle className="w-4 h-4" />
                            Alasan Penolakan (Admin)
                            {expandedReason === req.id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                          
                          {expandedReason === req.id && (
                            <div className="mt-3 p-4 bg-white border border-red-200 rounded-[13px] animate-in fade-in slide-in-from-top-2 duration-200">
                              <p className="text-slate-700 text-[12px] font-medium leading-relaxed">
                                {req.rejectionReason}
                              </p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* CANCELLATION REASON ROW - User Cancel - BARU */}
                  {req.status === 'Dibatalkan' && req.cancellationReason && (
                    <tr className="bg-orange-50/30">
                      <td colSpan="5" className="px-8 py-0">
                        <div className="py-4">
                          <button
                            onClick={() => toggleReason(req.id)}
                            className="flex items-center gap-2 text-orange-600 font-bold text-[11px] tracking-tight hover:text-orange-700 transition-colors"
                          >
                            <AlertCircle className="w-4 h-4" />
                            Alasan Pembatalan (Anda)
                            {expandedReason === req.id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                          
                          {expandedReason === req.id && (
                            <div className="mt-3 p-4 bg-white border border-orange-200 rounded-[13px] animate-in fade-in slide-in-from-top-2 duration-200">
                              <p className="text-slate-700 text-[12px] font-medium leading-relaxed">
                                {req.cancellationReason}
                              </p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* State jika riwayat kosong */}
        {userRequests.length === 0 && (
          <div className="py-24 text-center bg-slate-50/50">
            <div className="flex flex-col items-center gap-3">
              <PackageSearch className="w-12 h-12 text-slate-200" />
              <p className="text-slate-400 font-black italic text-xs uppercase tracking-widest">
                Belum ada riwayat pengajuan logistik.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HostoryView;