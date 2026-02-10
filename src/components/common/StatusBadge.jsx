import React from 'react';

const StatusBadge = ({ status }) => {
  const styles = {
    'Disetujui': 'bg-green-100 text-green-700 border-green-200',
    'Ditolak': 'bg-orange-100 text-orange-700 border-orange-200',
    'Menunggu': 'bg-amber-100 text-amber-700 border-amber-200',
  };
  
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${styles[status]}`}>
      {status}
    </span>
  );
};

export default StatusBadge;