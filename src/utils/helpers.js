export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

export const generateRequestId = (requestsLength) => {
  return `REQ-0${requestsLength + 10}`;
};

export const getCurrentDate = () => {
  return new Date().toISOString().split('T')[0];
};