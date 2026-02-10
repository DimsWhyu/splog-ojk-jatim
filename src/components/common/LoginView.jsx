import React, { useState } from 'react';
import { Lock, User, AlertCircle, LogIn, Eye, EyeOff, Check } from 'lucide-react';

const LoginView = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  /* REVISI 5: State untuk trigger validasi visual merah */
  const [submitted, setSubmitted] = useState(false);

  const checkCapsLock = (e) => {
    if (e.getModifierState('CapsLock')) {
      setIsCapsLockOn(true);
    } else {
      setIsCapsLockOn(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setError('');

    /* REVISI 2: Validasi password minimal 8 karakter */
    if (password.length < 8) {
      setError('Mohon isi username dan password terlebih dahulu.');
      return;
    }

    if (!username || !password) return;

    setIsLoading(true);

    setTimeout(() => {
      const success = onLogin(username, password, rememberMe);
      if (!success) {
        setError('Kredensial salah. Pastikan username dan password Anda sudah benar.');
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-4 font-sans text-slate-800">
      <div className="max-w-md w-full animate-in fade-in zoom-in-95 duration-500">
        
        {/* Header Section */}
        <div className="text-center mb-10 space-y-4">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/8/83/OJK_Logo.png" 
            alt="Logo OJK" 
            className="h-20 mx-auto"
          />
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Login Sistem SPLOG</h1>
            <p className="text-sm font-medium text-slate-500">Kantor OJK Regional 4 Provinsi Jawa Timur</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/60 p-10 border border-slate-100 relative overflow-hidden">
          {isLoading && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-red-100 overflow-hidden">
              <div className="h-full bg-red-600 animate-progress-loading"></div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              {/* Input Username */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Username</label>
                <div className="relative group">
                  <User className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors w-5 h-5 ${
                    submitted && !username ? 'text-red-500' : 'text-slate-300 group-focus-within:text-red-500'
                  }`} />
                  <input 
                    type="text"
                    placeholder="Masukkan username"
                    /* REVISI 1: Logic username otomatis lowercase */
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase())}
                    className={`w-full bg-slate-50 border rounded-xl py-3.5 pl-12 pr-4 text-sm font-medium outline-none transition-all ${
                      submitted && !username 
                        ? 'border-red-500 ring-2 ring-red-50' 
                        : 'border-slate-100 focus:border-red-200 focus:bg-white'
                    }`}
                  />
                </div>
              </div>

              {/* Input Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
                </div>
                <div className="relative group">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors w-5 h-5 ${
                    submitted && !password ? 'text-red-500' : 'text-slate-300 group-focus-within:text-red-500'
                  }`} />
                  <input 
                    type={showPassword ? "text" : "password"}
                    onKeyUp={checkCapsLock}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full bg-slate-50 border rounded-xl py-3.5 pl-12 pr-12 text-sm font-medium outline-none transition-all ${
                      submitted && !password 
                        ? 'border-red-500 ring-2 ring-red-50' 
                        : 'border-slate-100 focus:border-red-200 focus:bg-white'
                    }`}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {isCapsLockOn && (
                  <div className="flex items-center gap-1.5 px-2 text-[10px] font-bold text-amber-500 uppercase animate-pulse">
                    <AlertCircle className="w-3 h-3" /> Caps Lock Aktif
                  </div>
                )}
              </div>
            </div>

            {/* REVISI 3: Improve Tampilan Checklist "Ingat saya" */}
            <div className="flex items-center gap-3 px-1 group cursor-pointer" onClick={() => setRememberMe(!rememberMe)}>
              <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${
                rememberMe ? 'bg-red-600 border-red-600 shadow-sm' : 'bg-white border-slate-200 group-hover:border-slate-300'
              }`}>
                {rememberMe && <Check className="w-3.5 h-3.5 text-white stroke-[4]" />}
              </div>
              <label className="text-xs font-semibold text-slate-500 cursor-pointer select-none group-hover:text-slate-700 transition-colors">
                Ingat saya di perangkat ini
              </label>
            </div>

            {/* Tampilan Pesan Error */}
            {error && (
              <div className="flex items-start gap-3 text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-1 duration-200">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-[11px] font-semibold leading-relaxed">{error}</p>
              </div>
            )}

            {/* Tombol Login */}
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-lg shadow-red-100 transition-all active:scale-95 flex items-center justify-center gap-2 tracking-wide disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                /* REVISI 4: Elemen samping Log In menggunakan ikon LogIn yang lebih sesuai */
                <>Log In <LogIn className="w-5 h-5 transition-transform group-hover:translate-x-1" /></>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 space-y-2">
          <p className="text-[10px] text-slate-400 font-medium tracking-widest leading-relaxed">
            Sistem Pengelolaan Logistik &copy; 2026<br/>
            Kantor OJK Regional 4 Jawa Timur
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;