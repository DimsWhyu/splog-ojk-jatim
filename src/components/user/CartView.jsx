import React, { useState } from 'react';
import { Trash2, Plus, Minus, FileEdit, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const CartView = ({ setView, handleCheckout, inventory, handleUpdateQuantity }) => {
  const { cart, removeFromCart } = useCart();
  const [note, setNote] = useState('');

  const totalItems = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  const processQuantityChange = (itemId, newQty) => {
    const itemInInventory = inventory.find(i => i.id === itemId);
    if (itemInInventory) {
      handleUpdateQuantity(itemInInventory, newQty);
    }
  };

  const handleManualInput = (itemId, inputVal) => {
    const newVal = parseInt(inputVal) || 0;
    processQuantityChange(itemId, newVal);
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Keranjang Masih Kosong</h3>
        <p className="text-slate-400 text-sm mb-8">Anda belum menambahkan item apapun untuk diajukan.</p>
        <button 
          onClick={() => setView('catalog')}
          className="px-8 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all active:scale-95 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Katalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => setView('catalog')}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Konfirmasi Pengajuan</h2>
          <p className="text-sm font-medium text-slate-400 italic">Periksa kembali daftar kebutuhan logistik Anda sebelum dikirim.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden w-full">
            <table className="w-full text-left table-auto">
              <thead>
                {/* REVISI: Background Header dengan Gradasi Merah-Maroon */}
                <tr className="bg-gradient-to-r from-red-600 to-[#4a0404] text-white">
                  <th className="px-6 py-4 text-[11px] font-bold capitalize tracking-wider">Item Logistik</th>
                  <th className="px-4 py-4 text-[11px] font-bold capitalize tracking-wider text-center">Jumlah</th>
                  <th className="px-6 py-4 text-[11px] font-bold capitalize tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {cart.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0">
                          <img src={item.image} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <span className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded border mb-1 uppercase ${
                            item.category === 'ATK' 
                            ? 'bg-blue-50 text-blue-600 border-blue-100' 
                            : 'bg-orange-50 text-orange-600 border-orange-100'
                          }`}>
                            {item.category}
                          </span>
                          <h4 className="text-sm font-bold text-slate-800 leading-tight truncate block">
                            {item.name}
                          </h4>
                          <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                            Satuan: {item.unit}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center">
                        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-100">
                          <button 
                            onClick={() => processQuantityChange(item.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center bg-white text-slate-400 hover:text-red-600 rounded shadow-sm transition-all active:scale-90"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input 
                            type="number" 
                            value={item.quantity}
                            onChange={(e) => handleManualInput(item.id, e.target.value)}
                            className="w-10 bg-transparent text-center text-sm font-bold text-slate-700 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button 
                            onClick={() => processQuantityChange(item.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center bg-white text-slate-400 hover:text-blue-600 rounded shadow-sm transition-all active:scale-90"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-slate-300 hover:text-red-600 transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-4 sticky top-28">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                  <FileEdit className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Detail Pengajuan</h3>
              </div>
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-slate-400 tracking-widest">
                    Tujuan Kebutuhan
                  </label>
                  <textarea 
                    className="w-full bg-slate-50 border border-slate-100 focus:border-red-200 focus:bg-white rounded-xl p-4 text-sm font-medium outline-none transition-all min-h-[100px] placeholder:text-slate-300"
                    placeholder="Contoh: Pengadaan rutin operasional divisi..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  ></textarea>
                </div>
                <div className="py-4 border-t border-b border-slate-50 space-y-3">
                  <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                    <span>Total Jenis Barang</span>
                    <span className="text-slate-800 font-bold">{cart.length} Item</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-500">Total Kuantitas</span>
                    <span className="text-2xl font-black text-red-600 tracking-tighter">{totalItems}</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleCheckout(note)}
                  className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3 tracking-wide"
                >
                  Kirim Request Sekarang
                </button>
              </div>
            </div>
            <div className="bg-slate-50 py-3 px-6 text-center">
               <p className="text-[10px] font-semibold text-slate-400 italic leading-relaxed">
                 Permintaan akan diverifikasi oleh Admin Logistik Kantor OJK Provinsi Jawa Timur.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartView;