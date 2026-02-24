import React, { useState } from 'react';
import { Check, X, Clock, User, MessageSquare, Calendar, PackageSearch, AlertCircle, FileText, TrendingUp, CheckCircle2 } from 'lucide-react';

const ApprovalSection = ({ requests, handleApproval, onViewDetails }) => {
  const pendingRequests = requests.filter(r => r.status === 'Menunggu');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(null);

  // Helper untuk format tanggal dd-mm-yyyy
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return dateStr.split('-').reverse().join('/');
  };

  // Handle klik tombol Tolak
  const handleRejectClick = (reqId) => {
    setSelectedRequestId(reqId);
    setShowRejectModal(true);
    setRejectReason('');
  };

  // Handle submit penolakan
  const handleRejectSubmit = () => {
    if (rejectReason.trim()) {
      setIsProcessing(selectedRequestId);
      handleApproval(selectedRequestId, 'Ditolak', rejectReason);
      setTimeout(() => {
        setShowRejectModal(false);
        setRejectReason('');
        setSelectedRequestId(null);
        setIsProcessing(null);
      }, 500);
    }
  };

  // Handle approve dengan loading state
  const handleApproveClick = (reqId) => {
    setIsProcessing(reqId);
    handleApproval(reqId, 'Disetujui');
    setTimeout(() => setIsProcessing(null), 500);
  };

  // Get urgency level based on request age
  const getUrgencyLevel = (dateStr) => {
    if (!dateStr) return 'normal';
    const days = Math.floor((new Date() - new Date(dateStr.split('-').reverse().join('-'))) / (1000 * 60 * 60 * 24));
    if (days > 7) return 'high';
    if (days > 3) return 'medium';
    return 'normal';
  };

  return (
    <div className="bg-white rounded-[13px] border border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/50 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. HEADER SECTION (MAROON STYLE) - ENHANCED */}
      <div className="p-6 bg-gradient-to-r from-[#B91C1C] to-[#991b1b] text-white flex justify-between items-center relative overflow-hidden">
        {/* Dekorasi Background Halus */}
        <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 border border-white/10"></div>
        <div className="absolute left-0 bottom-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16 border border-white/10"></div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-lg">
            <Clock className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h4 className="text-xl tracking-tight font-black">Persetujuan Pengadaan</h4>
              {pendingRequests.length > 0 && (
                <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full text-[10px] font-black uppercase tracking-wider border border-white/20">
                  {pendingRequests.length} Pending
                </span>
              )}
            </div>
            <p className="text-[10px] font-medium text-red-100 mt-0.5 flex items-center gap-2">
              <TrendingUp className="w-3 h-3" /> Antrian Pengajuan Logistik
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 bg-white/20 backdrop-blur-md px-5 py-2 rounded-full border border-white/30 relative z-10">
           <FileText className="w-4 h-4 text-white/80" />
           <span className="text-[11px] font-black">Total: {pendingRequests.length} Permintaan</span>
        </div>
      </div>

      {/* 2. LIST CONTENT - ENHANCED */}
      <div className="divide-y divide-slate-50">
        {pendingRequests.map((req, index) => {
          const urgency = getUrgencyLevel(req.date);
          const isProcessingThis = isProcessing === req.id;
          
          return (
            <div 
              key={req.id} 
              className={`p-6 hover:bg-gradient-to-r hover:from-slate-50/80 hover:to-red-50/30 transition-all duration-300 flex flex-col lg:flex-row lg:items-center gap-6 group relative overflow-hidden ${
                urgency === 'high' ? 'border-l-4 border-l-red-500 bg-red-50/20' : 
                urgency === 'medium' ? 'border-l-4 border-l-amber-500' : ''
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Urgency Indicator */}
              {urgency === 'high' && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full text-[9px] font-black uppercase tracking-wider animate-pulse">
                  <AlertCircle className="w-3 h-3" /> Urgent
                </div>
              )}
              
              {/* ID Badge Bulat Elegan - ENHANCED */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 flex flex-col items-center justify-center shrink-0 group-hover:border-red-300 group-hover:shadow-lg transition-all duration-300 shadow-inner relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <span className="text-[8px] font-black text-slate-400 tracking-tighter relative z-10">REQ</span>
                 <span className="text-lg font-black text-red-600 leading-none relative z-10">{req.id.split('-')[1]}</span>
              </div>

              {/* Informasi Pengaju - ENHANCED */}
              <div className="flex-1 space-y-3 min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 bg-gradient-to-r from-slate-100 to-slate-50 px-4 py-2 rounded-xl border border-slate-200 hover:border-red-200 transition-all">
                     <User className="w-4 h-4 text-slate-500" />
                     <h5 className="font-bold text-slate-800 text-sm tracking-tight">{req.user}</h5>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 bg-slate-50 px-3 py-2 rounded-xl">
                     <Calendar className="w-3.5 h-3.5" />
                     <span className="text-[10px] font-bold tracking-tight">{formatDate(req.date)}</span>
                  </div>
                  {urgency !== 'normal' && (
                    <div className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                      urgency === 'high' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {urgency === 'high' ? '> 7 Hari' : '> 3 Hari'}
                    </div>
                  )}
                </div>

                {/* Justifikasi / Catatan - ENHANCED */}
                <div className="flex items-start gap-3 pl-1 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                  <MessageSquare className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1">Catatan Pengaju</p>
                    <p className="text-[13px] text-slate-600 font-medium italic leading-relaxed line-clamp-2">
                      "{req.note}"
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. ACTION BUTTONS (MODERN & TACTILE) - ENHANCED */}
              <div className="flex items-center gap-3 shrink-0 lg:border-l lg:pl-6 lg:border-slate-100">
                {/* Detail Button */}
                <button 
                  onClick={() => onViewDetails(req)} 
                  disabled={isProcessingThis}
                  className="p-3.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border-2 border-blue-100 hover:border-blue-600 rounded-xl transition-all active:scale-90 shadow-sm group/detail disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Lihat Detail Barang"
                >
                  <PackageSearch className="w-5 h-5 transition-transform group-hover/detail:scale-110" />
                </button>

                {/* Reject Button - ENHANCED */}
                <button 
                  onClick={() => handleRejectClick(req.id)} 
                  disabled={isProcessingThis}
                  className="group/btn flex items-center gap-2 px-5 py-3 bg-white text-slate-500 hover:text-red-600 hover:bg-red-50 border-2 border-slate-200 hover:border-red-300 rounded-xl transition-all active:scale-90 shadow-sm font-bold text-xs uppercase tracking-tight disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-4 h-4 transition-transform group-hover/btn:rotate-90" />
                  {isProcessingThis ? '...' : 'Tolak'}
                </button>

                {/* Approve Button - ENHANCED */}
                <button 
                  onClick={() => handleApproveClick(req.id)} 
                  disabled={isProcessingThis}
                  className="group/btn flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-200 font-bold text-xs uppercase tracking-tight disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] justify-center"
                >
                  {isProcessingThis ? (
                    <Clock className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4 transition-transform group-hover/btn:scale-125" />
                      Setujui
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}

        {/* EMPTY STATE - ENHANCED */}
        {pendingRequests.length === 0 && (
          <div className="py-32 flex flex-col items-center justify-center bg-gradient-to-b from-slate-50/50 to-white">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-full flex items-center justify-center mb-6 border-4 border-emerald-200 shadow-lg">
               <Check className="w-12 h-12 text-emerald-500" />
            </div>
            <h3 className="text-xl font-black text-slate-700 mb-2">Semua Pengajuan Telah Diproses</h3>
            <p className="text-slate-400 font-medium text-sm text-center max-w-md">
              Tidak ada pengajuan pending saat ini. Semua permintaan telah ditinjau dan diproses.
            </p>
            <div className="mt-6 flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-[11px] font-black uppercase tracking-wider">Status: Semua Clear</span>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER INFO - ENHANCED */}
      <div className="px-8 py-5 bg-gradient-to-r from-slate-50 to-slate-100/50 border-t border-slate-100 flex justify-between items-center">
         <div className="flex items-center gap-3">
           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
           <p className="text-[11px] font-bold text-slate-400 tracking-tight">SPLOG Kantor OJK Provinsi Jawa Timur • Dashboard Approval</p>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
            <div className="w-2 h-2 rounded-full bg-slate-300"></div>
            <div className="w-2 h-2 rounded-full bg-slate-300"></div>
            <span className="text-[9px] font-bold text-slate-400 ml-2 uppercase tracking-wider">Live Updates</span>
         </div>
      </div>

      {/* MODAL REJECTION REASON - ENHANCED */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[999] flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-white rounded-[20px] shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
            {/* Header Modal - ENHANCED */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 shadow-lg">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-black text-lg">Konfirmasi Penolakan</h4>
                  <p className="text-red-100 text-[11px] font-medium mt-0.5">Alasan penolakan pengajuan</p>
                </div>
              </div>
            </div>

            {/* Body Modal - ENHANCED */}
            <div className="p-6 space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-amber-800 text-[12px] font-medium flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>Silakan isi alasan mengapa pengajuan ini ditolak. Keterangan ini akan terlihat oleh pemohon dan tidak dapat diubah setelah disimpan.</span>
                </p>
              </div>
              
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  Alasan Penolakan <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Contoh: Stok barang masih tersedia, anggaran tidak mencukupi, dokumen tidak lengkap, dll..."
                  className="w-full h-36 px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-[12px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none transition-all placeholder:text-slate-400"
                  autoFocus
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[9px] text-slate-400 font-medium">{rejectReason.length} karakter</span>
                  {rejectReason.trim() === '' && (
                    <span className="text-[9px] text-red-500 font-bold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Wajib diisi
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Modal - ENHANCED */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedRequestId(null);
                }}
                disabled={isProcessing}
                className="flex-1 px-4 py-3.5 bg-white text-slate-600 border-2 border-slate-200 rounded-xl font-bold text-[11px] uppercase tracking-wider hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={rejectReason.trim() === '' || isProcessing}
                className="flex-1 px-4 py-3.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-bold text-[11px] uppercase tracking-wider hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-200 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4" />
                    Tolak Pengajuan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalSection;