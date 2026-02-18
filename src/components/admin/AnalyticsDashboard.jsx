import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceDot, LabelList
} from 'recharts';
import {
  Calendar, TrendingUp, Package,
  Users, ChevronDown, Check, ChevronLeft, ChevronRight,
  Layers, Activity, RotateCcw, Target
} from 'lucide-react';

// --- MAPPING HEX COLORS UNTUK THEMES ---
const getThemeHex = (cat) => {
  const mapping = {
    'Semua': '#b91c1c', 'ATK': '#1d4ed8', 'Pembersih Ruangan': '#047857',
    'Pembersih Dapur': '#0e7490', 'Pembersih Toilet': '#4338ca', 'Pembersih Toilet/Dapur': '#0f766e',
    'Pembersih Serbaguna': '#0369a1', 'Pembersih Furniture': '#334155', 'Pewangi': '#be185d',
    'Pewangi Lemari': '#be123c', 'Pembasmi serangga': '#c2410c', 'Plastik Sampah': '#27272a',
    'Perawatan Taman': '#065f46', 'Gondola': '#1e293b', 'Teknisi ME': '#b45309',
    'Konsumsi': '#7e22ce', 'Kendaraan Dinas': '#a16207'
  };
  const cleanCat = cat?.replace(' (A)', '');
  return mapping[cleanCat] || '#64748b';
};

// --- ENHANCED INLINE CALENDAR WITH MONTH & YEAR SELECTOR ---
const InlineCalendar = ({ selectedDate, onChange }) => {
    const dateObj = selectedDate ? new Date(selectedDate) : new Date();
    const [viewDate, setViewDate] = useState(dateObj);
    const [mode, setMode] = useState('days'); 

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

    const handleMonthSelect = (idx) => { setViewDate(new Date(year, idx, 1)); setMode('days'); };
    const handleYearSelect = (yr) => { setViewDate(new Date(yr, month, 1)); setMode('months'); };

    const renderDays = () => {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const slots = [];
        for (let i = 0; i < firstDay; i++) slots.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
        for (let d = 1; d <= daysInMonth; d++) {
            const currentStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
            const isSelected = selectedDate === currentStr;
            slots.push(<button key={d} type="button" onClick={() => onChange(currentStr)} className={`h-8 w-8 rounded-full text-[10px] font-bold transition-all ${isSelected ? 'bg-red-600 text-white shadow-md' : 'text-slate-600 hover:bg-red-50 hover:text-red-600'}`}>{d}</button>);
        }
        return (
            <>
                <div className="grid grid-cols-7 mb-1 text-center bg-slate-50 rounded-lg py-1">{dayNames.map(d => <div key={d} className="text-[8px] font-black text-slate-400 uppercase">{d}</div>)}</div>
                <div className="grid grid-cols-7 gap-y-1 justify-items-center">{slots}</div>
            </>
        );
    };

    return (
        <div className="p-4 bg-white border border-slate-100 rounded-[13px] shadow-2xl w-[280px] animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-2">
                <button type="button" onClick={() => setViewDate(new Date(year, month - 1, 1))} className="p-1 hover:bg-slate-50 rounded-full text-slate-400"><ChevronLeft size={16}/></button>
                <div className="flex gap-1">
                    <button type="button" onClick={() => setMode('months')} className="text-[11px] font-black text-slate-700 uppercase hover:text-red-600 transition-colors">{monthNames[month]}</button>
                    <button type="button" onClick={() => setMode('years')} className="text-[11px] font-black text-slate-700 uppercase hover:text-red-600 transition-colors">{year}</button>
                </div>
                <button type="button" onClick={() => setViewDate(new Date(year, month + 1, 1))} className="p-1 hover:bg-slate-50 rounded-full text-slate-400"><ChevronRight size={16}/></button>
            </div>

            {mode === 'days' && renderDays()}
            {mode === 'months' && (
                <div className="grid grid-cols-3 gap-2">{monthNames.map((m, idx) => <button key={m} type="button" onClick={() => handleMonthSelect(idx)} className={`py-2 text-[10px] font-bold rounded-lg ${month === idx ? 'bg-red-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-red-50'}`}>{m.substring(0,3)}</button>)}</div>
            )}
            {mode === 'years' && (
                <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">{Array.from({length: 12}, (_, i) => year - 6 + i).map(yr => <button key={yr} type="button" onClick={() => handleYearSelect(yr)} className={`py-2 text-[10px] font-bold rounded-lg ${year === yr ? 'bg-red-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-red-50'}`}>{yr}</button>)}</div>
            )}
        </div>
    );
};

