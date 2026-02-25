import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingCart, User, Search, X, LogOut, ChevronDown, Mail, 
  Menu
} from 'lucide-react';
import { useCart } from '../../context/CartContext';

const Navbar = ({ role, currentUser, onLogout, searchQuery, setSearchQuery, setView, inventory = [], setIsSidebarOpen }) => {
  const { cart } = useCart();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  const searchRef = useRef(null);
  const profileRef = useRef(null);

  const totalQty = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setFocusedIndex(-1);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const suggestions = inventory.filter(item => 
    searchQuery && 
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
    item.name?.toLowerCase() !== searchQuery.toLowerCase()
  );

  const handleSelectSuggestion = (name) => {
    setSearchQuery(name);
    setShowSuggestions(false);
    setFocusedIndex(-1);
    setView('catalog');
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (focusedIndex >= 0 && focusedIndex < suggestions.length) {
        handleSelectSuggestion(suggestions[focusedIndex].name);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setFocusedIndex(-1);
    }
  };

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-[100] shadow-sm">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 h-20 md:h-24 flex items-center justify-between gap-4">
        
        {/* SISI KIRI: Brand Section */}
        <div className="flex items-center gap-4 md:gap-6 shrink-0">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2.5 bg-slate-50 text-red-600 rounded-2xl active:scale-95 transition-all border border-slate-100 shadow-sm"
          >
            <Menu className="w-6 h-6 md:w-7 md:h-7" />
          </button>

          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setView(role === 'admin' ? 'dashboard' : 'catalog')}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/8/83/OJK_Logo.png" alt="OJK" className="h-10 md:h-12 w-auto object-contain" />
            <div className="h-10 w-[1px] bg-slate-200 hidden sm:block"></div>
            <div className="hidden sm:block leading-tight">
              <h1 className="text-xl md:text-2xl font-black text-red-700 tracking-tighter uppercase leading-none">SPLOG</h1>
              <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mt-0.5">OJK Provinsi Jawa Timur</p>
            </div>
          </div>
        </div>

        {/* TENGAH: Search Bar Section */}
        {role !== 'admin' ? (
          <div className="flex-1 max-w-xl hidden lg:block relative mx-4" ref={searchRef}>
            <div className="relative group z-50">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${searchQuery ? 'text-red-500' : 'text-slate-300'}`} />
              <input 
                type="text" 
                placeholder="Cari kebutuhan logistik..."
                className={`w-full bg-slate-50 border border-slate-100 focus:bg-white text-sm font-medium text-slate-600 transition-all outline-none shadow-inner py-3.5 pl-12 pr-12 ${
                  showSuggestions && suggestions.length > 0 ? 'rounded-t-2xl border-b-transparent focus:border-red-100' : 'rounded-2xl focus:border-red-200'
                }`}
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); setFocusedIndex(-1); }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={handleKeyDown}
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setShowSuggestions(false); setFocusedIndex(-1); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-all"><X className="w-5 h-5" /></button>
              )}
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white rounded-b-2xl shadow-2xl border border-slate-100 border-t-0 max-h-[340px] overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-1 duration-200 p-2 z-40">
                {suggestions.map((item, index) => (
                  <button 
                    key={item.id} 
                    onClick={() => handleSelectSuggestion(item.name)} 
                    onMouseEnter={() => setFocusedIndex(index)}
                    className={`w-full flex items-center justify-between gap-4 px-4 py-3 rounded-xl text-left group transition-all ${focusedIndex === index ? 'bg-red-50' : 'hover:bg-slate-50'}`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className={`text-sm font-semibold transition-colors truncate ${focusedIndex === index ? 'text-red-600' : 'text-slate-700'}`}>{item.name}</span>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-1 rounded-md border uppercase shrink-0 transition-colors ${item.category === 'ATK' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>{item.category}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {/* SISI KANAN: Profile & Cart Section */}
        <div className="flex items-center gap-4 md:gap-6 shrink-0 h-full">
          {role === 'user' && (
            <button onClick={() => setView('cart')} className="relative p-3 text-slate-500 hover:bg-slate-50 hover:text-red-600 rounded-2xl transition-all">
              <ShoppingCart className="w-6 h-6" />
              {totalQty > 0 && (
                <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-full ring-4 ring-white">{totalQty}</span>
              )}
            </button>
          )}

          {/* REVISI: Profile Dropdown dengan Lebar Sama Persis */}
          <div className="relative h-full flex items-center" ref={profileRef}>
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className={`flex items-center gap-3 md:gap-4 pl-4 md:pl-6 pr-2 md:pr-4 h-full transition-all duration-300 border-l border-slate-100 group ${
                showProfileMenu ? 'bg-slate-50/80 border-b-2 border-b-red-600' : 'hover:bg-slate-50/50'
              }`}
            >
              <div className="text-right hidden sm:block leading-tight">
                <p className="text-[14px] font-bold text-slate-800 mb-1">{currentUser?.name || 'Pegawai OJK'}</p>
                <div className="flex items-center gap-2 justify-end">
                   <span className="text-[9px] font-black text-red-600 uppercase tracking-widest px-2 py-0.5 bg-red-50 rounded-md border border-red-100 shadow-sm">{role}</span>
                   <ChevronDown className={`w-3.5 h-3.5 text-slate-300 transition-transform duration-300 ${showProfileMenu ? 'rotate-180 text-red-600' : ''}`} />
                </div>
              </div>
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 overflow-hidden ${
                showProfileMenu ? 'border-red-600 shadow-lg scale-105' : 'border-white bg-slate-100 text-slate-500 shadow-sm'
              }`}>
                {currentUser?.name ? (
                  <span className="text-[15px] font-black uppercase text-red-600">{currentUser.name.substring(0, 1)}</span>
                ) : (
                  <User className="w-6 h-6" />
                )}
              </div>
            </button>

            {/* REVISI: Profile Dropdown - Lebar Menyesuaikan Parent */}
            {showProfileMenu && (
              <div className="absolute top-full right-0 min-w-full w-full bg-white rounded-b-2xl shadow-2xl border border-slate-100 border-t-0 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-300 z-50">
                <div className="p-5 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
                  <div className="space-y-1">
                    <p className="text-[13px] font-bold text-slate-800 truncate">{currentUser?.name}</p>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Mail className="w-3 h-3" />
                      <p className="text-[11px] font-medium truncate">{currentUser?.username}</p>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <button onClick={onLogout} className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all group/logout">
                    <div className="flex items-center gap-3"><LogOut className="w-4 h-4 transition-transform group-hover/logout:-translate-x-1" /> Log Out</div>
                    <div className="w-1.5 h-1.5 rounded-full bg-red-600 opacity-0 group-hover/logout:opacity-100 transition-all"></div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;