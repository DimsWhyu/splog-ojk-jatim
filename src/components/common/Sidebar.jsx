import React from 'react';
import { 
  Package, 
  ClipboardList, 
  LayoutDashboard, 
  Archive,
  Users,
  PlusCircle, 
  X,
  ChevronRight,
  LogOut,
  ShoppingCart
} from 'lucide-react';

const Sidebar = ({ role, view, setView, isOpen, setIsOpen, currentUser, onLogout }) => {
  return (
    <>
      {/* 1. BACKDROP: Area gelap transparan */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 2. SIDEBAR CONTAINER */}
      <aside className={`
        fixed lg:sticky top-0 lg:top-28 left-0 
        h-full lg:h-fit w-[280px] md:w-[320px] lg:w-72 
        bg-white lg:bg-transparent z-[200] lg:z-0
        border-r lg:border-none border-slate-100
        transition-transform duration-500 ease-in-out transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col lg:block shadow-2xl lg:shadow-none
      `}>
        
        {/* HEADER DRAWER (Mobile Only) */}
        <div className="p-8 bg-gradient-to-br from-red-700 to-[#4a0404] text-white lg:hidden relative">
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-6 p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          
          <div className="flex flex-col items-center text-center mt-4">
            <div className="w-16 h-16 bg-white/20 rounded-[20px] flex items-center justify-center mb-4 border border-white/30 text-2xl font-black shadow-inner uppercase">
               {currentUser?.name?.substring(0, 1) || 'D'}
            </div>
            <h3 className="font-bold text-lg leading-tight truncate w-full">
              {currentUser?.name || 'User OJK'}
            </h3>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mt-1">
              {role} ACCESS • OJK JATIM
            </p>
          </div>
        </div>

        {/* LIST TOMBOL NAVIGASI */}
        <div className="flex-1 lg:flex-none p-6 lg:p-0 space-y-2 lg:space-y-1 overflow-y-auto custom-scrollbar">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-4 mb-4">
            Navigasi Utama
          </p>

          {role === 'user' ? (
            <>
              <button 
                onClick={() => { setView('catalog'); setIsOpen(false); }}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-sm font-black transition-all ${
                  view === 'catalog' ? 'bg-red-600 text-white shadow-xl shadow-red-200' : 'text-slate-500 hover:bg-slate-50 hover:text-red-600'
                }`}
              >
                <div className="flex items-center gap-4"><Package className="w-5 h-5" /> Katalog Logistik</div>
                <ChevronRight className={`w-4 h-4 lg:hidden ${view === 'catalog' ? 'opacity-100' : 'opacity-0'}`} />
              </button>

              {/* --- REVISI: TAMBAH BUTTON KERANJANG UNTUK USER --- */}
              <button 
                onClick={() => { setView('cart'); setIsOpen(false); }}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-sm font-black transition-all ${
                  view === 'cart' ? 'bg-red-600 text-white shadow-xl shadow-red-200' : 'text-slate-500 hover:bg-slate-50 hover:text-red-600'
                }`}
              >
                <div className="flex items-center gap-4"><ShoppingCart className="w-5 h-5" /> Keranjang Saya</div>
                <ChevronRight className={`w-4 h-4 lg:hidden ${view === 'cart' ? 'opacity-100' : 'opacity-0'}`} />
              </button>

              <button 
                onClick={() => { setView('history'); setIsOpen(false); }}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-sm font-black transition-all ${
                  view === 'history' ? 'bg-red-600 text-white shadow-xl shadow-red-200' : 'text-slate-500 hover:bg-slate-50 hover:text-red-600'
                }`}
              >
                <div className="flex items-center gap-4"><ClipboardList className="w-5 h-5" /> Lacak Pengajuan</div>
                <ChevronRight className={`w-4 h-4 lg:hidden ${view === 'history' ? 'opacity-100' : 'opacity-0'}`} />
              </button>
            </>
          ) : (
            <>
              {/* NAVIGASI ADMIN (Tetap Sama) */}
              <button 
                onClick={() => { setView('dashboard'); setIsOpen(false); }}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-sm font-black transition-all ${
                  view === 'dashboard' ? 'bg-red-600 text-white shadow-xl shadow-red-200' : 'text-slate-500 hover:bg-slate-50 hover:text-red-600'
                }`}
              >
                <div className="flex items-center gap-4"><LayoutDashboard className="w-5 h-5" /> Panel Dashboard</div>
                <ChevronRight className={`w-4 h-4 lg:hidden ${view === 'dashboard' ? 'opacity-100' : 'opacity-0'}`} />
              </button>

              <button 
                onClick={() => { setView('admin-inventory'); setIsOpen(false); }}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-sm font-black transition-all ${
                  view === 'admin-inventory' ? 'bg-red-600 text-white shadow-xl shadow-red-200' : 'text-slate-500 hover:bg-slate-50 hover:text-red-600'
                }`}
              >
                <div className="flex items-center gap-4"><Archive className="w-5 h-5" /> Stok Barang</div>
                <ChevronRight className={`w-4 h-4 lg:hidden ${view === 'admin-inventory' ? 'opacity-100' : 'opacity-0'}`} />
              </button>

              <button 
                onClick={() => { setView('add-item'); setIsOpen(false); }}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-sm font-black transition-all ${
                  view === 'add-item' ? 'bg-red-600 text-white shadow-xl shadow-red-200' : 'text-slate-500 hover:bg-slate-50 hover:text-red-600'
                }`}
              >
                <div className="flex items-center gap-4"><PlusCircle className="w-5 h-5" /> Tambah Barang</div>
                <ChevronRight className={`w-4 h-4 lg:hidden ${view === 'add-item' ? 'opacity-100' : 'opacity-0'}`} />
              </button>

              <button 
                onClick={() => { setView('manage-users'); setIsOpen(false); }}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-sm font-black transition-all ${
                  view === 'manage-users' ? 'bg-red-600 text-white shadow-xl shadow-red-200' : 'text-slate-500 hover:bg-slate-50 hover:text-red-600'
                }`}
              >
                <div className="flex items-center gap-4"><Users className="w-5 h-5" /> Kelola Akun</div>
                <ChevronRight className={`w-4 h-4 lg:hidden ${view === 'manage-users' ? 'opacity-100' : 'opacity-0'}`} />
              </button>
            </>
          )}
        </div>

        {/* 3. FOOTER DRAWER */}
        <div className="p-6 border-t border-slate-50 lg:hidden mt-auto">
          <button 
            onClick={() => { onLogout(); setIsOpen(false); }} 
            className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all shadow-sm"
          >
            <LogOut className="w-4 h-4" /> Keluar Sistem
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;