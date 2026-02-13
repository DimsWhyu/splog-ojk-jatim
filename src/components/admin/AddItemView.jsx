import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, Loader2, PackagePlus, Hash, 
  Tag, Database, Ruler, ImagePlus, ArrowLeft, Upload, 
  Search, Save
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
        setImageMode('url'); 
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
    if (formData.stock === '' || formData.stock < 0) newErrors.stock = 'Stok minimal 0';
    if (!formData.unit.trim()) newErrors.unit = 'Satuan wajib diisi (Pcs/Pack/dll)';
    if (!formData.image) newErrors.image = 'Gambar barang wajib tersedia';
    
    const isCodeExist = inventory.some(item => 
      String(item.code).toLowerCase() === formData.code.trim().toLowerCase()
    );
    if (isCodeExist) newErrors.code = 'Kode ini sudah terdaftar';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      setErrors(prev => ({ ...prev, form: 'Mohon lengkapi data dengan benar.' }));
      return;
    }
    try {
      setIsSubmitting(true);
      await onAddItem({ ...formData, id: getNextId() });
      setShowSuccessModal(true);
    } catch (err) {
      setErrors(prev => ({ ...prev, form: 'Gagal sinkronisasi. Cek koneksi.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputStyle = (field) => {
    const base = 'w-full rounded-[20px] px-4 py-3 text-sm font-semibold outline-none transition-all border shadow-sm no-spinner';
    return errors[field]
      ? `${base} bg-red-50 border-red-500 text-red-900 focus:border-red-600`
      : `${base} bg-slate-50 border-slate-200 focus:bg-white focus:border-red-400 text-slate-700`;
  };

  return (
    <div className="max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-700 mx-auto pb-10">
      
      {/* HEADER SECTION (Lowered Uppercase) */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <PackagePlus className="w-8 h-8 text-red-600" /> Tambah Barang
          </h2>
          <p className="text-slate-400 font-medium text-sm italic mt-1">
            Daftarkan inventaris logistik baru ke database OJK Jawa Timur.
          </p>
        </div>
        <button onClick={onCancel} className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-red-600 font-bold transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-[20px] border border-slate-100 shadow-xl overflow-hidden">
        {/* HEADER INFO */}
        <div className="bg-slate-50 border-b border-slate-100 px-10 py-5 flex justify-between items-center relative">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-600"></div>
          <span className="text-[14px] font-bold text-slate-500 tracking-tight pl-2">Informasi Registrasi Sistem</span>
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 px-4 py-1.5 rounded-[20px] shadow-sm">
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-tighter">New ID:</span>
            <span className="text-sm font-black text-red-600">ID-{String(getNextId()).padStart(3, '0')}</span>
          </div>
        </div>

        <div className="p-10 space-y-8">
          {/* BARIS 1 */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-[13px] font-bold text-slate-400 px-1 flex items-center gap-2"><Hash className="w-3 h-3" /> Kode Barang</label>
              <input type="text" placeholder="10000000XX" className={getInputStyle('code')} value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} />
              {errors.code && <p className="text-[10px] font-bold text-red-500 px-1">{errors.code}</p>}
            </div>

            <div className="md:col-span-9 space-y-1.5">
              <label className="text-[13px] font-bold text-slate-400 px-1 flex items-center gap-2"><Tag className="w-3 h-3" /> Nama Barang Lengkap</label>
              <input type="text" placeholder="Masukkan nama barang secara detail..." className={getInputStyle('name')} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              {errors.name && <p className="text-[10px] font-bold text-red-500 px-1">{errors.name}</p>}
            </div>
          </div>

          {/* BARIS 2 */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-6 space-y-1.5 relative" ref={suggestionRef}>
              <label className="text-[13px] font-bold text-slate-400 px-1 flex items-center gap-2"><Database className="w-3 h-3" /> Kategori Inventaris</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Cari atau tambah kategori..." 
                  className={`${getInputStyle('category')} pr-10`}
                  value={formData.category}
                  onFocus={() => setShowSuggestions(true)}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              </div>
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-[20px] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="max-h-48 overflow-y-auto custom-scrollbar p-1.5">
                    {filteredSuggestions.map((cat, index) => (
                      <button key={index} type="button" onClick={() => { setFormData({...formData, category: cat}); setShowSuggestions(false); }} className="w-full text-left px-4 py-2.5 rounded-[20px] text-[11px] font-bold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors">{cat}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-3 space-y-1.5">
              <label className="text-[13px] font-bold text-slate-400 px-1">Jumlah Stok Awal</label>
              {/* UPDATE: Logic Math.max(0, ...) untuk mencegah minus */}
              <input 
                type="number" 
                placeholder="0" 
                className={`${getInputStyle('stock')} text-center no-spinner`} 
                value={formData.stock} 
                onChange={(e) => {
                  const val = e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0);
                  setFormData({...formData, stock: val});
                }} 
              />
            </div>
            
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-[13px] font-bold text-slate-400 px-1 flex items-center gap-2"><Ruler className="w-3 h-3" /> Satuan Unit</label>
              <input type="text" placeholder="Pcs / Pack" className={`${getInputStyle('unit')} text-center`} value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} />
            </div>
          </div>

          {/* SEKSI FOTO */}
          <div className="space-y-4">
            <label className="text-[13px] font-bold text-slate-400 px-1 flex items-center gap-2"><ImagePlus className="w-3 h-3" /> Media Gambar</label>
            <div className="flex gap-2 p-1 bg-slate-100 rounded-[20px] w-fit">
              <button type="button" onClick={() => setImageMode('upload')} className={`px-4 py-2 rounded-[20px] text-[10px] font-bold transition-all ${imageMode === 'upload' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-400'}`}>Upload</button>
              <button type="button" onClick={() => setImageMode('url')} className={`px-4 py-2 rounded-[20px] text-[10px] font-bold transition-all ${imageMode === 'url' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-400'}`}>Link URL</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-slate-50 p-8 rounded-[20px] border-2 border-dashed border-slate-200">
              <div className="md:col-span-3 flex justify-center">
                <div className="w-32 h-32 rounded-[24px] bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                  {formData.image ? <img src={formData.image} alt="Preview" className="w-full h-full object-cover" /> : <ImagePlus className="w-10 h-10 text-slate-200" />}
                </div>
              </div>
              <div className="md:col-span-9 w-full">
                {imageMode === 'upload' ? (
                  <div className="relative group">
                    <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className="w-full py-10 border-2 border-dashed border-slate-300 rounded-[20px] flex flex-col items-center justify-center gap-2 bg-white group-hover:border-red-400 transition-all">
                      <Upload className="w-6 h-6 text-slate-400" />
                      <p className="text-[11px] font-bold text-slate-500">Klik untuk upload gambar barang</p>
                    </div>
                  </div>
                ) : (
                  <input type="text" placeholder="Masukkan URL gambar di sini..." className={getInputStyle('image')} value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} />
                )}
                {errors.image && <p className="text-[10px] font-bold text-red-500 mt-2 px-1">{errors.image}</p>}
              </div>
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-gradient-to-r from-red-600 to-[#4a0404] text-white font-bold rounded-[20px] shadow-xl hover:shadow-red-200 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 mt-4">
            {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /><span>Menyimpan...</span></> : <><Save className="w-5 h-5" /><span>Simpan Inventaris Baru</span></>}
          </button>
        </div>
      </form>

      {showSuccessModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in" onClick={() => { setShowSuccessModal(false); onCancel(); }}></div>
          <div className="relative bg-white rounded-[20px] shadow-2xl w-full max-w-sm overflow-hidden animate-modal-pop text-center p-10 border border-emerald-50">
            <div className="w-20 h-20 bg-emerald-50 rounded-[20px] flex items-center justify-center mx-auto mb-6 shadow-inner"><CheckCircle2 className="w-10 h-10 text-emerald-600 animate-bounce" /></div>
            <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Berhasil!</h3>
            <p className="text-sm font-medium text-slate-500 leading-relaxed mb-8">Data inventaris baru telah tercatat otomatis di sistem OJK Jawa Timur.</p>
            <button onClick={() => { setShowSuccessModal(false); onCancel(); }} className="w-full py-4 bg-emerald-600 text-white font-bold rounded-[20px] shadow-lg hover:bg-emerald-700 transition-all active:scale-95">Selesai</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddItemView;