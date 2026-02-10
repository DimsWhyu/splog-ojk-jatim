import React from 'react';
import { 
  Package, 
  ClipboardList, 
  ShoppingCart,
  LayoutDashboard,
  Archive,
  Truck,
  TrendingUp,
  User,
  LogOut
} from 'lucide-react';
import { useCart } from '../../context/CartContext';

const MobileBottomNav = ({ role, view, setView }) => {
  const { cart } = useCart();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-red-50 px-8 py-4 z-50 flex justify-between items-center shadow-lg rounded-t-[32px]">
      {role === 'user' ? (
        <>
          <button onClick={() => setView('catalog')} className={`flex flex-col items-center gap-1 ${view === 'catalog' ? 'text-red-600' : 'text-slate-300'}`}>
            <Package className="w-6 h-6"/>
            <span className="text-[8px] font-black uppercase">Katalog</span>
          </button>
          <button onClick={() => setView('history')} className={`flex flex-col items-center gap-1 ${view === 'history' ? 'text-red-600' : 'text-slate-300'}`}>
            <ClipboardList className="w-6 h-6"/>
            <span className="text-[8px] font-black uppercase">Status</span>
          </button>
          <div className="relative -mt-12 bg-red-600 p-4 rounded-3xl shadow-xl ring-8 ring-white" onClick={() => setView('cart')}>
            <ShoppingCart className="text-white w-6 h-6"/>
            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-white text-red-600 text-[10px] font-black px-1.5 py-0.5 rounded-full ring-2 ring-red-600">{cart.length}</span>}
          </div>
          <button className="flex flex-col items-center gap-1 text-slate-300"><User className="w-6 h-6"/><span className="text-[8px] font-black uppercase">Profil</span></button>
          <button className="flex flex-col items-center gap-1 text-slate-300"><LogOut className="w-6 h-6"/><span className="text-[8px] font-black uppercase">Keluar</span></button>
        </>
      ) : (
        <>
          <button onClick={() => setView('dashboard')} className={`flex flex-col items-center gap-1 ${view === 'dashboard' ? 'text-red-600' : 'text-slate-300'}`}><LayoutDashboard className="w-6 h-6"/><span className="text-[8px] font-black uppercase">Panel</span></button>
          <button onClick={() => setView('admin-inventory')} className={`flex flex-col items-center gap-1 ${view === 'admin-inventory' ? 'text-red-600' : 'text-slate-300'}`}><Archive className="w-6 h-6"/><span className="text-[8px] font-black uppercase">Stok</span></button>
          <button className="flex flex-col items-center gap-1 text-slate-300"><Truck className="w-6 h-6"/><span className="text-[8px] font-black uppercase">Vendor</span></button>
          <button className="flex flex-col items-center gap-1 text-slate-300"><TrendingUp className="w-6 h-6"/><span className="text-[8px] font-black uppercase">Laporan</span></button>
        </>
      )}
    </div>
  );
};

export default MobileBottomNav;