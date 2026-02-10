import React, { useState, useEffect, useRef } from 'react';
import { 
  // PENYESUAIAN 1: Menghapus 'AlertCircle' karena tidak digunakan
  AlertTriangle, // Menggunakan AlertTriangle untuk error agar konsisten dengan InventoryView
  CheckCircle2, 
  Loader2, 
  PackagePlus, 
  Hash, 
  Tag, 
  Database, 
  Ruler, 
  ImagePlus,
  ArrowLeft,
  Upload, 
  Search, 
  ChevronDown,
  Link as LinkIcon 
} from 'lucide-react';

const AddItemView = ({ inventory, onAddItem, onCancel }) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: '', 
    stock: '',
    unit: '',
    image: ''
  });

  const [imageMode, setImageMode] = useState('upload'); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  // PENYESUAIAN 2: Menghapus 'msg' state karena notifikasi sukses sudah diganti Modal
  const [errors, setErrors] = useState({});

  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef(null);
  
  const existingCategories = [...new Set(inventory.map(item => item.category).filter(Boolean))];
  
  const filteredSuggestions = existingCategories.filter(cat => 
    cat.toLowerCase().includes(formData.category.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (showSuccessModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showSuccessModal]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { 
        setErrors({ ...errors, image: 'Ukuran file maksimal 2MB' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result }); 
        if (errors.image) setErrors({ ...errors, image: null });
      };
      reader.readAsDataURL(file);
    }
  };

  const getNextId = () => {
    const ids = inventory.map(item => Number(item.id) || 0);
    return ids.length > 0 ? Math.max(...ids) + 1 : 1;
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.code.trim()) newErrors.code = 'Kode barang wajib diisi';
    if (!formData.name.trim()) newErrors.name = 'Nama barang wajib diisi';
    if (!formData.category.trim()) newErrors.category = 'Kategori wajib diisi';
    if (!formData.stock || formData.stock < 0) newErrors.stock = 'Stok minimal 0';
    if (!formData.unit.trim()) newErrors.unit = 'Satuan wajib diisi (Pcs/Pack/dll)';
    if (!formData.image) newErrors.image = 'Gambar barang wajib tersedia';
    
    const isCodeExist = inventory.some(item => 
      String(item.code).toLowerCase() === formData.code.trim().toLowerCase()
    );
    if (isCodeExist) newErrors.code = 'Kode ini sudah terdaftar di sistem';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // PENYESUAIAN: Menghapus setMsg dan menggunakan setErrors untuk error general
    if (!validate()) {
      setErrors(prev => ({ ...prev, form: 'Mohon lengkapi data dengan benar.' }));
      return;
    }
    try {
      setIsSubmitting(true);
      const nextId = getNextId();
      await onAddItem({ ...formData, id: nextId });
      setShowSuccessModal(true);
      setFormData({ code: '', name: '', category: '', stock: '', unit: '', image: '' });
    } catch (err) {
      setErrors(prev => ({ ...prev, form: 'Gagal sinkronisasi. Cek koneksi.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputStyle = (field) => {
    const base = 'w-full rounded-xl px-4 py-3 text-sm font-semibold outline-none transition-all border shadow-sm';
    return errors[field]
      ? `${base} bg-red-50 border-red-500 text-red-900 focus:border-red-600`
      : `${base} bg-slate-50 border-slate-200 focus:bg-white focus:border-red-400 text-slate-700`;
  };

  return (
    <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <PackagePlus className="w-8 h-8 text-red-600" /> Tambah Barang
          </h2>
          <p className="text-slate-400 font-medium text-sm italic mt-1">
            Lengkapi data logistik baru untuk didaftarkan ke sistem OJK Jawa Timur.
          </p>
        </div>
        <button 
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-red-600 font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-100 px-8 py-4 flex justify-between items-center relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-600"></div>
          <span className="text-[16px] font-bold text-slate-500 tracking-tight pl-2">Registrasi Inventaris Sistem</span>
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 px-4 py-1.5 rounded-full shadow-sm">
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-tighter">New Registry ID:</span>
            <span className="text-sm font-black text-red-600">ID-{String(getNextId()).padStart(3, '0')}</span>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[13px] font-black text-slate-400 px-1 flex items-center gap-2"><Hash className="w-3 h-3" /> Kode Barang</label>
              <input type="text" placeholder="Contoh: 1000000088" className={getInputStyle('code')} value={formData.code} onChange={(e) => {setFormData({...formData, code: e.target.value}); if(errors.code) setErrors({...errors, code: null})}} />
              {errors.code && <p className="text-[10px] font-bold text-red-500 px-1">{errors.code}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-black text-slate-400 px-1 flex items-center gap-2"><Tag className="w-3 h-3" /> Nama Barang</label>
              <input type="text" placeholder="Masukkan nama lengkap barang" className={getInputStyle('name')} value={formData.name} onChange={(e) => {setFormData({...formData, name: e.target.value}); if(errors.name) setErrors({...errors, name: null})}} />
              {errors.name && <p className="text-[10px] font-bold text-red-500 px-1">{errors.name}</p>}
            </div>

            <div className="space-y-1.5 relative" ref={suggestionRef}>
              <label className="text-[13px] font-black text-slate-400 px-1 flex items-center gap-2">
                <Database className="w-3 h-3" /> Kategori Inventaris
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Ketik untuk cari atau tambah kategori..." 
                  className={`${getInputStyle('category')} pr-10`}
                  value={formData.category}
                  onFocus={() => setShowSuggestions(true)}
                  onChange={(e) => {
                    setFormData({...formData, category: e.target.value});
                    setShowSuggestions(true);
                    if(errors.category) setErrors({...errors, category: null});
                  }}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-slate-300">
                  <Search className="w-4 h-4" />
                  <ChevronDown className={`w-3 h-3 transition-transform ${showSuggestions ? 'rotate-180' : ''}`} />
                </div>
              </div>

              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="max-h-48 overflow-y-auto custom-scrollbar p-1.5">
                    {filteredSuggestions.map((cat, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setFormData({...formData, category: cat});
                          setShowSuggestions(false);
                          if(errors.category) setErrors({...errors, category: null});
                        }}
                        className="w-full text-left px-4 py-2.5 rounded-lg text-[11px] font-bold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center justify-between group"
                      >
                        {cat}
                        <div className="opacity-0 group-hover:opacity-100 text-[9px] bg-red-100 px-2 py-0.5 rounded text-red-600 font-black uppercase tracking-tighter">Pilih</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {errors.category && <p className="text-[10px] font-bold text-red-500 px-1">{errors.category}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-black text-slate-400 px-1">Stok Awal</label>
                <input type="number" placeholder="0" className={getInputStyle('stock')} value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-black text-slate-400 px-1 flex items-center gap-2"><Ruler className="w-3 h-3" /> Satuan</label>
                <input type="text" placeholder="Pcs / Pack" className={getInputStyle('unit')} value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[13px] font-black text-slate-400 px-1 flex items-center gap-2"><ImagePlus className="w-3 h-3" /> Foto Inventaris</label>
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
              <button type="button" onClick={() => setImageMode('upload')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${imageMode === 'upload' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-400'}`}>Upload File</button>
              <button type="button" onClick={() => setImageMode('url')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${imageMode === 'url' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-400'}`}>Link URL</button>
            </div>
            <div className="flex flex-col md:flex-row gap-6 items-center bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200">
              <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                {formData.image ? <img src={formData.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.target.src = 'https://via.placeholder.com/150'} /> : <ImagePlus className="w-8 h-8 text-slate-200" />}
              </div>
              <div className="flex-1 w-full">
                {imageMode === 'upload' ? (
                  <div className="relative group">
                    <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-1 bg-white group-hover:border-red-400 transition-all"><Upload className="w-5 h-5 text-slate-400 group-hover:text-red-500" /><p className="text-[10px] font-bold text-slate-500">Klik untuk upload gambar</p></div>
                  </div>
                ) : (
                  <div className="relative"><LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" /><input type="text" placeholder="https://example.com/image.png" className={getInputStyle('image')} value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} /></div>
                )}
                {errors.image && <p className="text-[10px] font-bold text-red-500 mt-2 px-1">{errors.image}</p>}
              </div>
            </div>
          </div>

          {/* PENYESUAIAN 3: Menampilkan error general menggunakan state 'errors.form' */}
          {errors.form && (
            <div className="p-4 rounded-xl flex items-center gap-3 text-xs font-bold border animate-in fade-in zoom-in-95 bg-red-50 text-red-600 border-red-100">
              <AlertTriangle className="w-4 h-4" />
              {errors.form}
            </div>
          )}

          <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-gradient-to-r from-red-600 to-[#4a0404] text-white font-bold rounded-xl shadow-lg hover:shadow-red-200 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 mt-4">
            {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /><span>Menyimpan ke Database...</span></> : <><PackagePlus className="w-5 h-5" /><span>Simpan Inventaris Baru</span></>}
          </button>
        </div>
      </form>

      {showSuccessModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in" onClick={() => { setShowSuccessModal(false); onCancel(); }}></div>
          <div className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-sm overflow-hidden animate-modal-pop text-center p-10 border border-emerald-50">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"><CheckCircle2 className="w-10 h-10 text-emerald-600 animate-bounce" /></div>
            <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Berhasil!</h3>
            <p className="text-sm font-medium text-slate-500 leading-relaxed mb-8">Data inventaris baru telah tercatat secara otomatis di database logistik OJK Provinsi Jawa Timur.</p>
            <button onClick={() => { setShowSuccessModal(false); onCancel(); }} className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95">Selesai & Lihat Tabel</button>
          </div>
        </div>
      )}

      <div className="mt-6 px-2">
        <p className="text-[11px] text-slate-400 font-medium italic">
          * Seluruh penambahan barang akan secara otomatis memiliki ID unik urutan terakhir dan terhubung dengan katalog user.
        </p>
      </div>
    </div>
  );
};

export default AddItemView;