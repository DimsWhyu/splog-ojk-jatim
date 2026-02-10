import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white text-slate-800 py-10 mt-auto border-t-4 border-red-600 shadow-[0_-15px_30px_-5px_rgba(220,38,38,0.15)]">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          
          {/* Logo & Alamat */}
          <div className="flex flex-col items-start gap-4">
            <div className="flex items-center gap-4">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/8/83/OJK_Logo.png" 
                alt="Logo OJK" 
                className="h-14 w-auto object-contain"
              />
              <div className="h-10 w-[2px] bg-slate-200 hidden sm:block"></div>
              <div>
                <h3 className="text-2xl font-black leading-none tracking-tighter text-red-600">Kantor OJK</h3>
                <p className="text-sm font-bold tracking-wider text-slate-500">Provinsi Jawa Timur</p>
              </div>
            </div>
            
            <div className="max-w-md">
              <p className="text-sm font-medium leading-relaxed text-slate-600">
                Jl. Gubernur Suryo No.28-30, Embong Kaliasin, Kec. Genteng, <br className="hidden md:block" />
                Surabaya, Jawa Timur 60174
              </p>
            </div>
          </div>

          {/* Copyright & Info Sistem */}
          <div className="flex flex-col md:items-end justify-center">
            <div className="md:text-right">
              <div className="flex items-center md:justify-end gap-2 mb-2">
              </div>
              <p className="text-l font-bold text-slate-800 leading-tight">
                Sistem Pengelolaan Logistik
              </p>
              <p className="text-xs font-medium mt-1 text-slate-500 tracking-wide">
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