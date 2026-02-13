import React, { useState } from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Eye, 
  EyeOff, 
  UserPlus,
  Users,
  ShieldCheck // TAMBAHKAN: Ikon untuk Admin
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
    const base = 'w-full rounded-xl px-4 py-3 text-sm font-semibold outline-none transition-all border shadow-sm';
    return errors[field]
      ? `${base} bg-red-50 border-red-500 text-red-900 focus:border-red-600`
      : `${base} bg-slate-50 border-slate-200 focus:bg-white focus:border-red-400 text-slate-700`;
  };

  return (
    <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <Users className="w-8 h-8 text-red-600" />Manajemen User
        </h2>
        <p className="text-slate-400 font-medium text-sm italic mt-1">
          Daftarkan akun pegawai atau admin OJK Jawa Timur secara aman dan terintegrasi.
        </p>
      </div>

      <form
        onSubmit={handleCreate}
        className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/40 p-8 space-y-6"
      >
        {/* --- REVISI: ROLE SELECTOR (Toggle Admin/User) --- */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-slate-400 uppercase px-1">Pilih Hak Akses (Role)</label>
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'user' })}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
                formData.role === 'user' 
                  ? 'bg-white text-red-600 shadow-sm border border-slate-100' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <UserPlus className="w-4 h-4" /> Akun Pegawai
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'admin' })}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
                formData.role === 'admin' 
                  ? 'bg-white text-red-600 shadow-sm border border-slate-100' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> Akun Admin
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-400 uppercase px-1">Nama Lengkap</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: null });
              }}
              placeholder="Masukkan nama lengkap"
              className={getInputStyle('name')}
            />
            {errors.name && <p className="text-[10px] font-bold text-red-500 px-1">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-400 uppercase px-1">ID Username</label>
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
            {errors.username && <p className="text-[10px] font-bold text-red-500 px-1">{errors.username}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-slate-400 uppercase px-1">Password (Min. 8 Karakter)</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                if (errors.password) setErrors({ ...errors, password: null });
              }}
              placeholder="••••••••"
              className={`${getInputStyle('password')} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && <p className="text-[10px] font-bold text-red-500 px-1">{errors.password}</p>}
        </div>

        {msg.text && (
          <div className={`p-4 rounded-xl flex items-center gap-3 text-xs font-bold border animate-in fade-in zoom-in-95 ${
            msg.type === 'error' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
          }`}>
            {msg.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            {msg.text}
          </div>
        )}

        {/* REVISI: Teks tombol dinamis berdasarkan Role */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-gradient-to-r from-red-600 to-[#4a0404] text-white font-bold rounded-xl shadow-lg hover:shadow-red-200 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Memproses Data...</span>
            </>
          ) : (
            <>
              {formData.role === 'admin' ? <ShieldCheck className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              <span>Daftarkan Akun {formData.role === 'admin' ? 'Admin' : 'Pegawai'}</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-6 px-2">
        <p className="text-[11px] text-slate-400 font-medium italic">
          *Seluruh pendaftaran akun akan tercatat secara otomatis di Database Logistik OJK Provinsi Jawa Timur.
        </p>
      </div>
    </div>
  );
};

export default CreateUserView;