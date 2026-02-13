import React, { useState } from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Eye, 
  EyeOff, 
  UserPlus,
  Users,
  ShieldCheck
} from 'lucide-react';

const CreateUserView = ({ validUsers, WEB_APP_URL, fetchAllData }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'user'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});

  const handleCreate = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Nama lengkap wajib diisi';
    if (!formData.username.trim()) newErrors.username = 'Username wajib diisi';
    if (!formData.password.trim()) newErrors.password = 'Kata sandi wajib diisi';

    const isExist = validUsers.some(u =>
      String(u.username).trim().toLowerCase() === formData.username.trim().toLowerCase()
    );
    if (isExist && !newErrors.username) {
      newErrors.username = 'Username sudah digunakan';
    }

    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Minimal 8 karakter diperlukan';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setMsg({ type: 'error', text: 'Periksa kembali data yang belum sesuai.' });
      return;
    }

    try {
      setErrors({});
      setIsSubmitting(true);
      await fetch(WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ action: 'createUser', ...formData })
      });

      setMsg({ type: 'success', text: `Akun ${formData.name} sebagai ${formData.role} berhasil didaftarkan!` });
      setFormData({ username: '', password: '', name: '', role: 'user' });
      setShowPassword(false);
      fetchAllData();
    } catch (err) {
      setMsg({ type: 'error', text: 'Gagal sinkronisasi. Cek koneksi internet.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputStyle = (field) => {
    const base = 'w-full rounded-[20px] px-6 py-4 text-sm font-semibold outline-none transition-all border shadow-sm';
    return errors[field]
      ? `${base} bg-red-50 border-red-500 text-red-900 focus:border-red-600`
      : `${base} bg-slate-50 border-slate-200 focus:bg-white focus:border-red-400 text-slate-700`;
  };

  return (
    /* UPDATE: max-w-6xl agar seimbang dengan view Tambah Barang */
    <div className="max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-700 mx-auto pb-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-4">
            <Users className="w-8 h-8 text-red-600" /> Manajemen User & Akses
          </h2>
          <p className="text-slate-400 font-medium text-sm italic mt-1 pl-1">
            Daftarkan akun pegawai atau pengelola logistik OJK Jawa Timur secara terpusat.
          </p>
        </div>
      </div>

      <form onSubmit={handleCreate} className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        {/* HEADER SECTION */}
        <div className="bg-slate-50 border-b border-slate-100 px-10 py-5 flex justify-between items-center relative">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-600"></div>
          <span className="text-[14px] font-bold text-slate-500 tracking-tight pl-2">Pengaturan Hak Akses Baru</span>
        </div>

        <div className="p-10 space-y-10">
          {/* SEKSI ROLE SELECTOR */}
          <div className="space-y-3">
            <label className="text-[13px] font-bold text-slate-400 px-1">Pilih Hak Akses (Role)</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2 bg-slate-50 rounded-[24px] border border-slate-100">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'user' })}
                className={`flex items-center justify-center gap-3 py-4 rounded-[20px] text-sm font-black transition-all ${
                  formData.role === 'user' 
                    ? 'bg-white text-red-600 shadow-md border border-slate-100 scale-[1.02]' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <UserPlus className="w-5 h-5" /> Akun Pegawai (User)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'admin' })}
                className={`flex items-center justify-center gap-3 py-4 rounded-[20px] text-sm font-black transition-all ${
                  formData.role === 'admin' 
                    ? 'bg-white text-red-600 shadow-md border border-slate-100 scale-[1.02]' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <ShieldCheck className="w-5 h-5" /> Akun Pengelola (Admin)
              </button>
            </div>
          </div>

          {/* BARIS 1: Nama Lengkap (8/12) & Username (4/12) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-8 space-y-2">
              <label className="text-[13px] font-bold text-slate-400 px-1">Nama Lengkap Pegawai</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: null });
                }}
                placeholder="Masukkan nama lengkap sesuai identitas kantor"
                className={getInputStyle('name')}
              />
              {errors.name && <p className="text-[10px] font-bold text-red-500 px-2">{errors.name}</p>}
            </div>

            <div className="md:col-span-4 space-y-2">
              <label className="text-[13px] font-bold text-slate-400 px-1">ID Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => {
                  setFormData({ ...formData, username: e.target.value });
                  if (errors.username) setErrors({ ...errors, username: null });
                }}
                placeholder="Username login"
                className={getInputStyle('username')}
              />
              {errors.username && <p className="text-[10px] font-bold text-red-500 px-2">{errors.username}</p>}
            </div>
          </div>

          {/* BARIS 2: Password (Full Width) */}
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-slate-400 px-1">Password (Minimal 8 Karakter)</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (errors.password) setErrors({ ...errors, password: null });
                }}
                placeholder="••••••••"
                className={`${getInputStyle('password')} pr-16`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-600 transition-colors p-2"
              >
                {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
              </button>
            </div>
            {errors.password && <p className="text-[10px] font-bold text-red-500 px-2">{errors.password}</p>}
          </div>

          {/* NOTIFIKASI */}
          {msg.text && (
            <div className={`p-5 rounded-[20px] flex items-center gap-4 text-sm font-bold border animate-in fade-in zoom-in-95 ${
              msg.type === 'error' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
            }`}>
              {msg.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
              {msg.text}
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-5 bg-gradient-to-r from-red-600 to-[#4a0404] text-white font-black rounded-[20px] shadow-xl hover:shadow-red-200 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-70 mt-4 group"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Memproses Akun Baru...</span>
              </>
            ) : (
              <>
                {formData.role === 'admin' ? <ShieldCheck className="w-6 h-6 transition-transform group-hover:rotate-12" /> : <UserPlus className="w-6 h-6 transition-transform group-hover:scale-110" />}
                <span className="uppercase tracking-widest text-[12px]">Daftarkan Akun {formData.role === 'admin' ? 'Admin' : 'Pegawai'}</span>
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-8 px-4">
        <p className="text-[11px] text-slate-400 font-medium italic">
          * Seluruh pendaftaran akun {formData.role} akan tercatat secara otomatis di database pusat logistik OJK Provinsi Jawa Timur.
        </p>
      </div>
    </div>
  );
};

export default CreateUserView;