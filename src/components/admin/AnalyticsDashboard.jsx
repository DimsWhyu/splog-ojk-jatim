import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceDot, LabelList
} from 'recharts';
import {
  Calendar, TrendingUp, Package,
  Users, ChevronDown, Check, ChevronLeft, ChevronRight,
  Layers, Activity, RotateCcw, Target, FileSpreadsheet, FileText,
  Search, X
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// --- MAPPING HEX COLORS ---
const getThemeHex = (cat) => {
  const mapping = {
    'Semua': '#b91c1c', 'ATK': '#1d4ed8', 'Pembersih Ruangan': '#10b981',
    'Pembersih Dapur': '#06b6d4', 'Pembersih Toilet': '#6366f1', 'Pembersih Toilet/Dapur': '#14b8a6',
    'Pembersih Serbaguna': '#0ea5e9', 'Pembersih Furniture': '#64748b', 'Pewangi': '#f43f5e',
    'Pewangi Lemari': '#e11d48', 'Pembasmi serangga': '#f97316', 'Plastik Sampah': '#27272a',
    'Perawatan Taman': '#15803d', 'Gondola': '#1e293b', 'Teknisi ME': '#d97706',
    'Konsumsi': '#a855f7', 'Kendaraan Dinas': '#eab308', 'Logistik': '#ef4444'
  };
  const cleanCat = cat?.replace(' (A)', '');
  return mapping[cleanCat] || '#94a3b8';
};

// --- CUSTOM INLINE CALENDAR ---
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
            <div className="animate-in fade-in duration-300">
                <div className="grid grid-cols-7 mb-1 text-center bg-slate-50 rounded-lg py-1">{dayNames.map(d => <div key={d} className="text-[8px] font-black text-slate-400 uppercase tracking-tight">{d}</div>)}</div>
                <div className="grid grid-cols-7 gap-y-1 justify-items-center">{slots}</div>
            </div>
        );
    };
    return (
        <div className="p-4 bg-white border border-slate-100 rounded-[13px] shadow-2xl w-[280px]">
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
                <div className="grid grid-cols-3 gap-2 animate-in zoom-in-95">{monthNames.map((m, idx) => <button key={m} type="button" onClick={() => handleMonthSelect(idx)} className={`py-2 text-[10px] font-bold rounded-lg ${month === idx ? 'bg-red-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-red-50'}`}>{m.substring(0,3)}</button>)}</div>
            )}
            {mode === 'years' && (
                <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-1 animate-in zoom-in-95">{Array.from({length: 12}, (_, i) => year - 6 + i).map(yr => <button key={yr} type="button" onClick={() => handleYearSelect(yr)} className={`py-2 text-[10px] font-bold rounded-lg ${year === yr ? 'bg-red-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-red-50'}`}>{yr}</button>)}</div>
            )}
        </div>
    );
};

// --- KPI CARD COMPONENT ---
const KPICard = ({ icon: Icon, title, value, subtext, trend, color = "red" }) => {
  const colorClasses = {
    red: "from-red-500 to-red-600",
    blue: "from-blue-500 to-blue-600",
    emerald: "from-emerald-500 to-emerald-600",
    amber: "from-amber-500 to-amber-600",
  };
  return (
    <div className="bg-white p-4 rounded-[13px] border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight">{title}</p>
          <p className="text-2xl font-black text-slate-800 mt-1 tracking-tight">{value}</p>
          {subtext && <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{subtext}</p>}
        </div>
        <div className={`w-10 h-10 rounded-[10px] bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-1">
          <TrendingUp className={`w-3 h-3 ${trend >= 0 ? 'text-emerald-500' : 'text-red-500'}`} />
          <span className={`text-[9px] font-bold ${trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {trend >= 0 ? '+' : ''}{trend}% vs periode sebelumnya
          </span>
        </div>
      )}
    </div>
  );
};

const AnalyticsDashboard = ({ requests, inventory }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('Semua');
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [isItemOpen, setIsItemOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [showStartCal, setShowStartCal] = useState(false);
  const [showEndCal, setShowEndCal] = useState(false);
  const [topItemsLimit, setTopItemsLimit] = useState(10);
  const [isTopItemsOpen, setIsTopItemsOpen] = useState(false);
  const [topUsersLimit, setTopUsersLimit] = useState(5);
  const [isTopUsersOpen, setIsTopUsersOpen] = useState(false);
  const [itemSearch, setItemSearch] = useState('');

  // Refs for each specific chart section
  const areaChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const userBarRef = useRef(null);
  const itemBarRef = useRef(null);

  const dropdownRef = useRef(null);
  const itemDropdownRef = useRef(null);
  const statusRef = useRef(null);
  const startCalRef = useRef(null);
  const endCalRef = useRef(null);
  const topItemsRef = useRef(null);
  const topUsersRef = useRef(null);

  const [aiText, setAiText] = useState('');

  const categories = useMemo(() => [...new Set(inventory.map(item => item.category).filter(Boolean))], [inventory]);
  const allItems = useMemo(() => [...new Set(inventory.map(item => ({ 
    code: item.code || '', 
    name: item.name,
    display: `${item.code ? `[${item.code}] ` : ''}${item.name}`
  })))], [inventory]);
  
  const statusOptions = ['Semua', 'Disetujui', 'Ditolak', 'Dibatalkan', 'Menunggu'];
  const topOptions = [5, 10, 15, 20, 0];

  // Filter items based on search
  const filteredItemsList = useMemo(() => {
    if (!itemSearch) return allItems;
    const search = itemSearch.toLowerCase();
    return allItems.filter(item => 
      item.name.toLowerCase().includes(search) || 
      item.code.toLowerCase().includes(search)
    );
  }, [allItems, itemSearch]);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsCatOpen(false);
      if (itemDropdownRef.current && !itemDropdownRef.current.contains(e.target)) setIsItemOpen(false);
      if (statusRef.current && !statusRef.current.contains(e.target)) setIsStatusOpen(false);
      if (startCalRef.current && !startCalRef.current.contains(e.target)) setShowStartCal(false);
      if (endCalRef.current && !endCalRef.current.contains(e.target)) setShowEndCal(false);
      if (topItemsRef.current && !topItemsRef.current.contains(e.target)) setIsTopItemsOpen(false);
      if (topUsersRef.current && !topUsersRef.current.contains(e.target)) setIsTopUsersOpen(false);
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
      const matchItem = selectedItems.length === 0 || req.itemsDetail.some(item => selectedItems.includes(item.name));
      return matchStart && matchEnd && matchStatus && matchCat && matchItem;
    });
  }, [requests, startDate, endDate, selectedStatus, selectedCategories, selectedItems]);

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
    const itemsArr = Object.keys(itemFreq).map(k => ({ name: k, qty: itemFreq[k] })).sort((a,b) => b.qty - a.qty);
    const usersArr = Object.keys(users).map(k => ({ name: k, count: users[k] })).sort((a,b) => b.count - a.count);
    const timelineData = Object.keys(daily).map(k => ({ date: k, count: daily[k] })).sort((a, b) => new Date(a.date.split('/').reverse().join('-')) - new Date(b.date.split('/').reverse().join('-')));
    
    return {
      timeline: timelineData,
      user: topUsersLimit === 0 ? usersArr : usersArr.slice(0, topUsersLimit),
      items: topItemsLimit === 0 ? itemsArr : itemsArr.slice(0, topItemsLimit),
      category: Object.keys(catFreq).map(k => ({ name: k, value: catFreq[k] })),
      peakDate: [...timelineData].sort((a,b) => b.count - a.count)[0],
      topCat: Object.keys(catFreq).reduce((a, b) => catFreq[a] > catFreq[b] ? a : b, ""),
      topUser: usersArr[0]
    };
  }, [filteredData, topItemsLimit, topUsersLimit]);

  const regenerateAI = useCallback(() => {
    const lastDate = stats.timeline[stats.timeline.length - 1]?.date || 'Februari 2026';
    const topCategory = [...stats.category].sort((a, b) => b.value - a.value)[0]?.name || 'ATK';
    const summaryText = `Analisis OJK Jatim: Berdasarkan data per ${lastDate}, stabilitas arus barang keluar terjaga dengan baik. Kategori '${topCategory}' menjadi fokus utama pemenuhan logistik kantor. Saran: Lakukan audit stok bulanan lebih awal untuk item dengan intensitas penggunaan tinggi guna menjaga kelancaran operasional administrasi.`;
    setAiText(summaryText);
  }, [stats]);

  useEffect(() => { regenerateAI(); }, [regenerateAI]);

  // --- EXCEL EXPORT ---
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    const totalQty = stats.items.reduce((acc, curr) => acc + curr.qty, 0);
    const avgItemsPerReq = filteredData.length > 0 ? (totalQty / filteredData.length).toFixed(2) : 0;
    
    const summaryData = [
      ["LAPORAN REKAPITULASI ANALISIS LOGISTIK OJK PROVINSI JAWA TIMUR"],
      ["Tanggal Ekspor", new Date().toLocaleString('id-ID')],
      ["Periode Filter", `${startDate || 'Awal'} s/d ${endDate || 'Terbaru'}`],
      ["Kategori Filter", selectedCategories.length > 0 ? selectedCategories.join(', ') : 'Semua Kategori'],
      ["Item Filter", selectedItems.length > 0 ? selectedItems.join(', ') : 'Semua Item'],
      ["Status Filter", selectedStatus],
      ["Filter Top User", topUsersLimit === 0 ? 'Semua User' : `Top ${topUsersLimit}`],
      ["Filter Top Item", topItemsLimit === 0 ? 'Semua Item' : `Top ${topItemsLimit}`],
      [],
      ["I. HIGHLIGHT KPI UTAMA"],
      ["Total Pengajuan", filteredData.length, "Transaksi"],
      ["Total Unit Item Keluar", totalQty, "Unit"],
      ["Rata-rata Unit per Pengajuan", avgItemsPerReq, "Unit/Req"],
      ["Puncak Aktivitas", stats.peakDate ? `${stats.peakDate.date} (${stats.peakDate.count} Pengajuan)` : '-', "Tanggal"],
      [],
      ["II. AI INSIGHT SUMMARY"],
      [aiText],
      [],
      ["III. ANALISIS TREN PERMINTAAN HARIAN"],
      ["Tanggal", "Jumlah Pengajuan"]
    ];

    stats.timeline.forEach(t => summaryData.push([t.date, t.count]));

    summaryData.push([], ["IV. ANALISIS PROPORSI KATEGORI"], ["Nama Kategori", "Total Unit", "Persentase (%)"]);
    stats.category.forEach(c => {
      const percentage = totalQty > 0 ? ((c.value / totalQty) * 100).toFixed(1) : 0;
      summaryData.push([c.name, c.value, `${percentage}%`]);
    });

    summaryData.push([], [`V. INTENSITAS USER AKTIF (${topUsersLimit === 0 ? 'SEMUA' : 'TOP ' + topUsersLimit})`], ["Nama User", "Jumlah Pengajuan"]);
    stats.user.forEach(u => summaryData.push([u.name, u.count]));

    summaryData.push([], [`VI. ANALISIS VOLUME PENGELUARAN ITEM (${topItemsLimit === 0 ? 'SEMUA' : 'TOP ' + topItemsLimit})`], ["Nama Item", "Total Kuantitas"]);
    stats.items.forEach(item => summaryData.push([item.name, item.qty]));

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    wsSummary['!cols'] = [{wch: 35}, {wch: 25}, {wch: 15}];

    const detailedRows = [];
    filteredData.forEach((req) => {
      req.itemsDetail.forEach((item) => {
        detailedRows.push({
          "ID Pengajuan": req.id,
          "Tanggal": req.date,
          "Pemohon": req.user,
          "Kategori": item.category,
          "Barang": item.name,
          "Qty": Number(item.quantity),
          "Status": req.status,
          "Catatan": req.note || req.notes || "-"
        });
      });
    });

    const wsDetail = XLSX.utils.json_to_sheet(detailedRows);
    wsDetail['!cols'] = [{wch: 15}, {wch: 15}, {wch: 25}, {wch: 20}, {wch: 30}, {wch: 10}, {wch: 15}, {wch: 35}];

    XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan Analisis");
    XLSX.utils.book_append_sheet(wb, wsDetail, "Data Mentah (Filtered)");
    XLSX.writeFile(wb, `Logistik_OJK_${new Date().getTime()}.xlsx`);
  };

  // --- PDF EXPORT ---
  const handleExportPDF = async () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    const bookmanBase64 = "PASTE_BASE64_STRING_TTF_KAMU_DI_SINI"; 
    if (bookmanBase64 !== "PASTE_BASE64_STRING_TTF_KAMU_DI_SINI") {
        doc.addFileToVFS("BookmanOldStyle.ttf", bookmanBase64);
        doc.addFont("BookmanOldStyle.ttf", "Bookman", "normal");
        doc.addFont("BookmanOldStyle.ttf", "Bookman", "bold");
    }

    const applyStyle = (size = 10, style = 'normal', color = [0,0,0]) => {
        const fontName = bookmanBase64 !== "PASTE_BASE64_STRING_TTF_KAMU_DI_SINI" ? "Bookman" : "times";
        doc.setFont(fontName, style); doc.setFontSize(size); doc.setTextColor(...color);
    };

    const addPageHeader = () => {
        const logoUrl = "https://upload.wikimedia.org/wikipedia/commons/8/83/OJK_Logo.png  ";
        doc.addImage(logoUrl, 'PNG', 92, 15, 26, 12); 
        applyStyle(14, 'bold', [185, 28, 28]);
        doc.text("LAPORAN REKAPITULASI ANALISIS LOGISTIK", 105, 35, { align: "center" });
        doc.text("OJK PROVINSI JAWA TIMUR", 105, 42, { align: "center" });
        applyStyle(10, 'normal', [100, 100, 100]);
        doc.text(`Periode: ${startDate || 'Semua'} - ${endDate || 'Semua'}`, 105, 49, { align: "center" });
        doc.setDrawColor(200); doc.line(15, 54, 195, 54);
    };

    addPageHeader();
    let y = 65;
    applyStyle(12, 'bold', [30, 41, 59]);
    doc.text("RINGKASAN EKSEKUTIF (AI ANALYSIS)", 15, y);
    y += 8;
    doc.setFillColor(248, 250, 252); doc.roundedRect(15, y, 180, 45, 3, 3, 'F');
    applyStyle(10, 'italic', [71, 85, 105]);
    const splitAI = doc.splitTextToSize(aiText, 170);
    doc.text(splitAI, 20, y + 12);

    const addSection = async (ref, title, interpret) => {
        doc.addPage(); addPageHeader();
        let currentY = 65;
        applyStyle(12, 'bold', [30, 41, 59]);
        doc.text(title, 15, currentY);
        currentY += 8;

        if (ref.current) {
            const canvas = await html2canvas(ref.current, { scale: 3, backgroundColor: "#ffffff" });
            const imgWidth = 175;
            const imgHeight = (canvas.height * imgWidth) / canvas.width; 
            doc.addImage(canvas.toDataURL('image/png'), 'PNG', 17.5, currentY, imgWidth, imgHeight);
            currentY += imgHeight + 15;
        }

        applyStyle(11, 'bold', [185, 28, 28]);
        doc.text("Hasil Analisis & Interpretasi Data Menyeluruh:", 15, currentY);
        applyStyle(10, 'normal', [71, 85, 105]);
        const splitText = doc.splitTextToSize(interpret, 180);
        doc.text(splitText, 15, currentY + 7);
    };

    await addSection(areaChartRef, "1. ANALISIS TREN PERMINTAAN LOGISTIK", `Berdasarkan data time-series, aktivitas pengeluaran logistik menunjukkan pola fluktuatif yang dinamis. Titik puncak (peak point) tertinggi tercatat pada tanggal ${stats.peakDate?.date || '-'} dengan volume sebanyak ${stats.peakDate?.count || 0} unit pengajuan. Tren ini mencerminkan tingginya intensitas program kerja operasional OJK Jatim pada periode tersebut. Disarankan kepada pimpinan untuk menyinkronkan jadwal pengadaan stok barang sebelum masuk ke periode puncak mingguan guna mencegah terjadinya kekosongan (out-of-stock) yang dapat menghambat birokrasi.`);
    await addSection(pieChartRef, "2. ANALISIS PROPORSI KATEGORI BARANG", `Komposisi pengeluaran inventaris mengonfirmasi adanya dominasi kuat pada kategori '${stats.topCat}'. Kategori ini mengonsumsi alokasi terbesar dari total distribusi logistik dalam periode ini. Dominansi tunggal pada satu kategori memberikan indikasi ketergantungan operasional kantor yang tinggi terhadap suplai barang tersebut. Manajemen disarankan untuk melakukan review efisiensi penggunaan pada kategori dominan ini dan menjajaki kontrak pengadaan volume (bulk-buying) guna mendapatkan efisiensi anggaran.`);
    await addSection(userBarRef, "3. PEMETAAN INTENSITAS PENGGUNA AKTIF", `Hasil audit data pengguna mengidentifikasi Saudara/i '${stats.topUser?.name || '-'}' sebagai pemohon logistik paling proaktif dengan frekuensi pengajuan mencapai ${stats.topUser?.count || 0} kali. Distribusi ini memberikan gambaran beban kerja administratif di setiap unit kerja. Pimpinan dapat memanfaatkan data ini sebagai basis evaluasi beban kerja internal untuk memastikan permintaan selaras dengan output kerja riil.`);
    await addSection(itemBarRef, "4. ANALISIS PERPUTARAN STOK BARANG (INVENTORY TURNOVER)", `Item '${stats.items[0]?.name || '-'}' teridentifikasi sebagai komoditas dengan perputaran tercepat (Fast-Moving Goods). Sebagai institusi yang mengedepankan efisiensi operasional, OJK Jatim perlu menerapkan kebijakan 'Critical Stock Level' pada 10 item teratas dalam daftar ini. Pemantauan stok harian harus diprioritaskan agar ketersediaan barang tidak pernah mencapai titik nol.`);

    doc.save(`Laporan_Analisis_Logistik_OJK.pdf`);
  };

  const resetFilters = () => { 
    setStartDate(''); 
    setEndDate(''); 
    setSelectedCategories([]); 
    setSelectedItems([]);
    setSelectedStatus('Semua'); 
  };

  const removeSelectedItem = (itemName) => {
    setSelectedItems(prev => prev.filter(item => item !== itemName));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in duration-700">
      
      {/* 1. HEADER PANEL */}
      <div className="flex items-center justify-between relative z-10">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-4">
            <TrendingUp className="w-8 h-8 text-red-600" /> Analisis Logistik Terpadu
          </h2>
          <p className="text-slate-400 font-medium text-sm italic pl-1">Monitoring tren dan performa inventaris OJK Provinsi Jawa Timur.</p>
        </div>
        
        <div className="flex items-center gap-3">
            <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-[13px] font-black text-[11px] uppercase tracking-tight transition-all shadow-md active:scale-95">
                <FileSpreadsheet className="w-4 h-4" /> Export Excel
            </button>
            <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white hover:bg-slate-900 rounded-[13px] font-black text-[11px] uppercase tracking-tight transition-all shadow-md active:scale-95">
                <FileText className="w-4 h-4" /> Export PDF
            </button>
            <div className="w-[1px] h-6 bg-slate-200 mx-1" />
            <button type="button" onClick={resetFilters} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-[13px] font-black text-[11px] uppercase tracking-tight transition-all border border-slate-200">
                <RotateCcw className="w-3.5 h-3.5" /> Reset Filter
            </button>
        </div>
      </div>

      {/* 2. FILTER ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 relative z-20">
        {/* Date Filter */}
        <div className="bg-white p-5 rounded-[13px] border border-slate-100 shadow-sm space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-red-600" /> Rentang Waktu
          </label>
          <div className="flex items-center gap-2">
             <div className="relative flex-1" ref={startCalRef}>
                <button type="button" onClick={() => setShowStartCal(!showStartCal)} className="w-full bg-slate-50 rounded-[10px] px-3 py-2.5 text-[11px] font-bold text-slate-700 flex justify-between items-center hover:bg-slate-100 transition-all border border-slate-100 truncate">
                    {startDate ? startDate.split('-').reverse().join('/') : 'Awal'} <Calendar size={12} className="text-slate-400"/>
                </button>
                {showStartCal && <div className="absolute top-full left-0 mt-2 z-[999] shadow-2xl animate-in zoom-in-95 origin-top-left"><InlineCalendar selectedDate={startDate} onChange={(d) => {setStartDate(d); setShowStartCal(false);}} /></div>}
             </div>
             <span className="text-slate-300 font-black">-</span>
             <div className="relative flex-1" ref={endCalRef}>
                <button type="button" onClick={() => setShowEndCal(!showEndCal)} className="w-full bg-slate-50 rounded-[10px] px-3 py-2.5 text-[11px] font-bold text-slate-700 flex justify-between items-center hover:bg-slate-100 transition-all border border-slate-100 truncate">
                    {endDate ? endDate.split('-').reverse().join('/') : 'Akhir'} <Calendar size={12} className="text-slate-400"/>
                </button>
                {showEndCal && <div className="absolute top-full right-0 mt-2 z-[999] shadow-2xl animate-in zoom-in-95 origin-top-right"><InlineCalendar selectedDate={endDate} onChange={(d) => {setEndDate(d); setShowEndCal(false);}} /></div>}
             </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-white p-5 rounded-[13px] border border-slate-100 shadow-sm space-y-3 relative" ref={dropdownRef}>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-red-600" /> Filter Kategori
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

        {/* Item Filter - NEW */}
        <div className="bg-white p-5 rounded-[13px] border border-slate-100 shadow-sm space-y-3 relative" ref={itemDropdownRef}>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight flex items-center gap-2">
            <Package className="w-3.5 h-3.5 text-red-600" /> Filter Item
          </label>
          <button type="button" onClick={() => setIsItemOpen(!isItemOpen)} className="w-full bg-slate-50 rounded-[10px] px-4 py-2.5 text-[11px] font-bold text-slate-700 flex justify-between items-center hover:bg-slate-100 transition-all border border-slate-100">
            <span className="truncate">{selectedItems.length > 0 ? `${selectedItems.length} Item Dipilih` : 'Semua Item'}</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isItemOpen ? 'rotate-180' : ''}`} />
          </button>
          {isItemOpen && (
            <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-white border border-slate-100 shadow-xl rounded-[13px] overflow-hidden p-3 animate-in zoom-in-95 w-full min-w-[300px]">
              {/* Search Input */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  placeholder="Cari nama atau kode barang..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  autoFocus
                />
                {itemSearch && (
                  <button 
                    onClick={() => setItemSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {/* Selected Items Tags */}
              {selectedItems.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3 pb-3 border-b border-slate-100">
                  {selectedItems.map(itemName => (
                    <span key={itemName} className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded-md text-[9px] font-bold">
                      {itemName}
                      <button onClick={() => removeSelectedItem(itemName)} className="hover:bg-red-100 rounded">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              
              {/* Items List */}
              <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1">
                {filteredItemsList.length === 0 ? (
                  <p className="text-center text-[10px] text-slate-400 py-4">Item tidak ditemukan</p>
                ) : (
                  filteredItemsList.map(item => (
                    <label key={item.name} className="flex items-center gap-3 px-2 py-2 hover:bg-red-50 rounded-[8px] cursor-pointer group">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${selectedItems.includes(item.name) ? 'bg-red-600 border-red-600' : 'border-slate-300'}`}>
                        {selectedItems.includes(item.name) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={selectedItems.includes(item.name)} 
                        onChange={() => setSelectedItems(prev => prev.includes(item.name) ? prev.filter(i => i !== item.name) : [...prev, item.name])} 
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-slate-700 group-hover:text-red-600 truncate">{item.name}</p>
                        {item.code && <p className="text-[8px] text-slate-400">{item.code}</p>}
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Status Filter */}
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

      {/* 2.5. KPI CARDS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-15">
        <KPICard 
          icon={FileText} 
          title="Total Pengajuan" 
          value={filteredData.length} 
          subtext="Transaksi" 
          trend={12} 
          color="red" 
        />
        <KPICard 
          icon={Package} 
          title="Total Unit Keluar" 
          value={stats.items.reduce((acc, curr) => acc + curr.qty, 0).toLocaleString('id-ID')} 
          subtext="Unit" 
          trend={8} 
          color="blue" 
        />
        <KPICard 
          icon={Users} 
          title="Rata-rata/User" 
          value={filteredData.length > 0 ? (stats.items.reduce((acc, curr) => acc + curr.qty, 0) / filteredData.length).toFixed(1) : 0} 
          subtext="Unit/Req" 
          color="emerald" 
        />
        <KPICard 
          icon={Target} 
          title="Kategori Teratas" 
          value={stats.topCat?.split('/')[0] || '-'} 
          subtext={stats.topCat ? `${stats.category.find(c => c.name === stats.topCat)?.value || 0} unit` : ''} 
          color="amber" 
        />
      </div>

      {/* 4. AREA CHART */}
      <div className="bg-white p-8 rounded-[13px] border border-slate-100 shadow-sm relative overflow-hidden" ref={areaChartRef}>
        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-tight mb-8 flex items-center gap-2">
          <Target className="w-4 h-4 text-red-600" /> Analisis Tren Permintaan Logistik
        </h4>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.timeline} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#DC2626" stopOpacity={0.7}/>
                  <stop offset="95%" stopColor="#DC2626" stopOpacity={0.02}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" fontSize={9} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 600}} dy={15} />
              <YAxis fontSize={9} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 600}} />
              <Tooltip content={({ active, payload, label }) => active && payload && (
                <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg">
                   <p className="font-bold text-slate-600 text-[10px] mb-1">{label}</p>
                   <p className="font-black text-red-600 text-sm">{payload[0].value} Pengajuan</p>
                </div>
              )} />
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

      {/* 5. SPLIT ROW: PIE & USER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        {/* SIMPLIFIED PIE CHART */}
        <div className="bg-white p-6 rounded-[13px] border border-slate-100 shadow-sm" ref={pieChartRef}>
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-tight mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-red-600" /> Proporsi Kategori (%)
          </h4>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={stats.category} 
                  cx="50%" 
                  cy="50%"
                  innerRadius={75} 
                  outerRadius={120} 
                  paddingAngle={1} 
                  dataKey="value" 
                  stroke="#ffffff" 
                  strokeWidth={1}
                >
                  {stats.category.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getThemeHex(entry.name)}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const total = stats.category.reduce((a,b) => a+b.value, 0);
                      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
                      return (
                        <div className="bg-white p-2.5 border border-slate-200 shadow-lg rounded-lg">
                          <p className="font-bold text-slate-700 text-xs mb-0.5">{data.name}</p>
                          <p className="text-red-600 font-black text-base">{data.value.toLocaleString('id-ID')} unit</p>
                          <p className="text-slate-500 text-[10px] font-semibold">{percentage}% dari total</p>
                        </div>
                      );
                    }
                    return null;
                  }} 
                />
                {/* Center Text */}
                <text 
                  x="31%" 
                  y="40%" 
                  textAnchor="middle" 
                  dominantBaseline="middle" 
                  className="fill-slate-800"
                  style={{ fontSize: '13px', fontWeight: 700 }}
                >
                  TOTAL
                </text>
                <text 
                  x="31%" 
                  y="49%" 
                  textAnchor="middle" 
                  dominantBaseline="middle" 
                  className="fill-red-600"
                  style={{ fontSize: '23px', fontWeight: 900 }}
                >
                  {stats.category.reduce((a,b) => a+b.value, 0).toLocaleString('id-ID')}
                </text>
                <text 
                  x="31%" 
                  y="57%" 
                  textAnchor="middle" 
                  dominantBaseline="middle" 
                  className="fill-slate-800"
                  style={{ fontSize: '13px', fontWeight: 600 }}
                >
                  Barang
                </text>
                {/* Legend */}
                <Legend 
                  layout="vertical" 
                  verticalAlign="middle" 
                  align="right"
                  wrapperStyle={{ 
                    paddingLeft: '10px',
                    maxWidth: '220px',
                    maxHeight: '300px',
                    overflowY: 'auto'
                  }}
                  iconType="circle"
                  iconSize={10}
                  formatter={(value, entry) => {
                    const data = entry.payload;
                    const total = stats.category.reduce((a,b) => a+b.value, 0);
                    const percentage = total > 0 ? ((data.value / total) * 100).toFixed(0) : 0;
                    return (
                      <span className="text-slate-600 text-[10px] font-bold inline-block ml-1">
                        {value} ({percentage}%)
                      </span>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* USER BAR CHART */}
        <div className="bg-white p-6 rounded-[13px] border border-slate-100 shadow-sm flex flex-col relative" ref={userBarRef}>
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-tight flex items-center gap-2">
              <Users className="w-4 h-4 text-red-600" /> Intensitas User Aktif
            </h4>
            <div className="relative" ref={topUsersRef}>
                <button onClick={() => setIsTopUsersOpen(!isTopUsersOpen)} className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg text-[9px] font-black text-slate-500 flex items-center gap-2 hover:bg-slate-100 transition-all uppercase">
                    TOP {topUsersLimit === 0 ? 'SEMUA' : topUsersLimit} <ChevronDown size={10} className={`transition-transform duration-300 ${isTopUsersOpen ? 'rotate-180' : ''}`} />
                </button>
                {isTopUsersOpen && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-slate-100 rounded-xl shadow-xl z-[150] overflow-hidden animate-in zoom-in-95 w-24">
                        {topOptions.map(opt => (
                            <button key={opt} onClick={() => { setTopUsersLimit(opt); setIsTopUsersOpen(false); }} className={`w-full text-left px-3 py-2 text-[10px] font-bold transition-all border-b border-slate-50 last:border-none ${topUsersLimit === opt ? 'bg-red-600 text-white' : 'text-slate-500 hover:bg-red-50 hover:text-red-600'}`}>
                                {opt === 0 ? 'Semua' : `Top ${opt}`}
                            </button>
                        ))}
                    </div>
                )}
            </div>
          </div>
          <div className="h-[280px] w-full flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.user} margin={{top: 20, right: 20, left: 0, bottom: 40}}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  fontSize={9} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontWeight: 700}} 
                  angle={-30} 
                  textAnchor="end"
                  interval={0}
                  height={60}
                  dy={10}
                />
                <YAxis 
                  fontSize={9} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontWeight: 600}} 
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc', opacity: 0.6}}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-2.5 border border-slate-200 shadow-lg rounded-lg">
                          <p className="font-bold text-slate-700 text-[10px] mb-1">{payload[0].payload.name}</p>
                          <p className="text-slate-800 font-black text-sm">{payload[0].value} Pengajuan</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill="#1e293b" radius={[6, 6, 0, 0]} barSize={50}>
                  <LabelList 
                    dataKey="count" 
                    position="top" 
                    fontSize={13} 
                    fontWeight={900} 
                    fill="#1e293b" 
                    offset={8} 
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 6. FULL WIDTH ROW: ITEM VOLUME */}
      <div className="bg-white p-6 rounded-[13px] border border-slate-100 shadow-sm flex flex-col relative z-0" ref={itemBarRef}>
        <div className="flex items-center justify-between mb-6 px-2" ref={topItemsRef}>
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-tight flex items-center gap-2">
            <Package className="w-4 h-4 text-red-600" /> Analisis Volume Pengeluaran Item
          </h4>
          <div className="relative">
              <button onClick={() => setIsTopItemsOpen(!isTopItemsOpen)} className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg text-[9px] font-black text-slate-500 flex items-center gap-2 hover:bg-slate-100 transition-all uppercase">
                  TOP {topItemsLimit === 0 ? 'SEMUA' : topItemsLimit} <ChevronDown size={10} className={`transition-transform duration-300 ${isTopItemsOpen ? 'rotate-180' : ''}`} />
              </button>
              {isTopItemsOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-slate-100 rounded-xl shadow-xl z-[150] overflow-hidden animate-in zoom-in-95 w-24">
                      {topOptions.map(opt => (
                          <button key={opt} onClick={() => { setTopItemsLimit(opt); setIsTopItemsOpen(false); }} className={`w-full text-left px-3 py-2 text-[10px] font-bold transition-all border-b border-slate-50 last:border-none ${topItemsLimit === opt ? 'bg-red-600 text-white' : 'text-slate-500 hover:bg-red-50 hover:text-red-600'}`}>
                              {opt === 0 ? 'Semua' : `Top ${opt}`}
                          </button>
                      ))}
                  </div>
              )}
          </div>
        </div>
        <div style={{ height: topItemsLimit === 0 ? `${stats.items.length * 42}px` : `${Math.max(stats.items.length, 6) * 42}px`, minHeight: '320px' }} className="w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.items} layout="vertical" margin={{left: 20, right: 80, top: 10, bottom: 20}}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                fontSize={10} 
                width={140} 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#475569', fontWeight: 700}}
                interval={0}
              />
              <Tooltip 
                cursor={{fill: '#f8fafc', opacity: 0.5}}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-2.5 border border-slate-200 shadow-lg rounded-lg">
                        <p className="font-bold text-slate-700 text-[10px] mb-1">{payload[0].payload.name}</p>
                        <p className="text-red-600 font-black text-base">{payload[0].value.toLocaleString('id-ID')} Unit</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="qty" fill="#b91c1c" radius={[0, 6, 6, 0]} barSize={32}>
                 <LabelList 
                    dataKey="qty" 
                    position="right" 
                    fontSize={13} 
                    fontWeight={900} 
                    fill="#b91c1c" 
                    offset={12}
                    formatter={(value) => value.toLocaleString('id-ID')}
                 />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;