const AnalyticsDashboard = ({ requests, inventory }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('Semua');
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [showStartCal, setShowStartCal] = useState(false);
  const [showEndCal, setShowEndCal] = useState(false);
  
  const dropdownRef = useRef(null);
  const statusRef = useRef(null);
  const startCalRef = useRef(null);
  const endCalRef = useRef(null);
  const typingIntervalRef = useRef(null);

  const [aiText, setAiText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const categories = useMemo(() => [...new Set(inventory.map(item => item.category).filter(Boolean))], [inventory]);
  const statusOptions = ['Semua', 'Disetujui', 'Ditolak', 'Dibatalkan', 'Menunggu'];

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsCatOpen(false);
      if (statusRef.current && !statusRef.current.contains(e.target)) setIsStatusOpen(false);
      if (startCalRef.current && !startCalRef.current.contains(e.target)) setShowStartCal(false);
      if (endCalRef.current && !endCalRef.current.contains(e.target)) setShowEndCal(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filteredData = useMemo(() => {
    return requests.filter(req => {
      const reqDate = new Date(req.date.split('/').reverse().join('-'));
      const matchStart = !startDate || reqDate >= new Date(startDate);
      const matchEnd = !endDate || reqDate <= new Date(endDate);
      const matchStatus = selectedStatus === 'Semua' || req.status === selectedStatus;
      const matchCat = selectedCategories.length === 0 || req.itemsDetail.some(item => selectedCategories.includes(item.category));
      return matchStart && matchEnd && matchStatus && matchCat;
    });
  }, [requests, startDate, endDate, selectedStatus, selectedCategories]);

  const stats = useMemo(() => {
    const daily = {}; const users = {}; const itemFreq = {}; const catFreq = {};
    filteredData.forEach(req => {
      daily[req.date] = (daily[req.date] || 0) + 1;
      users[req.user] = (users[req.user] || 0) + 1;
      req.itemsDetail.forEach(item => {
        itemFreq[item.name] = (itemFreq[item.name] || 0) + Number(item.quantity);
        catFreq[item.category] = (catFreq[item.category] || 0) + Number(item.quantity);
      });
    });
    return {
      timeline: Object.keys(daily).map(k => ({ date: k, count: daily[k] })).sort((a, b) => new Date(a.date.split('/').reverse().join('-')) - new Date(b.date.split('/').reverse().join('-'))),
      user: Object.keys(users).map(k => ({ name: k, count: users[k] })).sort((a, b) => b.count - a.count).slice(0, 5),
      items: Object.keys(itemFreq).map(k => ({ name: k, qty: itemFreq[k] })).sort((a, b) => b.qty - a.qty).slice(0, 6),
      category: Object.keys(catFreq).map(k => ({ name: k, value: catFreq[k] }))
    };
  }, [filteredData]);

  const regenerateAI = useCallback(() => {
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    setAiText(''); setIsTyping(true);
    const lastDate = stats.timeline[stats.timeline.length - 1]?.date || 'Februari 2026';
    const topCategory = [...stats.category].sort((a, b) => b.value - a.value)[0]?.name || 'Logistik';
    const topItem = stats.items[0]?.name || 'Item';
    const summaryText = `Analisis OJK Jatim: Puncak pengajuan terdeteksi pada ${lastDate}. Kategori '${topCategory}' mendominasi volume pengajuan. Disarankan restock item '${topItem}' segera untuk menjaga ritme kerja operasional divisi terkait.`;
    let i = 0;
    typingIntervalRef.current = setInterval(() => {
      setAiText(summaryText.substring(0, i)); i++;
      if (i > summaryText.length) { clearInterval(typingIntervalRef.current); setIsTyping(false); }
    }, 20);
  }, [stats]);

  useEffect(() => { regenerateAI(); }, [regenerateAI]);

  const resetFilters = () => { setStartDate(''); setEndDate(''); setSelectedCategories([]); setSelectedStatus('Semua'); };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in duration-700">
      
      {/* 1. HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-4">
            <TrendingUp className="w-8 h-8 text-red-600" /> Analisis Logistik Terpadu
          </h2>
          <p className="text-slate-400 font-medium text-sm italic mt-1 pl-1">Monitoring tren dan performa inventaris OJK Jatim.</p>
        </div>
        <button type="button" onClick={resetFilters} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-[13px] font-black text-[11px] uppercase tracking-tight transition-all border border-slate-200">
          <RotateCcw className="w-3.5 h-3.5" /> Reset Filter
        </button>
      </div>

      {/* 2. FILTER ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 relative z-50">
        <div className="bg-white p-5 rounded-[13px] border border-slate-100 shadow-sm space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-red-600" /> Rentang Waktu
          </label>
          <div className="flex items-center gap-2">
             <div className="relative flex-1" ref={startCalRef}>
                <button type="button" onClick={() => setShowStartCal(!showStartCal)} className="w-full bg-slate-50 rounded-[10px] px-3 py-2.5 text-[11px] font-bold text-slate-700 flex justify-between items-center hover:bg-slate-100 transition-all border border-slate-100 truncate">
                    {startDate ? startDate.split('-').reverse().join('/') : 'Awal'} <Calendar size={12} className="text-slate-400"/>
                </button>
                {showStartCal && <div className="absolute top-full left-0 mt-2 z-[999]"><InlineCalendar selectedDate={startDate} onChange={(d) => {setStartDate(d); setShowStartCal(false);}} /></div>}
             </div>
             <span className="text-slate-300 font-black">-</span>
             <div className="relative flex-1" ref={endCalRef}>
                <button type="button" onClick={() => setShowEndCal(!showEndCal)} className="w-full bg-slate-50 rounded-[10px] px-3 py-2.5 text-[11px] font-bold text-slate-700 flex justify-between items-center hover:bg-slate-100 transition-all border border-slate-100 truncate">
                    {endDate ? endDate.split('-').reverse().join('/') : 'Akhir'} <Calendar size={12} className="text-slate-400"/>
                </button>
                {showEndCal && <div className="absolute top-full right-0 mt-2 z-[999]"><InlineCalendar selectedDate={endDate} onChange={(d) => {setEndDate(d); setShowEndCal(false);}} /></div>}
             </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[13px] border border-slate-100 shadow-sm space-y-3 relative" ref={dropdownRef}>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-red-600" /> Jenis Item
          </label>
          <button type="button" onClick={() => setIsCatOpen(!isCatOpen)} className="w-full bg-slate-50 rounded-[10px] px-4 py-2.5 text-[11px] font-bold text-slate-700 flex justify-between items-center hover:bg-slate-100 transition-all border border-slate-100">
            <span className="truncate">{selectedCategories.length > 0 ? `${selectedCategories.length} Kategori` : 'Semua Kategori'}</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isCatOpen ? 'rotate-180' : ''}`} />
          </button>
          {isCatOpen && (
            <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-white border border-slate-100 shadow-xl rounded-[13px] overflow-hidden p-2 animate-in zoom-in-95">
              <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1">
                {categories.map(cat => (
                  <label key={cat} className="flex items-center gap-3 px-3 py-2 hover:bg-red-50 rounded-[8px] cursor-pointer group">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${selectedCategories.includes(cat) ? 'bg-red-600 border-red-600' : 'border-slate-300'}`}>
                      {selectedCategories.includes(cat) && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <input type="checkbox" className="hidden" checked={selectedCategories.includes(cat)} onChange={() => setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])} />
                    <span className="text-[11px] font-bold text-slate-600 group-hover:text-red-600">{cat}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white p-5 rounded-[13px] border border-slate-100 shadow-sm space-y-3 relative" ref={statusRef}>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-red-600" /> Status Approval
          </label>
          <button type="button" onClick={() => setIsStatusOpen(!isStatusOpen)} className="w-full bg-slate-50 rounded-[10px] px-4 py-2.5 text-[11px] font-bold text-slate-700 flex justify-between items-center hover:bg-slate-100 transition-all border border-slate-100">
            <span>{selectedStatus}</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isStatusOpen ? 'rotate-180' : ''}`} />
          </button>
          {isStatusOpen && (
            <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-white border border-slate-100 shadow-xl rounded-[13px] overflow-hidden p-1 animate-in zoom-in-95">
              {statusOptions.map(opt => (
                <button key={opt} type="button" onClick={() => { setSelectedStatus(opt); setIsStatusOpen(false); }} className={`w-full text-left px-4 py-2.5 text-[11px] font-bold rounded-[8px] transition-colors ${selectedStatus === opt ? 'bg-red-600 text-white' : 'text-slate-600 hover:bg-red-50 hover:text-red-600'}`}>
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. EXECUTIVE INSIGHT SUMMARY (OJK RED GRADIENT) */}
      <div className="bg-gradient-to-br from-[#B91C1C] via-[#991b1b] to-[#4a0404] p-6 rounded-[13px] shadow-xl shadow-red-900/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
        <div className="relative flex flex-col md:flex-row gap-6 items-center">
          <div className="w-16 h-16 bg-white backdrop-blur-md rounded-[13px] flex items-center justify-center border border-white/20 shadow-inner shrink-0">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Google_Gemini_icon_2025.svg/500px-Google_Gemini_icon_2025.svg.png" className={`w-10 h-10 object-contain ${isTyping ? 'animate-pulse' : ''}`} alt="Gemini" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="bg-white/20 text-white text-[8px] font-black px-2 py-0.5 rounded-full tracking-tight uppercase border border-white/10">AI Intelligence</span>
                <h3 className="text-sm font-black text-white tracking-tight">Executive Insight Summary</h3>
              </div>
              <button type="button" onClick={regenerateAI} disabled={isTyping} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white">
                <RotateCcw className={`w-4 h-4 ${isTyping ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <p className="text-red-50 text-[13px] leading-relaxed font-medium italic min-h-[3rem]">
              "{aiText}"{isTyping && <span className="inline-block w-1 h-4 bg-white ml-1 animate-pulse" />}
            </p>
          </div>
        </div>
      </div>

      {/* 4. AREA CHART (REFINED STROKE) */}
      <div className="bg-white p-8 rounded-[13px] border border-slate-100 shadow-sm relative overflow-hidden">
        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-tight mb-8 flex items-center gap-2">
          <Target className="w-4 h-4 text-red-600" /> Analisis Tren Permintaan Logistik
        </h4>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.timeline} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#DC2626" stopOpacity={0.7}/>
                  <stop offset="95%" stopColor="#DC2626" stopOpacity={0.01}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" fontSize={9} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 600}} dy={15} />
              <YAxis fontSize={9} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 600}} />
              <Tooltip content={({ active, payload, label }) => active && payload && (
                <div className="bg-white/95 backdrop-blur-sm p-3 border border-slate-100 shadow-xl rounded-[13px]">
                   <p className="font-black text-slate-500 uppercase tracking-tight text-[10px] mb-1">{label}</p>
                   <p className="font-black text-red-600 text-sm">{payload[0].value} Pengajuan</p>
                </div>
              )} />
              {/* REVISI: Stroke Width disesuaikan (3.5) agar tidak terlalu tebal */}
              <Area type="monotone" dataKey="count" stroke="#DC2626" strokeWidth={3.5} fillOpacity={1} fill="url(#colorCount)" />
              {stats.timeline.length > 0 && (
                (() => {
                  const peak = [...stats.timeline].sort((a, b) => b.count - a.count)[0];
                  return (
                    <ReferenceDot x={peak.date} y={peak.count} r={6} fill="#B91C1C" stroke="white" strokeWidth={2}>
                      <LabelList dataKey="count" position="top" offset={12} fontSize={10} fontWeight={900} fill="#B91C1C" formatter={() => `Puncak: ${peak.count}`} />
                    </ReferenceDot>
                  );
              })()
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. PIE & BAR GRID (CONSISTENT WIDER BARS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        <div className="bg-white p-6 rounded-[13px] border border-slate-100 shadow-sm flex flex-col items-center">
          <h4 className="w-full text-[10px] font-black text-slate-500 uppercase tracking-tight mb-6 flex items-center gap-2">
            <Activity className="w-4 h-4 text-red-600" /> Proporsi Kategori
          </h4>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                {/* REVISI: Shape dipertebal (inner 50, outer 95) */}
                <Pie data={stats.category} innerRadius={50} outerRadius={95} paddingAngle={1} dataKey="value" stroke="white" strokeWidth={2}>
                  {stats.category.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getThemeHex(entry.name)} cornerRadius={3} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{fontSize: '9px', fontWeight: 700, paddingTop: '20px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[13px] border border-slate-100 shadow-sm">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-tight mb-6 flex items-center gap-2">
            <Package className="w-4 h-4 text-red-600" /> Top Item (Qty)
          </h4>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.items} layout="vertical" margin={{left: -20, right: 40}}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" fontSize={8} width={80} axisLine={false} tickLine={false} tick={{fill: '#475569', fontWeight: 800}} />
                <Tooltip cursor={{fill: '#f8fafc', opacity: 0.4}} />
                {/* REVISI: BarSize diperlebar (35) & Annot Angka */}
                <Bar dataKey="qty" fill="#B91C1C" radius={[0, 4, 4, 0]} barSize={35}>
                   <LabelList dataKey="qty" position="right" fontSize={9} fontWeight={900} fill="#B91C1C" offset={10} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[13px] border border-slate-100 shadow-sm">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-tight mb-6 flex items-center gap-2">
            <Users className="w-4 h-4 text-red-600" /> Intensitas User
          </h4>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.user} margin={{top: 25}}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={8} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 700}} dy={10} />
                <YAxis fontSize={8} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 700}} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                {/* REVISI: BarSize diperlebar (35) & Annot Angka di atas bar */}
                <Bar dataKey="count" fill="#1E293B" radius={[4, 4, 0, 0]} barSize={35}>
                    <LabelList dataKey="count" position="top" fontSize={10} fontWeight={900} fill="#1E293B" offset={10} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;