import React from 'react';
import StatusBadge from '../common/StatusBadge';

const HistoryApprovalSection = ({ requests }) => {
  const completedRequests = requests.filter(r => r.status !== 'Menunggu');

  return (
    <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm">
      <div className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Riwayat Aktivitas Persetujuan</span>
        </div>
      </div>
      <div className="divide-y divide-slate-50">
        {completedRequests.map(req => (
          <div key={req.id} className="p-8 hover:bg-slate-50/50 transition-all flex items-center gap-8">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg border-2 ${req.status === 'Disetujui' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-orange-50 border-orange-100 text-orange-600'}`}>
              {req.id.split('-')[1]}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h5 className="font-bold text-slate-700">{req.user}</h5>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">{req.date}</span>
              </div>
              <p className="text-xs text-slate-400 font-medium truncate max-w-md italic">"{req.note}"</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Status Akhir</p>
                <StatusBadge status={req.status} />
              </div>
            </div>
          </div>
        ))}
        {completedRequests.length === 0 && (
          <div className="p-16 text-center text-slate-200 font-bold italic">
            Belum ada riwayat aktivitas hari ini.
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryApprovalSection;