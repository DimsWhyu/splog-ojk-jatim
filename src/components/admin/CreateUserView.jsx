import React, { useState } from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Eye, 
  EyeOff, 
  UserPlus,
  Users,
  ShieldCheck,
  KeyRound,
  Search // Tambahan ikon untuk pencarian
} from 'lucide-react';

const CreateUserView = ({ validUsers, WEB_APP_URL, fetchAllData }) => {
  const [activeTab, setActiveTab] = useState('register');
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'user'
  });

  const [updateData, setUpdateData] = useState({
    username: '',
    newPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false); // State untuk password baru
  const [foundPassword, setFoundPassword] = useState(null); // State untuk intip password lama
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});

  // Fungsi untuk intip password user saat ini
  const handlePeekPassword = () => {
    setErrors({});
    const user = validUsers.find(u => 
      String(u.username).trim().toLowerCase() === updateData.username.trim().toLowerCase()
    );

    if (user) {
      setFoundPassword(user.password);
    } else {
      setErrors({ usernameUpdate: 'Username tidak ditemukan' });
      setFoundPassword(null);
    }
  };

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

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    setErrors({});

    const userToUpdate = validUsers.find(u => 
      String(u.username).trim().toLowerCase() === updateData.username.trim().toLowerCase()
    );

    if (!userToUpdate) {
      setErrors({ usernameUpdate: 'Username tidak ditemukan di database' });
      return;
    }

    if (updateData.newPassword.length < 8) {
      setErrors({ passwordUpdate: 'Password baru minimal 8 karakter' });
      return;
    }

    try {
      setIsSubmitting(true);
      await fetch(WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ 
          action: 'updatePassword', 
          username: updateData.username, 
          newPassword: updateData.newPassword 
        })
      });

      setMsg({ type: 'success', text: `Password untuk @${updateData.username} berhasil diperbarui!` });
      setUpdateData({ username: '', newPassword: '' });
      setFoundPassword(null);
      fetchAllData();
    } catch (err) {
      setMsg({ type: 'error', text: 'Gagal memperbarui password.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputStyle = (fieldError) => {
    const base = 'w-full rounded-[13px] px-6 py-4 text-sm font-semibold outline-none transition-all border shadow-sm';
    return fieldError
      ? `${base} bg-red-50 border-red-500 text-red-900 focus:border-red-600`
      : `${base} bg-slate-50 border-slate-200 focus:bg-white focus:border-red-400 text-slate-700`;
  };

  return (
    <div className="max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-700 mx-auto pb-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-4">
            <Users className="w-8 h-8 text-red-600" /> Manajemen User & Akses
          </h2>
          <p className="text-slate-400 font-medium text-sm italic mt-1 pl-1">
            Kelola pendaftaran akun baru atau perbarui kredensial pegawai OJK Jawa Timur.
          </p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => { setActiveTab('register'); setMsg({type:'', text:''}); setErrors({}); }}
          className={`px-8 py-3 rounded-[13px] font-black text-[11px] uppercase tracking-tight transition-all ${activeTab === 'register' ? 'bg-red-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}
        >
          Daftar Akun Baru
        </button>
        <button 
          onClick={() => { setActiveTab('update'); setMsg({type:'', text:''}); setErrors({}); }}
          className={`px-8 py-3 rounded-[13px] font-black text-[11px] uppercase tracking-tight transition-all ${activeTab === 'update' ? 'bg-red-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}
        >
          Ganti Password User
        </button>
      </div>

      <div className="bg-white rounded-[13px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-100 px-10 py-5 flex justify-between items-center relative">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-600"></div>
          <span className="text-[14px] font-bold text-slate-500 tracking-tight pl-2">
            {activeTab === 'register' ? 'Pengaturan Hak Akses Baru' : 'Pemulihan Password Pegawai'}
          </span>
        </div>

        <div className="p-10 space-y-10">
          
          {activeTab === 'register' ? (
            <form onSubmit={handleCreate} className="space-y-10">
              <div className="space-y-3">
                <label className="text-[13px] font-bold text-slate-400 px-1">Pilih Hak Akses (Role)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2 bg-slate-50 rounded-[24px] border border-slate-100">
                  <button type="button" onClick={() => setFormData({ ...formData, role: 'user' })} className={`flex items-center justify-center gap-3 py-4 rounded-[13px] text-sm font-black transition-all ${formData.role === 'user' ? 'bg-white text-red-600 shadow-md scale-[1.02]' : 'text-slate-400'}`}>
                    <UserPlus className="w-5 h-5" /> Akun Pegawai (User)
                  </button>
                  <button type="button" onClick={() => setFormData({ ...formData, role: 'admin' })} className={`flex items-center justify-center gap-3 py-4 rounded-[13px] text-sm font-black transition-all ${formData.role === 'admin' ? 'bg-white text-red-600 shadow-md scale-[1.02]' : 'text-slate-400'}`}>
                    <ShieldCheck className="w-5 h-5" /> Akun Pengelola (Admin)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-8 space-y-2">
                  <label className="text-[13px] font-bold text-slate-400 px-1">Nama Lengkap Pegawai</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Nama lengkap sesuai identitas kantor" className={getInputStyle(errors.name)} />
                  {errors.name && <p className="text-[10px] font-bold text-red-500 px-2">{errors.name}</p>}
                </div>
                <div className="md:col-span-4 space-y-2">
                  <label className="text-[13px] font-bold text-slate-400 px-1">ID Username</label>
                  <input type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} placeholder="Username login" className={getInputStyle(errors.username)} />
                  {errors.username && <p className="text-[10px] font-bold text-red-500 px-2">{errors.username}</p>}
                </div>
              </div>

              <div className="space-y-2 relative">
                <label className="text-[13px] font-bold text-slate-400 px-1">Password (Minimal 8 Karakter)</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" className={getInputStyle(errors.password)} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-600 p-2">
                    {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                  </button>
                </div>
                {errors.password && <p className="text-[10px] font-bold text-red-500 px-2">{errors.password}</p>}
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-gradient-to-r from-red-600 to-[#4a0404] text-white font-black rounded-[13px] shadow-xl transition-all flex items-center justify-center gap-4">
                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <UserPlus className="w-6 h-6" />}
                <span className="uppercase tracking-widest text-[12px]">Daftarkan Akun {formData.role}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-slate-400 px-1 flex justify-between items-center">
                    Username Target
                    {/* BUTTON BARU: Lihat Password Sekarang */}
                    <button 
                      type="button" 
                      onClick={handlePeekPassword}
                      className="text-[10px] text-red-600 flex items-center gap-1 font-black"
                    >
                      <Search className="w-3 h-3" /> Lihat Password Saat Ini
                    </button>
                  </label>
                  <input 
                    type="text" 
                    value={updateData.username} 
                    onChange={(e) => {
                      setUpdateData({...updateData, username: e.target.value});
                      setFoundPassword(null);
                    }} 
                    placeholder="Ketik username yang ingin diganti" 
                    className={getInputStyle(errors.usernameUpdate)} 
                  />
                  {errors.usernameUpdate && <p className="text-[10px] font-bold text-red-500 px-2 italic">{errors.usernameUpdate}</p>}
                  
                  {/* TAMPILAN PASSWORD LAMA */}
                  {foundPassword && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center justify-between">
                      <span className="text-[11px] font-bold text-red-700">Password Sekarang: <span className="font-black ml-1">{foundPassword}</span></span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-slate-400 px-1">Password Baru Pegawai</label>
                  {/* REVISI: Input dengan Icon Mata */}
                  <div className="relative">
                    <input 
                      type={showNewPassword ? 'text' : 'password'} 
                      value={updateData.newPassword} 
                      onChange={(e) => setUpdateData({...updateData, newPassword: e.target.value})} 
                      placeholder="Minimal 8 karakter baru" 
                      className={getInputStyle(errors.passwordUpdate)} 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowNewPassword(!showNewPassword)} 
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-600 p-2"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.passwordUpdate && <p className="text-[10px] font-bold text-red-500 px-2 italic">{errors.passwordUpdate}</p>}
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <p className="text-[11px] font-medium text-amber-800 leading-relaxed">
                  <b>Peringatan:</b> Tindakan ini akan mengganti password user secara permanen. Pastikan Username yang Anda ketikkan sudah sesuai dengan data yang terdaftar di database.
                </p>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-slate-800 text-white font-black rounded-[13px] shadow-xl transition-all flex items-center justify-center gap-4 hover:bg-black">
                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <KeyRound className="w-6 h-6" />}
                <span className="uppercase tracking-widest text-[12px]">Konfirmasi Perubahan Password</span>
              </button>
            </form>
          )}

          {msg.text && (
            <div className={`p-5 rounded-[13px] flex items-center gap-4 text-sm font-bold border animate-in fade-in zoom-in-95 ${msg.type === 'error' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
              {msg.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
              {msg.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateUserView;