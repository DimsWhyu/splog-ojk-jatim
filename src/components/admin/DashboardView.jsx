import React, { useState, useEffect, useRef } from 'react';
import ApprovalSection from './ApprovalSection';
import { 
  History, CheckCircle2, XCircle, PackageSearch, LayoutDashboard, 
  MinusCircle, Search, Calendar, Filter, RotateCcw, ChevronDown, Check,
  Settings, Package, LogOut // Tambahan Icon untuk Menu
} from 'lucide-react';

const DashboardView = ({ requests, handleApproval, onViewDetails, setView }) => {
  // --- KODE ASLI DIMAS (TETAP) ---
  const [filters, setFilters] = useState({
    ref: '',
    name: '',
    date: '',
    status: 'Semua'
  });

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const dropdownRef = useRef(null);

  // --- PENYESUAIAN 1: TAMBAH STATE & REF MENU ---
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsStatusOpen(false);
      }
      // Logika tutup menu jika klik di luar
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    if (key === 'status') setIsStatusOpen(false);
  };

  const resetFilters = () => {
    setFilters({ ref: '', name: '', date: '', status: 'Semua' });
  };

  // --- KODE ASLI DIMAS (LOGIKA FILTER TETAP) ---
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

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* --- PENYESUAIAN 2: HEADER DENGAN BURGER MENU MOBILE --- */}
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-4">
          <div className="w-1.5 h-12 bg-red-600 rounded-full mt-1 hidden md:block"></div>
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tighter flex items-center gap-3">
              <LayoutDashboard className="w-6 h-6 md:w-8 md:h-8 text-red-600" />
              <span className="truncate">Persetujuan & Riwayat</span>
            </h2>
            <p className="text-slate-400 font-medium text-[10px] md:text-sm italic">Sistem Verifikasi Logistik OJK Jawa Timur</p>
          </div>
        </div>

        {/* COMPONENT BURGER MENU (Hanya muncul di layar kecil) */}
        <div className="md:hidden relative" ref={menuRef}>

          {/* DROPDOWN NAVIGASI MOBILE */}
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

      {/* 3. SECTION: RIWAYAT AKTIVITAS DENGAN MODERN HEADER FILTER */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-red-50 rounded-xl shadow-sm">
                <History className="w-5 h-5 text-red-600" />
             </div>
             <h3 className="text-xl font-bold text-slate-800 tracking-tight">Riwayat Aktivitas Persetujuan</h3>
          </div>
          <button 
            onClick={resetFilters}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Filter
          </button>
        </div>

        <div className="bg-white rounded-[32px] border border-slate-100 shadow-2xl shadow-slate-200/30 overflow-hidden relative">
          <div className="max-h-[650px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-30 bg-slate-800">
                <tr className="text-white text-[12px] font-bold uppercase">
                  <th className="px-6 py-5 text-center w-16 border-b border-slate-700/50">No</th>
                  
                  {/* Filter Kolom Referensi */}
                  <th className="px-6 py-5 border-b border-slate-700/50 min-w-[200px]">
                    <div className="space-y-2.5">
                      <span className="block ml-1">Referensi</span>
                      <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-red-400 transition-colors pointer-events-none" />
                        <input 
                          type="text" placeholder="Cari ID..." value={filters.ref}
                          onChange={(e) => handleFilterChange('ref', e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-transparent rounded-xl text-xs text-white placeholder-slate-400 focus:border-red-400 focus:bg-slate-700 focus:ring-2 focus:ring-red-400/20 outline-none transition-all duration-300 lowercase font-bold shadow-inner"
                        />
                      </div>
                    </div>
                  </th>

                  {/* Filter Kolom Nama Pengaju */}
                  <th className="px-6 py-5 border-b border-slate-700/50 min-w-[200px]">
                    <div className="space-y-2.5">
                      <span className="block ml-1">Nama Pengaju</span>
                      <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-red-400 transition-colors pointer-events-none" />
                        <input 
                          type="text" placeholder="Cari Nama..." value={filters.name}
                          onChange={(e) => handleFilterChange('name', e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-transparent rounded-xl text-xs text-white placeholder-slate-400 focus:border-red-400 focus:bg-slate-700 focus:ring-2 focus:ring-red-400/20 outline-none transition-all duration-300 font-bold shadow-inner"
                        />
                      </div>
                    </div>
                  </th>

                  {/* Filter Kolom Tanggal */}
                  <th className="px-6 py-5 border-b border-slate-700/50 min-w-[170px]">
                    <div className="space-y-2.5">
                      <span className="block ml-1">Tanggal</span>
                      <div className="relative group cursor-pointer">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-red-400 transition-colors pointer-events-none z-10" />
                        <input 
                          type="date" value={filters.date}
                          onChange={(e) => handleFilterChange('date', e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-transparent rounded-xl text-xs text-white placeholder-slate-400 focus:border-red-400 focus:bg-slate-700 focus:ring-2 focus:ring-red-400/20 outline-none transition-all duration-300 uppercase font-bold appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 cursor-pointer shadow-inner relative z-0"
                        />
                      </div>
                    </div>
                  </th>

                  {/* --- REVISI: MODERN CUSTOM DROPDOWN STATUS --- */}
                  <th className="px-6 py-5 border-b border-slate-700/50 min-w-[160px]" ref={dropdownRef}>
                    <div className="space-y-2.5">
                      <span className="block ml-1 text-center">Status Akhir</span>
                      <div className="relative">
                        {/* Tombol Pemicu Dropdown */}
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

                        {/* List Opsi Dropdown (Pop-up Style) */}
                        {isStatusOpen && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-100 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">
                            {['Semua', 'Disetujui', 'Batal', 'Ditolak'].map((option) => (
                              <button 
                                key={option}
                                onClick={() => handleFilterChange('status', option)}
                                className={`flex items-center justify-between w-full px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-widest transition-all
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
                  <tr key={req.id} className="hover:bg-red-50/30 transition-all duration-300 group">
                    <td className="px-6 py-6 text-center text-xs font-bold text-slate-300 group-hover:text-red-300">
                      {String(index + 1).padStart(2, '0')}
                    </td>
                    <td className="px-6 py-6 text-sm font-black text-slate-700 group-hover:text-red-700 transition-colors">{req.id}</td>
                    <td className="px-6 py-6 text-sm font-bold text-slate-600">{req.user}</td>
                    <td className="px-6 py-6 text-xs font-black text-slate-400 tracking-tighter">
                      {req.date}
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex justify-center">
                        {req.status === 'Disetujui' ? (
                          <div className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 font-black text-[9px] uppercase tracking-widest shadow-sm animate-in zoom-in-95">
                            <CheckCircle2 className="w-3 h-3" /> Disetujui
                          </div>
                        ) : req.status === 'Batal' || req.status === 'Dibatalkan' ? (
                          <div className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-100 text-slate-500 rounded-full border border-slate-200 font-black text-[9px] uppercase tracking-widest shadow-sm animate-in zoom-in-95">
                            <MinusCircle className="w-3 h-3" /> Batal
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-4 py-1.5 bg-red-50 text-red-600 rounded-full border border-red-100 font-black text-[9px] uppercase tracking-widest shadow-sm animate-in zoom-in-95">
                            <XCircle className="w-3 h-3" /> Ditolak
                          </div>
                        )}
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
                    <td colSpan="6" className="py-24 text-center">
                      <div className="flex flex-col items-center gap-3 animate-pulse text-slate-300 font-black text-[10px] uppercase tracking-widest">
                        <PackageSearch className="w-12 h-12 mb-2 opacity-50" />
                        Data Tidak Ditemukan
                      </div>
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