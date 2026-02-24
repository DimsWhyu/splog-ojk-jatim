import React, { useState, useEffect, useRef } from 'react';
import ApprovalSection from './ApprovalSection';
import { 
  History, CheckCircle2, XCircle, PackageSearch, LayoutDashboard, 
  MinusCircle, Search, Calendar, Filter, RotateCcw, ChevronDown, Check,
  Settings, Package, LogOut, AlertCircle
} from 'lucide-react';

const DashboardView = ({ requests, handleApproval, onViewDetails, setView }) => {
  const [filters, setFilters] = useState({
    ref: '',
    name: '',
    date: '',
    status: 'Semua'
  });

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsStatusOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calculate stats
  useEffect(() => {
    const processed = requests.filter(r => r.status !== 'Menunggu');
    setStats({
      total: processed.length,
      approved: processed.filter(r => r.status === 'Disetujui').length,
      rejected: processed.filter(r => r.status === 'Ditolak').length,
      cancelled: processed.filter(r => r.status === 'Batal' || r.status === 'Dibatalkan').length
    });
  }, [requests]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    if (key === 'status') setIsStatusOpen(false);
  };

  const resetFilters = () => {
    setFilters({ ref: '', name: '', date: '', status: 'Semua' });
  };

  const historyRequests = requests
    .filter(r => {
      const isProcessed = r.status !== 'Menunggu';
      const matchesRef = r.id?.toLowerCase().includes(filters.ref.toLowerCase());
      const matchesName = r.user?.toLowerCase().includes(filters.name.toLowerCase());
      const formattedInputDate = filters.date ? filters.date.split('-').reverse().join('/') : '';
      const matchesDate = !filters.date || r.date === formattedInputDate;
      const matchesStatus = filters.status === 'Semua' || r.status === filters.status;
      return isProcessed && matchesRef && matchesName && matchesDate && matchesStatus;
    })
    .sort((a, b) => b.id.localeCompare(a.id));

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Disetujui':
        return (
          <div className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 rounded-full border border-emerald-200 font-black text-[9px] uppercase tracking-wider shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5" /> Disetujui
          </div>
        );
      case 'Batal':
      case 'Dibatalkan':
        return (
          <div className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-600 rounded-full border border-slate-300 font-black text-[9px] uppercase tracking-wider shadow-sm">
            <MinusCircle className="w-3.5 h-3.5" /> Batal
          </div>
        );
      case 'Ditolak':
        return (
          <div className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-red-50 to-red-100 text-red-700 rounded-full border border-red-200 font-black text-[9px] uppercase tracking-wider shadow-sm">
            <XCircle className="w-3.5 h-3.5" /> Ditolak
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. HEADER - ENHANCED */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tighter flex items-center gap-3">
              <LayoutDashboard className="w-6 h-6 md:w-8 md:h-8 text-red-600" />
              <span className="truncate">Persetujuan & Riwayat</span>
            </h2>
            <p className="text-slate-400 font-medium text-[10px] md:text-sm italic flex items-center gap-2">
              Sistem Verifikasi Logistik OJK Jawa Timur
            </p>
          </div>
        </div>

        {/* Stats Summary - NEW */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-[11px] font-black text-emerald-700">{stats.approved} Disetujui</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 rounded-xl border border-red-100">
            <XCircle className="w-4 h-4 text-red-600" />
            <span className="text-[11px] font-black text-red-700">{stats.rejected} Ditolak</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 rounded-xl border border-slate-200">
            <MinusCircle className="w-4 h-4 text-slate-600" />
            <span className="text-[11px] font-black text-slate-700">{stats.cancelled} Batal</span>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden relative" ref={menuRef}>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
          >
            <Settings className="w-5 h-5 text-slate-600" />
          </button>

          {isMenuOpen && (
            <div className="absolute top-16 right-0 w-64 bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200 p-2">
              <div className="space-y-1">
                <button onClick={() => {setView('dashboard'); setIsMenuOpen(false);}} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-red-50 text-slate-600 hover:text-red-600 transition-all font-bold text-xs">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </button>
                <button onClick={() => {setView('admin-inventory'); setIsMenuOpen(false);}} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-red-50 text-slate-600 hover:text-red-600 transition-all font-bold text-xs">
                  <Package className="w-4 h-4" /> Stok Barang
                </button>
                <button onClick={() => {setView('manage-users'); setIsMenuOpen(false);}} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-red-50 text-slate-600 hover:text-red-600 transition-all font-bold text-xs">
                  <Settings className="w-4 h-4" /> Kelola Akun
                </button>
                <hr className="my-2 border-slate-50" />
                <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-600 font-bold text-xs hover:bg-red-50">
                  <LogOut className="w-4 h-4" /> Keluar Sistem
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. SECTION: PERSETUJUAN PENDING */}
      <div className="space-y-4">
        <ApprovalSection requests={requests} handleApproval={handleApproval} onViewDetails={onViewDetails} />
      </div>

      {/* 3. SECTION: RIWAYAT AKTIVITAS - ENHANCED */}
      <div className="space-y-6 pt-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm border border-red-100">
                <History className="w-5 h-5 text-red-600" />
             </div>
             <div>
               <h3 className="text-xl font-bold text-slate-800 tracking-tight">Riwayat Aktivitas Persetujuan</h3>
               <p className="text-[10px] text-slate-400 font-medium">{stats.total} total riwayat</p>
             </div>
          </div>
          <button 
            onClick={resetFilters}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Filter
          </button>
        </div>

        {/* Table - ENHANCED */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-2xl shadow-slate-200/30 overflow-hidden relative">
          <div className="max-h-[650px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-30 bg-gradient-to-r from-slate-800 to-slate-900">
                <tr className="text-white text-[11px] font-black uppercase tracking-wider">
                  <th className="px-6 py-5 text-center w-16 border-b border-slate-700/50">No</th>
                  
                  {/* Filter Kolom Referensi - ENHANCED */}
                  <th className="px-6 py-5 border-b border-slate-700/50 min-w-[200px]">
                    <div className="space-y-2.5">
                      <span className="block ml-1 text-slate-300">Referensi</span>
                      <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-red-400 transition-colors pointer-events-none" />
                        <input 
                          type="text" 
                          placeholder="Cari ID..." 
                          value={filters.ref}
                          onChange={(e) => handleFilterChange('ref', e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-transparent rounded-xl text-xs text-white placeholder-slate-400 focus:border-red-400 focus:bg-slate-700 focus:ring-2 focus:ring-red-400/20 outline-none transition-all duration-300 lowercase font-bold shadow-inner"
                        />
                      </div>
                    </div>
                  </th>

                  {/* Filter Kolom Nama Pengaju - ENHANCED */}
                  <th className="px-6 py-5 border-b border-slate-700/50 min-w-[200px]">
                    <div className="space-y-2.5">
                      <span className="block ml-1 text-slate-300">Nama Pengaju</span>
                      <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-red-400 transition-colors pointer-events-none" />
                        <input 
                          type="text" 
                          placeholder="Cari Nama..." 
                          value={filters.name}
                          onChange={(e) => handleFilterChange('name', e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-transparent rounded-xl text-xs text-white placeholder-slate-400 focus:border-red-400 focus:bg-slate-700 focus:ring-2 focus:ring-red-400/20 outline-none transition-all duration-300 font-bold shadow-inner"
                        />
                      </div>
                    </div>
                  </th>

                  {/* Filter Kolom Tanggal - ENHANCED */}
                  <th className="px-6 py-5 border-b border-slate-700/50 min-w-[170px]">
                    <div className="space-y-2.5">
                      <span className="block ml-1 text-slate-300">Tanggal</span>
                      <div className="relative group cursor-pointer">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-red-400 transition-colors pointer-events-none z-10" />
                        <input 
                          type="date" 
                          value={filters.date}
                          onChange={(e) => handleFilterChange('date', e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-transparent rounded-xl text-xs text-white placeholder-slate-400 focus:border-red-400 focus:bg-slate-700 focus:ring-2 focus:ring-red-400/20 outline-none transition-all duration-300 uppercase font-bold appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 cursor-pointer shadow-inner relative z-0"
                        />
                      </div>
                    </div>
                  </th>

                  {/* Filter Status - ENHANCED */}
                  <th className="px-6 py-5 border-b border-slate-700/50 min-w-[160px]" ref={dropdownRef}>
                    <div className="space-y-2.5">
                      <span className="block ml-1 text-slate-300 text-center">Status Akhir</span>
                      <div className="relative">
                        <button 
                          onClick={() => setIsStatusOpen(!isStatusOpen)}
                          className={`flex items-center justify-between w-full px-4 py-2.5 bg-slate-700/50 border ${isStatusOpen ? 'border-red-400 ring-2 ring-red-400/20' : 'border-transparent'} rounded-xl text-xs font-bold text-white transition-all duration-300 shadow-inner group`}
                        >
                          <div className="flex items-center gap-2">
                            <Filter className={`w-4 h-4 ${isStatusOpen ? 'text-red-400' : 'text-slate-400'} group-hover:text-red-400 transition-colors`} />
                            <span className="uppercase tracking-tighter">{filters.status}</span>
                          </div>
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isStatusOpen ? 'rotate-180 text-red-400' : ''}`} />
                        </button>

                        {isStatusOpen && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-100 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">
                            {['Semua', 'Disetujui', 'Batal', 'Ditolak'].map((option) => (
                              <button 
                                key={option}
                                onClick={() => handleFilterChange('status', option)}
                                className={`flex items-center justify-between w-full px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-wider transition-all
                                  ${filters.status === option 
                                    ? 'bg-red-50 text-red-600' 
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                              >
                                {option}
                                {filters.status === option && <Check className="w-3.5 h-3.5" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </th>

                  <th className="px-6 py-5 text-center border-b border-slate-700/50">Detail Item</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">
                {historyRequests.map((req, index) => (
                  <tr key={req.id} className="hover:bg-gradient-to-r hover:from-red-50/30 hover:to-transparent transition-all duration-300 group">
                    <td className="px-6 py-6 text-center text-xs font-bold text-slate-300 group-hover:text-red-400">
                      {String(index + 1).padStart(2, '0')}
                    </td>
                    <td className="px-6 py-6 text-sm font-black text-slate-700 group-hover:text-red-700 transition-colors">{req.id}</td>
                    <td className="px-6 py-6 text-sm font-bold text-slate-600">{req.user}</td>
                    <td className="px-6 py-6 text-xs font-black text-slate-400 tracking-tighter">
                      {req.date}
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex justify-center">
                        {getStatusBadge(req.status)}
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <button 
                        onClick={() => onViewDetails?.(req)} 
                        className="p-3 bg-blue-50 text-blue-600 hover:bg-red-600 hover:text-white border border-blue-100 hover:border-red-600 rounded-2xl transition-all active:scale-95 shadow-sm group/detail"
                      >
                        <PackageSearch className="w-5 h-5 transition-transform group-hover/detail:scale-110" />
                      </button>
                    </td>
                  </tr>
                ))}
                
                {historyRequests.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-32 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                          <AlertCircle className="w-10 h-10 text-slate-300" />
                        </div>
                        <div>
                          <p className="text-slate-400 font-black text-sm uppercase tracking-wider mb-1">Data Tidak Ditemukan</p>
                          <p className="text-slate-300 font-medium text-xs">Coba ubah filter atau reset pencarian</p>
                        </div>
                        <button 
                          onClick={resetFilters}
                          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-red-100 transition-all"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Reset Filter
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Table Footer - NEW */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
            <p className="text-[10px] font-bold text-slate-400">Menampilkan {historyRequests.length} dari {stats.total} riwayat</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Live Data</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;