// src/utils/api.js
import axios from 'axios';

// Create an axios instance with base URL
const BACKEND_URL = process.env.VITE_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;