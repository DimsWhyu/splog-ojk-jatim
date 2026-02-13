import React, { useState, useEffect } from 'react';
import { AlertCircle, FileText, Eye, X, Hash, Package } from 'lucide-react';
import * as XLSX from 'xlsx';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import Footer from './components/common/Footer'; 
import CatalogView from './components/user/CatalogView';
import CartView from './components/user/CartView';
import DashboardView from './components/admin/DashboardView';
import InventoryView from './components/admin/InventoryView';
import AddItemView from './components/admin/AddItemView';
import CreateUserView from './components/admin/CreateUserView';
import LoginView from './components/common/LoginView'; 
import { CartProvider, useCart } from './context/CartContext';
import './App.css';

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxjamHFtqzag-LYmT_Yh4AIfjAI156KSpuGVQGbXGbmgevVttXprl77mmGrqigO7nbW/exec";

const INITIAL_REQUESTS = [];

const generateRequestId = (requestsLength) => `REQ-0${requestsLength + 115}`;
const getCurrentDate = () => {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const AppContent = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [validUsers, setValidUsers] = useState([]); 

  const [role, setRole] = useState('user');
  const [view, setView] = useState('catalog');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [inventory, setInventory] = useState([]); 
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [addAmounts, setAddAmounts] = useState({}); 
  const [isLoading, setIsLoading] = useState(true);
  const [warning, setWarning] = useState({ show: false, message: "" });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [cancelModal, setCancelModal] = useState({ show: false, request: null });

  // --- PENYESUAIAN 1: STATE UNTUK DRAWER MOBILE ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (selectedRequest || cancelModal.show || warning.show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedRequest, cancelModal.show, warning.show]);

  const { cart, clearCart, addToCart: addToCartContext, updateCartQty, getCartItem } = useCart();
  
  // --- REVISI: FUNGSI fetchAllData UNTUK SINKRONISASI RIWAYAT ---
  const fetchAllData = async (isSilent = false) => {
      // Hanya tampilkan loading jika bukan update otomatis (silent)
      if (!isSilent) setIsLoading(true); 

      try {
        const response = await fetch(WEB_APP_URL); 
        const data = await response.json(); 
        
        setValidUsers(data.users || []);
        const formattedInventory = (data.inventory || []).map(item => ({
          ...item, 
          stock: Number(item.stock) || 0
        }));
        setInventory(formattedInventory);

        if (data.history) {
          const formattedHistory = data.history.map(h => {
            const summaryStr = h.detailbarang || h["detailbarang"] || "";
            
            const itemsDetailArray = summaryStr.split(', ').map(part => {
              const match = part.match(/(.+) \((\d+)\)/);
              if (!match) return null;
              const itemName = match[1].trim(); 
              const itemQty = parseInt(match[2]);
              const originalItem = formattedInventory.find(inv => inv.name === itemName);
              return {
                id: originalItem ? originalItem.id : '', 
                name: itemName,
                quantity: itemQty,
                image: originalItem ? originalItem.image : '',
                unit: originalItem ? originalItem.unit : 'Pcs',
                category: originalItem ? originalItem.category : 'Logistik'
              };
            }).filter(Boolean);

            return {
              id: h.noreferensi || h["noreferensi"], 
              user: h.namapengaju || h["namapengaju"], 
              date: h.tanggalpengajuan || h.tanggal || h["tanggal"], 
              note: h.tujuankebutuhan || h.tujuan || h["tujuan"], 
              status: h.statusverifikasi || h.status || h["status"], 
              itemsDetail: itemsDetailArray 
            };
          });
          setRequests(formattedHistory);
        }

        const savedUser = localStorage.getItem('splog_session');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          const user = (data.users || []).find(u => String(u.username) === userData.username);
          if (user) {
            setIsLoggedIn(true); 
            setCurrentUser(user); 
            setRole(user.role);
            setView(user.role === 'admin' ? 'dashboard' : 'catalog');
          }
        }
      } catch (error) { 
        console.error("Gagal sinkronisasi data riwayat:", error); 
      } finally { 
        // Tutup loading hanya jika pemicunya bukan update otomatis
        if (!isSilent) {
          setTimeout(() => setIsLoading(false), 2500); 
        }
      }
  };

  useEffect(() => {
    // 1. Jalankan fetch pertama kali saat web dibuka
    fetchAllData();

    /* 2. Set Interval untuk sinkronisasi otomatis (Real-time Polling)
      Rekomendasi: 30000ms (30 detik) agar tidak terkena limit kuota Google
    */
    const autoSync = setInterval(() => {
      console.log("Menyinkronkan data dengan Spreadsheet...");
      
      // Gunakan flag 'silent' agar tidak memunculkan loading spinner yang mengganggu user
      fetchAllData(true); 
    }, 1000); 

    // 3. Bersihkan interval saat web ditutup untuk mencegah memory leak
    return () => clearInterval(autoSync);
  }, []);

  const handleLogin = (username, password, rememberMe) => {
    if (!validUsers || validUsers.length === 0) return false;
    const user = validUsers.find(u => 
      String(u.username).trim().toLowerCase() === String(username).trim().toLowerCase() && 
      String(u.password).trim() === String(password).trim()
    );
    if (user) {
      if (rememberMe) localStorage.setItem('splog_session', JSON.stringify({ username: user.username }));
      setIsLoggedIn(true); setCurrentUser(user); setRole(user.role);
      setView(user.role === 'admin' ? 'dashboard' : 'catalog');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    localStorage.removeItem('splog_session');
    clearCart(); setIsLoggedIn(false); setCurrentUser(null);
  };

  const handleUpdateQuantity = (item, newQty) => {
    const cartItem = getCartItem(item.id);
    const currentCartQty = cartItem ? cartItem.quantity : 0;
    const delta = newQty - currentCartQty;
    if (item.stock - delta < 0) {
      setWarning({ show: true, message: `Maaf, stok untuk "${item.name}" tidak mencukupi.` });
      return;
    }
    setInventory(prev => prev.map(i => i.id === item.id ? { ...i, stock: i.stock - delta } : i));
    if (currentCartQty === 0 && newQty > 0) {
      addToCartContext(item);
      if (newQty > 1) updateCartQty(item.id, newQty - 1);
    } else {
      updateCartQty(item.id, delta);
    }
  };

  const handleAddAmountChange = (id, value) => setAddAmounts({ ...addAmounts, [id]: value });
  
  const validateStockAddition = async (id, amountStr) => {
    const amount = parseInt(amountStr);
    if (isNaN(amount) || amount === 0) return;
    const itemToUpdate = inventory.find(i => i.id === id);
    if (!itemToUpdate) return;
    const newStockCount = Math.max(0, itemToUpdate.stock + amount);
    setInventory(prev => prev.map(item => item.id === id ? { ...item, stock: newStockCount } : item));
    try {
      fetch(WEB_APP_URL, {
        method: "POST", mode: "no-cors", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateStock", id: id, newStock: newStockCount })
      });
    } catch (error) { console.error("Gagal update:", error); }
    setAddAmounts(prev => { const updated = { ...prev }; delete updated[id]; return updated; });
  };

  const handleUpdateItem = async (updatedItem) => {
    setInventory(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    try {
      fetch(WEB_APP_URL, {
        method: "POST", mode: "no-cors",
        body: JSON.stringify({ action: "editItem", ...updatedItem })
      });
    } catch (error) { console.error("Update error:", error); }
  };

  const handleDeleteItem = async (id) => {
    setInventory(prev => prev.filter(item => item.id !== id));
    try {
      fetch(WEB_APP_URL, {
        method: "POST", mode: "no-cors",
        body: JSON.stringify({ action: "deleteItem", id: id })
      });
    } catch (error) { console.error("Delete error:", error); }
  };

  const handleAddItem = async (newItem) => {
    try {
      // 1. Kirim data (image berisi Base64 dari input URL) ke Apps Script
      await fetch(WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "addItem", 
          ...newItem // Di sini imageUrl akan diproses oleh macro.gs menjadi Link Drive
        }),
      });

      // 2. Berikan feedback instan di layar
      setInventory(prev => [...prev, newItem]);
      
      // 3. PENTING: Tunggu 3 detik agar Google Drive selesai memproses file, 
      // lalu ambil data terbaru untuk mengganti Base64 dengan URL asli yang ringan
      setTimeout(() => fetchAllData(), 3000); 

      return true;
    } catch (error) {
      console.error("Gagal menyimpan barang:", error);
      return false;
    }
  };

  const handleCheckout = (noteFromCart) => {
    const safeNote = (typeof noteFromCart === 'string') ? noteFromCart : 'Pengajuan via SPLOG Web';
    const newRequest = {
      id: generateRequestId(requests.length),
      user: currentUser?.name || 'User',
      date: getCurrentDate(),
      itemsDetail: [...cart],
      items: cart.reduce((acc, curr) => acc + curr.quantity, 0),
      status: 'Menunggu',
      note: safeNote
    };
    setRequests([newRequest, ...requests]); 
    clearCart(); setView('history'); 
    fetch(WEB_APP_URL, {
      method: "POST", mode: "no-cors",
      body: JSON.stringify({
        action: "bulkUpdateStock",
        id: newRequest.id, user: newRequest.user, date: newRequest.date, 
        note: newRequest.note, cartItems: cart.map(item => ({ id: item.id, quantity: item.quantity })),
        itemsDetail: cart       
      })
    });
  };

  const handleApproval = async (id, status) => {
    setRequests(prevRequests => prevRequests.map(r => r.id === id ? { ...r, status } : r));
    const targetReq = requests.find(r => r.id === id);
    if (!targetReq) return;
    if (status === 'Ditolak' || status === 'Dibatalkan') {
      try {
        setInventory(prevInv => prevInv.map(invItem => {
          const returnedItem = targetReq.itemsDetail.find(c => c.id === invItem.id);
          return returnedItem ? { ...invItem, stock: invItem.stock + returnedItem.quantity } : invItem;
        }));
      } catch (error) { console.error("Gagal update stok lokal:", error); }
    }
    try {
      const actionMap = { 'Disetujui': 'approveRequest', 'Ditolak': 'rejectRequest', 'Dibatalkan': 'cancelRequest' };
      fetch(WEB_APP_URL, {
        method: "POST", mode: "no-cors",
        body: JSON.stringify({ action: actionMap[status] || 'approveRequest', ...targetReq, status: status })
      });
    } catch (error) { console.error(`Gagal mencatat status ${status}:`, error); }
  };

  const handleCancel = (req) => { setCancelModal({ show: true, request: req }); };

  const confirmCancelRequest = () => {
    if (cancelModal.request) {
      handleApproval(cancelModal.request.id, 'Dibatalkan');
      setCancelModal({ show: false, request: null });
    }
  };

  const downloadXLSX = (req) => {
    const dataToExport = req.itemsDetail.map(item => ({
      "No. Referensi": req.id, "Tanggal Pengajuan": req.date, "Nama Barang": item.name, 
      "Jumlah": item.quantity, "Satuan": item.unit, "Tujuan Kebutuhan": req.note
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Detail");
    XLSX.writeFile(workbook, `SPLOG_${req.id}.xlsx`);
  };

  const filteredItems = inventory.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'Semua' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[999] bg-batik-ojk flex items-center justify-center overflow-hidden">
        <img src="https://upload.wikimedia.org/wikipedia/commons/8/83/OJK_Logo.png" alt="OJK" className="h-28 w-auto animate-pulse" />
      </div>
    );
  }

  if (!isLoggedIn) return <LoginView onLogin={handleLogin} />;

  return (
    <div className="min-h-screen flex flex-col bg-batik-ojk font-sans text-slate-800 animate-content-fade">
      {/* UPDATE: Kirim state drawer ke Navbar */}
      <Navbar 
        role={role} 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        setView={setView} 
        inventory={inventory}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <div className="flex-1 max-w-[1440px] mx-auto px-4 lg:px-10 py-8 flex gap-10 w-full items-start relative">
        {/* UPDATE: Kirim state drawer ke Sidebar */}
        <Sidebar 
          role={role} 
          view={view} 
          setView={setView} 
          isOpen={isSidebarOpen} 
          setIsOpen={setIsSidebarOpen}
          onLogout={handleLogout}
          currentUser={currentUser}
        />
        <main className="flex-1 min-w-0">
          {role === 'user' && view === 'catalog' && <CatalogView inventory={inventory} filteredItems={filteredItems} activeCategory={activeCategory} setActiveCategory={setActiveCategory} handleUpdateQuantity={handleUpdateQuantity} />}
          {role === 'user' && view === 'cart' && <CartView setView={setView} handleCheckout={handleCheckout} inventory={inventory} handleUpdateQuantity={handleUpdateQuantity}/>}
          {role === 'user' && view === 'history' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Riwayat Pengajuan</h3>
              
              {/* --- REVISI: Tambahkan max-h dan overflow-y agar bisa di-scroll --- */}
              <div className="bg-white rounded-[17px] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden relative">
                <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    
                    {/* --- REVISI: Tambahkan sticky top-0 dan warna bg-slate-800 (OJK Style) --- */}
                    <thead className="sticky top-0 z-20 bg-slate-800 text-white text-[13px] font-black shadow-md">
                      <tr>
                        <th className="px-6 py-5 border-b border-slate-700">No. Referensi</th>
                        <th className="px-6 py-5 border-b border-slate-700">Tanggal Pengajuan</th>
                        <th className="px-6 py-5 border-b border-slate-700">Tujuan Kebutuhan</th>
                        <th className="px-6 py-5 border-b border-slate-700 text-center">Status</th>
                        <th className="px-6 py-5 border-b border-slate-700 text-center">Aksi</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-50">
                      {requests
                        .filter(req => req.user === currentUser?.name)
                        .reverse()
                        .map(req => (
                          <tr key={req.id} className="hover:bg-red-50/20 transition-all duration-300 group">
                            <td className="px-6 py-6 font-black text-slate-800 group-hover:text-red-600 transition-colors">{req.id}</td>
                            <td className="px-6 py-6 text-sm text-slate-500 font-medium">{req.date}</td>
                            <td className="px-6 py-6 text-sm text-slate-600 font-medium italic truncate max-w-[250px]">"{req.note}"</td>
                            <td className="px-6 py-6 text-center">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${req.status === 'Disetujui' ? 'bg-green-50 text-green-600 border-green-100' : req.status === 'Ditolak' || req.status === 'Dibatalkan' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>{req.status}</span>
                            </td>
                            <td className="px-6 py-6 text-center flex justify-center gap-2">
                              <button onClick={() => setSelectedRequest(req)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"><Eye className="w-4 h-4" /></button>
                              <button onClick={() => downloadXLSX(req)} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all"><FileText className="w-4 h-4" /></button>
                              {req.status === 'Menunggu' && <button onClick={() => handleCancel(req)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"><X className="w-4 h-4" /></button>}
                            </td>
                          </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          {role === 'admin' && view === 'dashboard' && <DashboardView requests={requests} inventory={inventory} handleApproval={handleApproval} onViewDetails={setSelectedRequest}/>}
          {role === 'admin' && view === 'admin-inventory' && <InventoryView inventory={inventory} addAmounts={addAmounts} handleAddAmountChange={handleAddAmountChange} validateStockAddition={validateStockAddition} handleUpdateItem={handleUpdateItem} handleDeleteItem={handleDeleteItem} />}
          
          {/* REVISI 3: Render View Baru */}
          {role === 'admin' && view === 'add-item' && (
            <AddItemView inventory={inventory} onAddItem={handleAddItem} onCancel={() => setView('admin-inventory')} />
          )}

          {role === 'admin' && view === 'manage-users' && <CreateUserView validUsers={validUsers} WEB_APP_URL={WEB_APP_URL} fetchAllData={fetchAllData} />}
        </main>
      </div>

      {selectedRequest && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in" onClick={() => setSelectedRequest(null)}></div>
          <div className="relative bg-white rounded-[17px] shadow-2xl w-full max-w-2xl overflow-hidden animate-modal-pop border border-white/20">
            <div className="bg-gradient-to-r from-red-600 to-[#4a0404] p-8 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black tracking-tighter uppercase">🗃️ Detail Pengajuan Item</h3>
                  <p className="text-red-100/70 text-xs font-bold tracking-widest mt-1">{selectedRequest.id} • {selectedRequest.date}</p>
                </div>
                <button onClick={() => setSelectedRequest(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><X className="w-6 h-6" /></button>
              </div>
            </div>
            <div className="p-8 max-h-[50vh] overflow-y-auto custom-scrollbar space-y-4">
              {selectedRequest.itemsDetail.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-5 bg-slate-50 rounded-[24px] border border-slate-100 group hover:border-red-100 transition-all">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl overflow-hidden p-1 shadow-sm">
                      <img src={item.image} alt="" className="w-full h-full object-cover rounded-xl" />
                    </div>
                    <div>
                      <span className="text-sm font-black text-slate-800 block tracking-tight">{item.name}</span>
                      <div className="flex items-center gap-1.5 mt-1 text-slate-400">
                        <Package className="w-3 h-3 text-red-500" />
                        <span className="text-[10px] font-black tracking-widest text-slate-500">{item.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-red-600 leading-none">{item.quantity}</span>
                    <span className="text-[10px] font-bold text-slate-400 block tracking-widest mt-1">{item.unit}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-8 bg-slate-50 border-t border-slate-100">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex-shrink-0">
                  <Hash className="w-4 h-4 text-red-600" />
                </div>
                {/* REVISI: Tambahkan flex-1 dan min-w-0 agar container bisa mengecil */}
                <div className="flex-1 min-w-0"> 
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Tujuan / Justifikasi Pengajuan:
                  </p>
                  {/* REVISI: Tambahkan break-words dan whitespace-pre-wrap */}
                  <p className="text-sm font-bold text-slate-600 italic leading-relaxed break-words whitespace-pre-wrap">
                    "{selectedRequest.note || "Tanpa Catatan"}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {warning.show && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 text-center">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setWarning({ ...warning, show: false })}></div>
          <div className="relative bg-white rounded-[17px] shadow-2xl p-10 max-w-sm w-full animate-modal-pop">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6"><AlertCircle className="w-10 h-10 text-red-600" /></div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Stok Terbatas</h3>
            <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">{warning.message}</p>
            <button onClick={() => setWarning({ ...warning, show: false })} className="w-full py-4 bg-red-600 text-white font-black rounded-2xl active:scale-95 transition-all uppercase text-[11px] tracking-widest">Oke, Mengerti</button>
          </div>
        </div>
      )}

      {cancelModal.show && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in" onClick={() => setCancelModal({ show: false, request: null })}></div>
          <div className="relative bg-white rounded-[17px] shadow-2xl p-10 max-w-md w-full animate-modal-pop text-center">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6"><AlertCircle className="w-12 h-12 text-red-600 animate-pulse" /></div>
            <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">Konfirmasi Batal</h3>
            <p className="text-sm font-medium text-slate-500 leading-relaxed px-2">Apakah Anda yakin ingin membatalkan pengajuan <span className="text-red-600 font-bold">{cancelModal.request?.id}</span>? <br /><span className="italic font-bold text-slate-400 text-xs mt-2 block">*Stok barang akan otomatis dikembalikan ke gudang.</span></p>
            <div className="grid grid-cols-2 gap-4 mt-10">
              <button onClick={() => setCancelModal({ show: false, request: null })} className="py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all text-[12px] uppercase tracking-tight">Kembali</button>
              <button onClick={confirmCancelRequest} className="py-4 bg-gradient-to-r from-red-600 to-[#4a0404] text-white font-black rounded-2xl shadow-xl shadow-red-200 transition-all text-[12px] uppercase tracking-tight">Ya, Batalkan</button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
      {}
    </div>
  );
};

function App() { return (<CartProvider><AppContent /></CartProvider>); }
export default App;