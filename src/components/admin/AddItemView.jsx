import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, Loader2, PackagePlus, Hash, 
  Tag, Database, Ruler, ImagePlus, ArrowLeft, Upload, 
  Save, X, AlertCircle, Info, Sparkles,
  RefreshCcw
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
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [formProgress, setFormProgress] = useState(0);
  const [showCodeHelper, setShowCodeHelper] = useState(false);
  
  const suggestionRef = useRef(null);
  const codeHelperRef = useRef(null);
  
  const existingCategories = [...new Set(inventory.map(item => item.category).filter(Boolean))];
  const filteredSuggestions = existingCategories.filter(cat => 
    cat.toLowerCase().includes(formData.category.toLowerCase())
  );

  // Calculate form progress
  useEffect(() => {
    const fields = ['code', 'name', 'category', 'stock', 'unit', 'image'];
    const filled = fields.filter(field => formData[field] && formData[field] !== '').length;
    setFormProgress((filled / fields.length) * 100);
  }, [formData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (codeHelperRef.current && !codeHelperRef.current.contains(event.target)) {
        setShowCodeHelper(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-generate code suggestion
  const generateCodeSuggestion = () => {
    const ids = inventory.map(item => Number(item.code) || 0);
    const maxCode = ids.length > 0 ? Math.max(...ids) : 1000000000;
    const newCode = String(maxCode + 1);
    setFormData({ ...formData, code: newCode });
    setShowCodeHelper(false);
  };

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

  const handleClearForm = () => {
    setFormData({
      code: '',
      name: '',
      category: '', 
      stock: '',
      unit: '',
      image: ''
    });
    setErrors({});
    setImageMode('upload');
  };

  const handleAddNewCategory = () => {
    if (newCategory.trim()) {
      setFormData({ ...formData, category: newCategory.trim() });
      setNewCategory('');
      setShowCategoryInput(false);
      setShowSuggestions(false);
    }
  };

  const getInputStyle = (field) => {
    const base = 'w-full rounded-[20px] px-4 py-3.5 text-sm font-semibold outline-none transition-all border shadow-sm no-spinner';
    return errors[field]
      ? `${base} bg-red-50 border-red-500 text-red-900 focus:border-red-600 focus:ring-2 focus:ring-red-100`
      : `${base} bg-slate-50 border-slate-200 focus:bg-white focus:border-red-400 focus:ring-2 focus:ring-red-50 text-slate-700`;
  };

  const getLabelStyle = (field) => {
    return errors[field]
      ? 'text-[13px] font-bold text-red-500 px-1 flex items-center gap-2'
      : 'text-[13px] font-bold text-slate-400 px-1 flex items-center gap-2';
  };

  return (
    <div className="max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-700 mx-auto pb-10">
      
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

      {/* Form Progress Bar */}
      <div className="mb-6 bg-white rounded-[13px] border border-slate-100 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Progress Pengisian Form</span>
          <span className="text-[11px] font-black text-red-600">{Math.round(formProgress)}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-500"
            style={{ width: `${formProgress}%` }}
          />
        </div>
        {formProgress === 100 && (
          <div className="flex items-center gap-2 mt-2 text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-[10px] font-bold">Semua field telah diisi!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-[13px] border border-slate-100 shadow-xl overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-100 px-10 py-5 flex justify-between items-center relative">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-600"></div>
          <span className="text-[14px] font-bold text-slate-500 tracking-tight pl-2">Informasi Detail Barang</span>
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 px-4 py-1.5 rounded-[13px] shadow-sm">
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-tighter">New ID:</span>
            <span className="text-sm font-black text-red-600">ID-{String(getNextId()).padStart(3, '0')}</span>
          </div>
        </div>

        <div className="p-10 space-y-8">
          {/* Row 1: Code & Name */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-3 space-y-1.5 relative" ref={codeHelperRef}>
              <label className={getLabelStyle('code')}><Hash className="w-3 h-3" /> Kode Barang</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="10000000XX" 
                  className={getInputStyle('code')} 
                  value={formData.code} 
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  onFocus={() => setShowCodeHelper(true)}
                />
                <button
                  type="button"
                  onClick={generateCodeSuggestion}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-slate-100 hover:bg-red-500 hover:text-white rounded-lg transition-all group"
                  title="Generate Kode Otomatis"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
              {showCodeHelper && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-[13px] shadow-2xl border border-slate-100 p-3 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-slate-600 mb-2">Tips Kode Barang:</p>
                      <ul className="text-[9px] text-slate-500 space-y-1">
                        <li>• Gunakan format 10 digit angka</li>
                        <li>• Kode harus unik untuk setiap barang</li>
                        <li>• Klik icon ✨ untuk generate otomatis</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              {errors.code && <p className="text-[10px] font-bold text-red-500 px-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.code}</p>}
            </div>

            <div className="md:col-span-9 space-y-1.5">
              <label className={getLabelStyle('name')}><Tag className="w-3 h-3" /> Nama Barang Lengkap</label>
              <input 
                type="text" 
                placeholder="Masukkan nama barang secara detail..." 
                className={getInputStyle('name')} 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
              />
              {errors.name && <p className="text-[10px] font-bold text-red-500 px-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.name}</p>}
            </div>
          </div>

          {/* Row 2: Category, Stock, Unit */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-6 space-y-1.5 relative" ref={suggestionRef}>
              <label className={getLabelStyle('category')}><Database className="w-3 h-3" /> Kategori Inventaris</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Cari atau tambah kategori..." 
                  className={`${getInputStyle('category')} pr-10`}
                  value={formData.category}
                  onFocus={() => setShowSuggestions(true)}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                />
                <button
                  type="button"
                  onClick={() => setShowCategoryInput(!showCategoryInput)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-slate-100 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                  title="Tambah Kategori Baru"
                >
                  <PackagePlus className="w-4 h-4" />
                </button>
              </div>
              
              {/* Add New Category Input */}
              {showCategoryInput && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-[13px] shadow-2xl border border-slate-100 p-3 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nama kategori baru..."
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-red-400"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddNewCategory()}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleAddNewCategory}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-all"
                    >
                      Tambah
                    </button>
                  </div>
                </div>
              )}

              {/* Category Suggestions */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-[13px] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="max-h-48 overflow-y-auto custom-scrollbar p-1.5">
                    <p className="text-[9px] font-bold text-slate-400 px-3 py-2 uppercase tracking-tight">Kategori Tersedia</p>
                    {filteredSuggestions.map((cat, index) => (
                      <button 
                        key={index} 
                        type="button" 
                        onClick={() => { 
                          setFormData({...formData, category: cat}); 
                          setShowSuggestions(false); 
                        }} 
                        className="w-full text-left px-4 py-2.5 rounded-[13px] text-[11px] font-bold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center justify-between group"
                      >
                        {cat}
                        <CheckCircle2 className="w-4 h-4 text-slate-300 group-hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {errors.category && <p className="text-[10px] font-bold text-red-500 px-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.category}</p>}
            </div>

            <div className="md:col-span-3 space-y-1.5">
              <label className={getLabelStyle('stock')}>Jumlah Stok Awal</label>
              <div className="relative">
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
                <div className="absolute -top-2 right-2">
                  <span className="text-[8px] bg-slate-800 text-white px-1.5 py-0.5 rounded font-bold tracking-tighter">Qty</span>
                </div>
              </div>
              {errors.stock && <p className="text-[10px] font-bold text-red-500 px-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.stock}</p>}
            </div>
            
            <div className="md:col-span-3 space-y-1.5 relative">
              <label className={getLabelStyle('unit')}><Ruler className="w-3 h-3" /> Satuan Unit</label>
              <input 
                type="text" 
                placeholder="Pcs / Pack" 
                className={`${getInputStyle('unit')} text-center`} 
                value={formData.unit} 
                onChange={(e) => setFormData({...formData, unit: e.target.value})}
                list="unit-suggestions"
              />
            </div>
          </div>

          {/* Image Upload Section - ENHANCED */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-bold text-slate-400 px-1 flex items-center gap-2"><ImagePlus className="w-3 h-3" /> Media Gambar</label>
              {formData.image && (
                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Gambar sudah ditambahkan
                </span>
              )}
            </div>
            
            <div className="flex gap-2 p-1 bg-slate-100 rounded-[13px] w-fit">
              <button 
                type="button" 
                onClick={() => setImageMode('upload')} 
                className={`px-4 py-2 rounded-[13px] text-[10px] font-bold transition-all ${imageMode === 'upload' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Upload File
              </button>
              <button 
                type="button" 
                onClick={() => setImageMode('url')} 
                className={`px-4 py-2 rounded-[13px] text-[10px] font-bold transition-all ${imageMode === 'url' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Link URL
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-slate-50 p-8 rounded-[13px] border-2 border-dashed border-slate-200">
              <div className="md:col-span-3 flex justify-center">
                <div className="w-32 h-32 rounded-[13px] bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 shadow-sm relative group">
                  {formData.image ? (
                    <>
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, image: ''})}
                        className="absolute top-1 right-1 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md hover:bg-red-700 active:scale-90 hover:rotate-90"
                        title="Hapus Gambar"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center">
                      <ImagePlus className="w-10 h-10 text-slate-200 mx-auto mb-1" />
                      <p className="text-[8px] font-bold text-slate-300">No Image</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="md:col-span-9 w-full">
                {imageMode === 'upload' ? (
                  <div className="relative group">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    />
                    <div className="w-full py-12 border-2 border-dashed border-slate-300 rounded-[13px] flex flex-col items-center justify-center gap-3 bg-white group-hover:border-red-400 group-hover:bg-red-50/30 transition-all">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-red-100 transition-all">
                        <Upload className="w-6 h-6 text-slate-400 group-hover:text-red-600" />
                      </div>
                      <div className="text-center">
                        <p className="text-[11px] font-bold text-slate-500 group-hover:text-red-600 transition-colors">Klik untuk upload gambar barang</p>
                        <p className="text-[9px] font-medium text-slate-400 mt-1">Max 2MB • JPG, PNG, WEBP</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input 
                      type="text" 
                      placeholder="https://example.com/image.jpg" 
                      className={getInputStyle('image')} 
                      value={formData.image} 
                      onChange={(e) => setFormData({...formData, image: e.target.value})} 
                    />
                    {formData.image && (
                      <p className="text-[9px] font-medium text-slate-400 flex items-center gap-1">
                        <Info className="w-3 h-3" /> Pastikan URL gambar dapat diakses secara publik
                      </p>
                    )}
                  </div>
                )}
                {errors.image && <p className="text-[10px] font-bold text-red-500 mt-2 px-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.image}</p>}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={handleClearForm}
              className="flex-1 py-5 bg-slate-100 text-slate-600 font-bold rounded-[13px] shadow-sm hover:bg-slate-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <RefreshCcw className="w-5 h-5" /> Reset Form
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="flex-[2] py-5 bg-gradient-to-r from-red-600 to-[#4a0404] text-white font-bold rounded-[13px] shadow-xl shadow-red-200 hover:shadow-red-300 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /><span>Menyimpan...</span></>
              ) : (
                <><Save className="w-5 h-5" /><span>Simpan Inventaris Baru</span></>
              )}
            </button>
          </div>

          {/* General Error Message */}
          {errors.form && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-[13px] flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <p className="text-[11px] font-bold text-red-700">{errors.form}</p>
            </div>
          )}
        </div>
      </form>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in" onClick={() => { setShowSuccessModal(false); onCancel(); }}></div>
          <div className="relative bg-white rounded-[13px] shadow-2xl w-full max-w-sm overflow-hidden animate-modal-pop text-center p-10 border border-emerald-50">
            <div className="w-20 h-20 bg-emerald-50 rounded-[13px] flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 animate-bounce" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Berhasil!</h3>
            <p className="text-sm font-medium text-slate-500 leading-relaxed mb-8">
              Data inventaris baru telah tercatat otomatis di sistem OJK Jawa Timur.
            </p>
            <button 
              onClick={() => { setShowSuccessModal(false); onCancel(); }} 
              className="w-full py-4 bg-emerald-600 text-white font-bold rounded-[13px] shadow-lg hover:bg-emerald-700 transition-all active:scale-95"
            >
              Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddItemView;