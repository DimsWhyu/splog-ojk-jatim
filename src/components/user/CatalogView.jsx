import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus, ChevronUp, Package } from 'lucide-react';
import ImagePlaceholder from '../common/ImagePlaceholder';
import { useCart } from '../../context/CartContext';

// --- HELPER: COLOR PALETTE MAP (Kontras Tinggi & Terbaca) ---
const getCategoryTheme = (cat) => {
    const themes = {
      'Semua': { pill: 'bg-red-700', badge: 'bg-red-50 text-red-700 border-red-100', btn: 'bg-red-600' },
      'ATK': { pill: 'bg-blue-700', badge: 'bg-blue-50 text-blue-700 border-blue-100', btn: 'bg-blue-600' },
      
      // Kelompok Pembersih (Shades of Emerald, Cyan, Teal, Indigo)
      'Pembersih Ruangan': { pill: 'bg-emerald-700', badge: 'bg-emerald-50 text-emerald-700 border-emerald-100', btn: 'bg-emerald-600' },
      'Pembersih Ruangan (A)': { pill: 'bg-emerald-700', badge: 'bg-emerald-50 text-emerald-700 border-emerald-100', btn: 'bg-emerald-600' },
      'Pembersih Dapur': { pill: 'bg-cyan-700', badge: 'bg-cyan-50 text-cyan-800 border-cyan-200', btn: 'bg-cyan-600' },
      'Pembersih Dapur (A)': { pill: 'bg-cyan-700', badge: 'bg-cyan-50 text-cyan-800 border-cyan-200', btn: 'bg-cyan-600' },
      'Pembersih Toilet': { pill: 'bg-indigo-700', badge: 'bg-indigo-50 text-indigo-700 border-indigo-100', btn: 'bg-indigo-600' },
      'Pembersih Toilet (A)': { pill: 'bg-indigo-700', badge: 'bg-indigo-50 text-indigo-700 border-indigo-100', btn: 'bg-indigo-600' },
      'Pembersih Toilet/Dapur': { pill: 'bg-teal-700', badge: 'bg-teal-50 text-teal-800 border-teal-200', btn: 'bg-teal-600' },
      'Pembersih Serbaguna': { pill: 'bg-sky-700', badge: 'bg-sky-50 text-sky-800 border-sky-200', btn: 'bg-sky-600' },
      'Pembersih Furniture': { pill: 'bg-slate-700', badge: 'bg-slate-50 text-slate-700 border-slate-200', btn: 'bg-slate-600' },
      
      // Kelompok Pewangi & Hama (Shades of Pink, Rose, Red)
      'Pewangi': { pill: 'bg-pink-700', badge: 'bg-pink-50 text-pink-700 border-pink-100', btn: 'bg-pink-600' },
      'Pewangi Ruangan': { pill: 'bg-pink-700', badge: 'bg-pink-50 text-pink-700 border-pink-100', btn: 'bg-pink-600' },
      'Pewangi Lemari': { pill: 'bg-rose-700', badge: 'bg-rose-50 text-rose-700 border-rose-100', btn: 'bg-rose-600' },
      'Pembasmi serangga': { pill: 'bg-orange-700', badge: 'bg-orange-50 text-orange-800 border-orange-200', btn: 'bg-orange-600' },
      
      // Kelompok Teknik & Operasional
      'Plastik Sampah': { pill: 'bg-zinc-800', badge: 'bg-zinc-100 text-zinc-800 border-zinc-200', btn: 'bg-zinc-700' },
      'Perawatan Taman': { pill: 'bg-green-800', badge: 'bg-green-50 text-green-800 border-green-200', btn: 'bg-green-700' },
      'Perawatan Taman (A)': { pill: 'bg-green-800', badge: 'bg-green-50 text-green-800 border-green-200', btn: 'bg-green-700' },
      'Gondola': { pill: 'bg-slate-800', badge: 'bg-slate-100 text-slate-800 border-slate-200', btn: 'bg-slate-700' },
      'Teknisi ME': { pill: 'bg-amber-700', badge: 'bg-amber-50 text-amber-900 border-amber-200', btn: 'bg-amber-600' },
      'Konsumsi': { pill: 'bg-purple-700', badge: 'bg-purple-50 text-purple-700 border-purple-100', btn: 'bg-purple-600' },
      'Kendaraan Dinas': { pill: 'bg-yellow-700', badge: 'bg-yellow-50 text-yellow-900 border-yellow-300', btn: 'bg-yellow-600' },
  };
  return themes[cat] || { pill: 'bg-slate-700', badge: 'bg-slate-50 text-slate-700 border-slate-200', btn: 'bg-slate-600' };
};

const CatalogView = ({ inventory, filteredItems, activeCategory, setActiveCategory, handleUpdateQuantity }) => {
  const { getCartItem } = useCart();
  const scrollTrackRef = useRef(null);
  
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const dynamicCategories = ['Semua', ...new Set(inventory.map(item => item.category).filter(Boolean))];

  useEffect(() => {
    const handleScroll = () => {
      if (!isDragging) {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
        setShowBackToTop(window.scrollY > 400);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDragging]);

  const handleDrag = (e) => {
    if (scrollTrackRef.current) {
      const track = scrollTrackRef.current.getBoundingClientRect();
      const clickY = e.clientY - track.top;
      let percentage = (clickY / track.height) * 100;
      percentage = Math.max(0, Math.min(100, percentage)); 
      setScrollProgress(percentage);
      const totalScrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, (percentage / 100) * totalScrollHeight);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => { if (isDragging) handleDrag(e); };
    const handleMouseUp = () => { setIsDragging(false); };
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const scrollToTop = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const getPillColor = (cat) => getCategoryTheme(cat).pill;
  const getBadgeStyle = (cat) => getCategoryTheme(cat).badge;
  const getButtonColor = (cat) => getCategoryTheme(cat).btn;

  return (
    <div className="relative pl-6 font-sans animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* INTERACTIVE SLIDE BAR */}
      <div ref={scrollTrackRef} onMouseDown={() => setIsDragging(true)} className="fixed right-2 top-4 bottom-4 w-3 bg-slate-100/50 backdrop-blur-sm rounded-full z-[150] border border-slate-200 shadow-inner cursor-pointer">
        <div className="absolute w-full bg-gradient-to-b from-red-500 via-red-700 to-[#4a0404] rounded-full shadow-lg" style={{ height: '40px', top: `calc(${scrollProgress}% - ${scrollProgress * 0.4}px)` }}>
          <div className="w-1/2 h-0.5 bg-white/30 mx-auto mt-4 rounded-full"></div>
          <div className="w-1/2 h-0.5 bg-white/30 mx-auto mt-1 rounded-full"></div>
        </div>
      </div>

      <button onClick={scrollToTop} className={`fixed bottom-8 right-12 z-[140] p-4 bg-red-600 text-white rounded-2xl shadow-2xl transition-all duration-300 transform border border-white hover:bg-red-700 active:scale-90 ${showBackToTop ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-50'}`}>
        <ChevronUp className="w-6 h-6" strokeWidth={3} />
      </button>

      {/* STICKY HEADER CATALOG */}
      <div className="sticky top-[96px] z-40 bg-[#FDFDFD] -mx-4 px-4 pb-8 pt-4 transition-all border-b border-transparent">
        <div className="space-y-8">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Header Shape Aksen Merah OJK */}
              <div className="w-1.5 h-12 bg-red-600 rounded-full mt-1 hidden md:block"></div>
              <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tighter flex items-center gap-3">
                  <Package className="w-8 h-8 text-red-600 md:hidden" />
                  Pusat Pengelolaan Logistik
                </h2>
                <p className="text-slate-400 font-medium text-sm italic">Pengelolaan Pengajuan Logistik Terintegrasi dengan Kontrol Kuantitas Real-Time.</p>
              </div>
            </div>
          </header>

          {/* --- REVISI: CATEGORY NAVIGATION (SINGLE ROW SCROLL + TEXT WRAP) --- */}
          <div className="flex items-center gap-2 bg-slate-100/80 p-2 rounded-[24px] backdrop-blur-md border border-slate-200/50 shadow-inner overflow-x-auto max-w-full no-scrollbar">
            <div className="flex flex-nowrap items-stretch gap-2"> {/* flex-nowrap menjaga agar tetap satu baris */}
              {dynamicCategories.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setActiveCategory(cat)}
                  className={`relative min-w-[120px] max-w-[160px] px-5 py-2.5 rounded-xl text-[12px] font-bold transition-all duration-500 tracking-tight flex items-center justify-center text-center overflow-hidden group active:scale-95 border border-transparent
                    ${activeCategory === cat 
                      ? 'text-white shadow-md' 
                      : 'text-slate-400 hover:text-slate-700'}`}
                >
                  {/* Warna Pill Ikonik sesuai kategori */}
                  {activeCategory === cat && (
                    <div className={`absolute inset-0 z-0 animate-in fade-in zoom-in-95 duration-500 ${getPillColor(cat)}`} />
                  )}
                  {activeCategory !== cat && (
                    <div className="absolute inset-0 z-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                  {/* whitespace-normal memungkinkan teks membungkus ke bawah */}
                  <span className="relative z-10 whitespace-normal leading-tight line-clamp-2">
                    {cat}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ITEM GRID CATALOG (TETAP SAMA) */}
      <div key={activeCategory} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 pt-6 pr-10 animate-in fade-in slide-in-from-bottom-2 duration-500 relative z-10">
        {[...filteredItems]
          .sort((a, b) => {
            const stockA = Number(a.stock) || 0;
            const stockB = Number(b.stock) || 0;
            if (stockA > 0 && stockB === 0) return -1;
            if (stockA === 0 && stockB > 0) return 1;
            return a.name.localeCompare(b.name);
          })
          .map(item => {
            const cartItem = getCartItem(item.id);
            const currentQty = cartItem ? cartItem.quantity : 0;
            const buttonColorClass = getButtonColor(item.category);

            return (
              /* BOX BARANG TETAP GRADIEN MERAH (SESUAI ASLINYA) */
              <div key={item.id} className="bg-gradient-to-b from-red-500 to-red-800 rounded-2xl border border-red-600/20 overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group relative flex flex-col">
                {cartItem && (
                  <div className="absolute top-4 right-4 z-20 bg-white text-red-600 text-[10px] font-bold px-3 py-1 rounded-full shadow-lg border border-red-50">
                    {cartItem.quantity} Diajukan
                  </div>
                )}
                <div className="h-52 bg-white relative overflow-hidden flex-shrink-0">
                  {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" /> : <ImagePlaceholder category={item.category} />}
                  <div className="absolute top-4 left-4 z-10">
                    <span className={`backdrop-blur-sm px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-tight border shadow-sm ${getBadgeStyle(item.category)}`}>
                      {item.category}
                    </span>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between text-white">
                  <div>
                    <h4 className="text-[17px] font-bold mb-1 h-12 line-clamp-2 leading-tight tracking-tight">{item.name}</h4>
                    <p className="text-[13px] font-bold text-red-100 tracking-tight mb-4">Code: {item.code}</p>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="space-y-0.5">
                      <p className="text-[15px] font-bold text-red-50 tracking-tight">Sisa Stok</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black">{item.stock}</span>
                        <span className="text-[12px] font-bold">{item.unit}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {cartItem ? (
                        <div className="flex items-center gap-2 bg-white/10 p-1 rounded-xl border border-white/20">
                          <button onClick={() => handleUpdateQuantity(item, currentQty - 1)} className={`w-8 h-8 flex items-center justify-center text-white rounded-lg transition-all active:scale-90 ${buttonColorClass}`}><Minus className="w-3.5 h-3.5" /></button>
                          <input type="number" value={currentQty} onChange={(e) => handleUpdateQuantity(item, parseInt(e.target.value) || 0)} className="bg-transparent font-bold text-white text-base w-10 text-center focus:outline-none" />
                          <button onClick={() => handleUpdateQuantity(item, currentQty + 1)} className={`w-8 h-8 flex items-center justify-center text-white rounded-lg transition-all active:scale-90 ${buttonColorClass}`}><Plus className="w-3.5 h-3.5" /></button>
                        </div>
                      ) : (
                        <button onClick={() => handleUpdateQuantity(item, 1)} className={`text-white w-10 h-10 rounded-xl transition-all flex items-center justify-center active:scale-90 shadow-md ${buttonColorClass}`} disabled={item.stock === 0}><Plus className="w-5 h-5" strokeWidth={3} /></button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default CatalogView;