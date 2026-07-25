const API_URL = import.meta.env.VITE_API_URL || (
  window.location.hostname === "localhost" 
    ? "http://localhost:5000" 
    : window.location.origin
);

export default API_URL;
