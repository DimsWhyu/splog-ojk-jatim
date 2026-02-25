import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white text-slate-800 py-10 mt-auto border-t-4 border-red-600 shadow-[0_-15px_30px_-5px_rgba(220,38,38,0.15)]">
      {/* UPDATE: Menyelaraskan max-w dan padding dengan Navbar agar balance */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          
          {/* SISI KIRI: Logo & Alamat */}
          <div className="flex flex-col items-start gap-5">
            <div className="flex items-center gap-5">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/8/83/OJK_Logo.png" 
                alt="Logo OJK" 
                className="h-12 md:h-14 w-auto object-contain"
              />
              <div className="h-10 w-[2px] bg-slate-200 hidden sm:block"></div>
              <div className="leading-tight">
                <h3 className="text-xl md:text-2xl font-black tracking-tighter text-red-600">Kantor OJK</h3>
                <p className="text-[11px] md:text-sm font-bold tracking-tight text-slate-400 uppercase">Provinsi Jawa Timur</p>
              </div>
            </div>
            
            <div className="max-w-md">
              <p className="text-sm font-medium leading-relaxed text-slate-500">
                Jl. Gubernur Suryo No.28-30, Embong Kaliasin, Kec. Genteng, <br className="hidden md:block" />
                Surabaya, Jawa Timur 60174
              </p>
            </div>
          </div>

          {/* SISI KANAN: Copyright & Info Sistem */}
          <div className="flex flex-col md:items-end justify-center">
            <div className="md:text-right border-t md:border-t-0 md:border-r-4 border-red-100 md:pr-6 pt-6 md:pt-0">
              <p className="text-[15px] font-black text-slate-800 leading-tight tracking-tighter">
                Sistem Pengelolaan Logistik
              </p>
              <p className="text-[12px] font-medium mt-1.5 text-slate-400 tracking-tight">
                © 2026 Otoritas Jasa Keuangan. All Rights Reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;