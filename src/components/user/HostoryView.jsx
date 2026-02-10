import React from 'react';
import StatusBadge from '../common/StatusBadge';
import { Eye, XCircle, ClipboardList } from 'lucide-react';

const HistoryView = ({ requests, currentUser, onViewDetails, onCancel }) => {
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
      <div className="flex justify-between items-end px-2">
        <div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <ClipboardList className="w-8 h-8 text-red-600" />Riwayat Pengajuan</h3>
          <p className="text-slate-400 font-medium text-sm italic mt-1">Pantau status permintaan logistik Anda secara real-time.</p>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-xl shadow-slate-200/50">
        <table className="w-full text-left">
          <thead className="bg-gradient-to-r from-red-600 to-[#4a0404] text-[10px] font-black text-white uppercase tracking-widest">
            <tr>
              <th className="px-8 py-6">No. Referensi</th>
              <th className="px-8 py-6">Tgl Pengajuan</th>
              <th className="px-8 py-6">Justifikasi</th>
              <th className="px-8 py-6 text-center">Status Verifikasi</th>
              <th className="px-8 py-6 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {/* Disesuaikan: Filter berdasarkan currentUser yang sedang login */}
            {requests
              .filter(r => r.user === currentUser?.name)
              .map(req => (
                <tr key={req.id} className="hover:bg-red-50/10 transition-colors group">
                  <td className="px-8 py-6 font-black text-slate-800 group-hover:text-red-600 transition-colors">
                    {req.id}
                  </td>
                  <td className="px-8 py-6 text-sm text-slate-400 font-bold">
                    {req.date}
                  </td>
                  <td className="px-8 py-6 text-sm text-slate-600 font-bold italic truncate max-w-[200px]">
                    "{req.note}"
                  </td>
                  <td className="px-8 py-6 text-center">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-end gap-3">
                      {/* Tombol Lihat Detail yang sudah berfungsi */}
                      <button 
                        onClick={() => onViewDetails(req)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                      >
                        <Eye className="w-3 h-3" />
                        Detail
                      </button>

                      {/* Tombol Batal: Hanya muncul jika status masih 'Menunggu' */}
                      {req.status === 'Menunggu' && (
                        <button 
                          onClick={() => onCancel(req)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm"
                        >
                          <XCircle className="w-3 h-3" />
                          Batal
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
            ))}
          </tbody>
        </table>

        {/* State jika riwayat kosong */}
        {requests.filter(r => r.user === currentUser?.name).length === 0 && (
          <div className="p-20 text-center">
            <p className="text-slate-400 font-bold italic">Belum ada riwayat pengajuan logistik.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;