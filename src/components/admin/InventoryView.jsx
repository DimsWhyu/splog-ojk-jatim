import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Hash, Search, ArrowUpDown, ChevronDown, Edit2, Trash2, X, Save, Archive, Filter } from 'lucide-react';

const InventoryView = ({ inventory, addAmounts, handleAddAmountChange, validateStockAddition, handleUpdateItem, handleDeleteItem }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // --- BARU: LOGIKA DINAMIS KATEGORI (Ekstraksi dari Inventory) ---
  const dynamicCategories = ['Semua', ...new Set(inventory.map(item => item.category).filter(Boolean))];

  // --- PENYESUAIAN 2: LOGIKA SCROLL FREEZE (Freeze background saat modal buka) ---
  useEffect(() => {
    if (isEditModalOpen || isDeleteModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isEditModalOpen, isDeleteModalOpen]);

  const lowStockItems = inventory.filter(item => item.stock < 6);
  const totalLowStock = lowStockItems.length;

  const toProperCase = (str) => {
    if (!str) return '';
    return str.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
  };

  const processedData = inventory
    .filter(item => {
      const name = item.name ? String(item.name).toLowerCase() : '';
      const code = item.code ? String(item.code).toLowerCase() : '';
      const search = searchTerm.toLowerCase();
      const matchesSearch = name.includes(search) || code.includes(search);
      const matchesCategory = categoryFilter === 'Semua' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortConfig.key === 'name') {
        return sortConfig.direction === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      }
      if (sortConfig.key === 'stock') {
        const stockA = Number(a.stock) || 0;
        const stockB = Number(b.stock) || 0;
        return sortConfig.direction === 'asc' ? stockA - stockB : stockB - stockA;
      }
      return 0;
    });

  const openEditModal = (item) => {
    setEditingItem({ ...item });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  // Highlight matching text
  const highlightMatch = (text, search) => {
    if (!search) return text;
    const regex = new RegExp(`(${search})`, 'gi');
    const parts = String(text).split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? 
        <mark key={i} className="bg-yellow-200 text-slate-800 px-0.5 rounded font-bold">{part}</mark> : 
        part
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter flex items-center gap-3">
            <Archive className="w-8 h-8 text-red-600" /> Manajemen Inventaris & Stok
          </h2>
          <p className="text-slate-400 font-medium text-sm italic mt-1">
            Pantau dan validasi ketersediaan logistik kantor secara akurat.
          </p>
        </div>

        {totalLowStock > 0 && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-100 px-5 py-3 rounded-2xl animate-pulse">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="text-xs font-bold text-red-700 tracking-tight">
              {totalLowStock} Barang Perlu Pengadaan Baru
            </p>
          </div>
        )}
      </div>

      {/* --- REVISI: SEARCH BAR DENGAN UI/UX LEBIH MODERN --- */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Input dengan Enhanced UX */}
          <div className={`relative w-full md:w-[500px] transition-all duration-300 ${isSearchFocused ? 'scale-[1.02]' : ''}`}>
            <div className={`absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl blur transition-opacity duration-300 ${isSearchFocused ? 'opacity-100' : 'opacity-0'}`}></div>
            <div className="relative flex items-center">
              <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${isSearchFocused ? 'text-red-600 scale-110' : 'text-slate-400'}`}>
                <Search className="w-5 h-5" />
              </div>
              <input 
                type="text"
                placeholder="Cari nama barang atau kode..."
                className={`w-full pl-12 pr-24 py-3.5 bg-slate-50 border-2 rounded-xl text-sm font-medium transition-all duration-300 outline-none
                  ${isSearchFocused 
                    ? 'bg-white border-red-200 shadow-lg shadow-red-100/50 text-slate-800' 
                    : 'border-slate-100 text-slate-600 hover:border-slate-200'
                  }`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
              
              {/* Search Status Indicator */}
              {searchTerm && (
                <div className="absolute right-20 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-1 bg-red-50 rounded-lg">
                  <span className="text-[10px] font-black text-red-600">{processedData.length} Ditemukan</span>
                </div>
              )}
              
              {/* Clear Button */}
              {searchTerm && (
                <button 
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-slate-200 hover:bg-red-500 hover:text-white rounded-lg transition-all duration-300 group"
                  title="Hapus Pencarian"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {/* Search Tips */}
            {!searchTerm && (
              <div className="absolute -bottom-6 left-0 flex items-center gap-2 text-[10px] text-slate-400 font-medium">
              </div>
            )}
          </div>

          {/* Active Filters Summary */}
          {(searchTerm || categoryFilter !== 'Semua') && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-slate-400 tracking-tight">Filter Aktif:</span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-[10px] font-black border border-red-100">
                  <Search className="w-3 h-3" />
                  "{searchTerm}"
                  <button onClick={clearSearch} className="hover:bg-red-100 rounded p-0.5 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {categoryFilter !== 'Semua' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-black border border-blue-100">
                  <Filter className="w-3 h-3" />
                  {categoryFilter}
                  <button onClick={() => setCategoryFilter('Semua')} className="hover:bg-blue-100 rounded p-0.5 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button 
                onClick={() => { clearSearch(); setCategoryFilter('Semua'); }}
                className="px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-[10px] font-black transition-all"
              >
                Reset Semua
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden relative border-separate">
        <div className="max-h-[70vh] overflow-y-auto overflow-x-auto custom-scrollbar pb-2">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="sticky top-0 z-30 shadow-md">
              <tbody className="divide-y divide-slate-50"></tbody>
              <tr className="bg-[#B91C1C] text-white">
                <th className="px-6 py-3 text-[14px] font-bold capitalize tracking-tight text-center w-16 border-r border-red-800/50">No</th>
                <th 
                  className={`px-6 py-3 text-[14px] font-bold capitalize tracking-tight cursor-pointer transition-colors ${sortConfig.key === 'name' ? 'bg-red-800' : 'hover:bg-red-700'}`}
                  onClick={() => setSortConfig({ key: 'name', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
                >
                  <div className="flex items-center gap-2">
                    Informasi Barang 
                    <ArrowUpDown className={`w-3.5 h-3.5 transition-opacity ${sortConfig.key === 'name' ? 'opacity-100 text-yellow-400' : 'opacity-30'}`} />
                  </div>
                </th>
                <th className="px-6 py-3 text-[14px] font-bold capitalize tracking-tight text-center relative">
                   <div className="flex flex-col items-center">
                      <button 
                        onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all ${categoryFilter !== 'Semua' ? 'bg-white text-red-600 shadow-sm' : 'bg-red-800 text-red-100 hover:bg-red-700'}`}
                      >
                        <span className="text-[12px] font-black">{categoryFilter}</span>
                        <ChevronDown className={`w-3 h-3 transition-transform ${showCategoryMenu ? 'rotate-180' : ''}`} />
                      </button>

                      {showCategoryMenu && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowCategoryMenu(false)}></div>
                          {/* --- REVISI: DROPDOWN DENGAN SCROLL & DATA DINAMIS --- */}
                          <div className="absolute top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="max-h-48 overflow-y-auto custom-scrollbar">
                              {dynamicCategories.map((cat) => (
                                <button
                                  key={cat}
                                  onClick={() => { setCategoryFilter(cat); setShowCategoryMenu(false); }}
                                  className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-bold transition-colors ${categoryFilter === cat ? 'bg-red-50 text-red-600' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                  {cat}
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                   </div>
                </th>
                <th 
                  className={`px-6 py-3 text-[14px] font-bold capitalize tracking-tight text-center cursor-pointer transition-colors ${sortConfig.key === 'stock' ? 'bg-red-800' : 'hover:bg-red-700'}`}
                  onClick={() => setSortConfig({ key: 'stock', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
                >
                  <div className="flex items-center justify-center gap-2">
                    Stok Gudang 
                    <ArrowUpDown className={`w-3.5 h-3.5 transition-opacity ${sortConfig.key === 'stock' ? 'opacity-100 text-yellow-400' : 'opacity-30'}`} />
                  </div>
                </th>
                <th className="px-6 py-3 text-[14px] font-bold capitalize tracking-tight text-right">Kelola & Update Stok</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-50">
              {processedData.map((item, index) => {
                const isLow = item.stock < 6;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 text-center text-base font-bold text-slate-300">
                      {String(index + 1).padStart(2, '0')}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0">
                          <img src={item.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-base font-bold text-slate-800 leading-tight block">
                            {searchTerm ? highlightMatch(item.name, searchTerm) : item.name}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-1 text-slate-400">
                            <Hash className="w-3.5 h-3.5" />
                            <p className="text-[12px] font-bold tracking-tight">
                              Code: {searchTerm ? highlightMatch(item.code, searchTerm) : item.code}
                            </p>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-4 py-1.5 text-[11px] font-black rounded-lg border tracking-tighter ${
                        item.category === 'ATK' 
                        ? 'bg-blue-50 text-blue-600 border-blue-100' 
                        : 'bg-orange-50 text-orange-600 border-orange-100'
                      }`}>
                        {item.category}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className={`text-lg font-black tracking-tighter ${isLow ? 'text-red-600' : 'text-slate-700'}`}>
                          {item.stock} <span className="text-[13px] text-slate-400 font-bold ml-0.5">{toProperCase(item.unit)}</span>
                        </span>
                        {isLow && (
                          <span className="text-[11px] font-black text-red-500 tracking-tight mt-0.5 animate-pulse">Stok Kritis!</span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(item)}
                          className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          title="Edit Item"
                        >
                          <Edit2 className="w-4.5 h-4.5" />
                        </button>

                        <button 
                          onClick={() => openDeleteModal(item)}
                          className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          title="Hapus Item"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>

                        <div className="w-px h-6 bg-slate-100 mx-1"></div>

                        <div className="relative">
                          <input 
                            type="number" 
                            placeholder="0"
                            className="w-20 bg-slate-50 border border-slate-200 text-center text-sm font-black text-slate-700 outline-none py-2 rounded-xl focus:bg-white focus:border-slate-400 transition-all no-spinner"
                            value={addAmounts[item.id] || ''}
                            onChange={(e) => {
                              const rawValue = e.target.value;

                              if (rawValue === '' || rawValue === '-') {
                                handleAddAmountChange(item.id, rawValue);
                                return;
                              }
                              const val = parseInt(rawValue) || 0;
                              const sanitizedVal = val < 0 ? Math.max(val, -item.stock) : val;
                              
                              handleAddAmountChange(item.id, sanitizedVal.toString());
                            }}
                          />
                          <div className="absolute -top-2 -right-1">
                            <span className="text-[8px] bg-slate-800 text-white px-1 rounded font-bold tracking-tighter">Qty</span>
                          </div>
                        </div>

                        <button 
                          onClick={() => validateStockAddition(item.id, addAmounts[item.id])}
                          disabled={!addAmounts[item.id] || addAmounts[item.id] === '0'}
                          className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none transition-all active:scale-90"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- REVISI: MODAL EDIT DENGAN TOMBOL DELETE DI DALAMNYA --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Overlay Fullscreen total dengan Backdrop Blur pekat */}
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in" onClick={() => setIsEditModalOpen(false)}></div>
          
          <div className="relative z-10 bg-white rounded-[13px] shadow-2xl w-full max-w-lg overflow-hidden animate-modal-pop border border-white/20">
            <div className="bg-gradient-to-r from-red-600 to-[#4a0404] p-8 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black tracking-tighter uppercase flex items-center gap-2">
                    <Edit2 className="w-5 h-5" /> Edit Data Barang
                  </h3>
                  <p className="text-red-100/70 text-[13px] font-bold tracking-widest mt-1">Inventaris Logistik OJK Jawa Timur</p>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><X className="w-6 h-6" /></button>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-5">
                <div>
                  <label className="text-[13px] font-bold text-slate-400 tracking-tight ml-1">Nama Barang</label>
                  <input 
                    type="text" 
                    className="w-full mt-1.5 px-5 py-4 bg-slate-50 border border-slate-100 rounded-[13px] text-sm font-bold focus:bg-white focus:ring-2 focus:ring-red-100 outline-none transition-all"
                    value={editingItem?.name}
                    onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[13px] font-bold text-slate-400 tracking-tight ml-1">Kode Barang</label>
                  <input 
                    type="text" 
                    className="w-full mt-1.5 px-5 py-4 bg-slate-50 border border-slate-100 rounded-[13px] text-sm font-bold focus:bg-white focus:ring-2 focus:ring-red-100 outline-none transition-all"
                    value={editingItem?.code}
                    onChange={(e) => setEditingItem({...editingItem, code: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[13px] font-bold text-slate-400 tracking-tight ml-1">URL Gambar (Link)</label>
                  <div className="flex gap-4 mt-1.5">
                    <div className="w-16 h-16 rounded-[13px] bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      <img src={editingItem?.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <input 
                      type="text" 
                      className="flex-1 px-5 py-4 bg-slate-50 border border-slate-100 rounded-[13px] text-[13px] font-medium text-slate-500 focus:bg-white outline-none transition-all"
                      value={editingItem?.image}
                      onChange={(e) => setEditingItem({...editingItem, image: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons: Save & Delete */}
              <div className="flex flex-col gap-3 mt-8">
                <div className="flex gap-3">
                  <button 
                    onClick={() => { handleUpdateItem(editingItem); setIsEditModalOpen(false); }}
                    className="flex-1 py-4 bg-gradient-to-r from-red-600 to-[#4a0404] text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-red-200 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" /> Simpan Perubahan
                  </button>
                  
                  {/* Tombol Delete disisipkan di sini */}
                  <button 
                    type="button"
                    onClick={() => { setItemToDelete(editingItem); setIsDeleteModalOpen(true); setIsEditModalOpen(false); }}
                    className="px-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100"
                    title="Hapus Barang"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-full py-4 bg-slate-50 text-slate-400 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- REVISI: MODAL DELETE DENGAN FULLSCREEN BLUR --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop Blur Fullscreen Total */}
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in" onClick={() => setIsDeleteModalOpen(false)}></div>
          
          <div className="relative z-50 bg-white rounded-[13px] shadow-2xl w-full max-w-sm overflow-hidden animate-modal-pop text-center p-10 border border-red-50">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <AlertTriangle className="w-12 h-12 text-red-600 animate-bounce" />
            </div>
            <h3 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Hapus Barang?</h3>
            <p className="text-sm font-medium text-slate-500 leading-relaxed px-2">
              Menghapus <span className="font-bold text-red-600">"{itemToDelete?.name}"</span> akan menghilangkan data secara permanen dari sistem logistik.
            </p>

            <div className="flex flex-col gap-3 mt-10">
              <button 
                onClick={() => { handleDeleteItem(itemToDelete.id); setIsDeleteModalOpen(false); }}
                className="w-full py-5 bg-red-600 text-white font-black rounded-2xl text-[14px] tracking-tight shadow-xl shadow-red-200 hover:bg-red-700 active:scale-95 transition-all"
              >
                Ya, Hapus Permanen
              </button>
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="w-full py-5 bg-white text-slate-400 font-black rounded-2xl text-[14px] tracking-tight hover:bg-slate-50 transition-all border border-slate-100"
              >
                Kembali
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryView;