console.log("VITE_BACKEND_URL:", import.meta.env.VITE_BACKEND_URL);
console.log("ENV MODE:", import.meta.env.MODE);
console.log("IS DEV:", import.meta.env.DEV);

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  (import.meta.env.DEV ? "http://localhost:5000" : "");

console.log("Backend URL in use:", BACKEND_URL);

// src/utils/api.js
import axios from 'axios';

// Create an axios instance with base URL
// const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;