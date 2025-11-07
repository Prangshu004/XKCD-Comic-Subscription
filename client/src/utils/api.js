// src/utils/api.js
import axios from 'axios';

// Create an axios instance with base URL
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;