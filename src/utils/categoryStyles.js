export const getCategoryStyles = (category) => {
  const styles = {
    // ATK menggunakan skema warna Biru Muda
    'ATK': 'bg-blue-50 text-blue-600 border-blue-100',
    
    // Logistik menggunakan skema warna Orange Muda
    'Logistik': 'bg-orange-50 text-orange-600 border-orange-100',
  };

  // Mengembalikan style sesuai kategori, atau default slate jika tidak ditemukan
  return styles[category] || 'bg-slate-50 text-slate-500 border-slate-100';
};