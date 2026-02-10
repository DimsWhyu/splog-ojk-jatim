import React from 'react';
import { 
  Package, 
  ClipboardList, 
  LayoutDashboard, 
  Archive,
  Users,
  PlusCircle // TAMBAHKAN ICON PLUS UNTUK TAMBAH BARANG
} from 'lucide-react';

const Sidebar = ({ role, view, setView }) => {
  return (
    <aside className="sticky top-28 hidden lg:block w-72 shrink-0 space-y-8 self-start h-fit transition-all duration-300">
      <div className="space-y-1">
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-4 mb-4">
          Panel Navigasi
        </p>

        {role === 'user' ? (
          <>
            <button 
              onClick={() => setView('catalog')}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-black transition-all ${
                view === 'catalog' 
                ? 'bg-red-600 text-white shadow-xl shadow-red-200 scale-[1.02]' 
                : 'text-slate-500 hover:bg-white hover:text-red-600'
              }`}
            >
              <Package className="w-5 h-5" /> Katalog Logistik
            </button>

            <button 
              onClick={() => setView('history')}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-black transition-all ${
                view === 'history' 
                ? 'bg-red-600 text-white shadow-xl shadow-red-200 scale-[1.02]' 
                : 'text-slate-500 hover:bg-white hover:text-red-600'
              }`}
            >
              <ClipboardList className="w-5 h-5" /> Lacak Pengajuan
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => setView('dashboard')}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-black transition-all ${
                view === 'dashboard' 
                ? 'bg-red-600 text-white shadow-xl shadow-red-200 scale-[1.02]' 
                : 'text-slate-500 hover:bg-white hover:text-red-600'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" /> Dashboard Admin
            </button>

            <button 
              onClick={() => setView('admin-inventory')}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-black transition-all ${
                view === 'admin-inventory' 
                ? 'bg-red-600 text-white shadow-xl shadow-red-200 scale-[1.02]' 
                : 'text-slate-500 hover:bg-white hover:text-red-600'
              }`}
            >
              <Archive className="w-5 h-5" /> Inventaris Kantor
            </button>

            {/* BARU: Button Tambah Barang */}
            <button 
              onClick={() => setView('add-item')}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-black transition-all ${
                view === 'add-item' 
                ? 'bg-red-600 text-white shadow-xl shadow-red-200 scale-[1.02]' 
                : 'text-slate-500 hover:bg-white hover:text-red-600'
              }`}
            >
              <PlusCircle className="w-5 h-5" /> Tambah Barang
            </button>

            <button 
              onClick={() => setView('manage-users')}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-black transition-all ${
                view === 'manage-users' 
                ? 'bg-red-600 text-white shadow-xl shadow-red-200 scale-[1.02]' 
                : 'text-slate-500 hover:bg-white hover:text-red-600'
              }`}
            >
              <Users className="w-5 h-5" /> Manajemen User
            </button>
          </>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;