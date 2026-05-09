const raw = (process.env.REACT_APP_API_BASE_URL || '').trim();

export const API_BASE_URL = (() => {
  if (raw.length > 0) return raw.replace(/\/$/, '');
  
  // Yahan apna backend address likhen
  if (process.env.NODE_ENV === 'development') {
    return 'http://192.168.100.10:8000'; 
  }
  return '';
})();