// frontend/src/index.js

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import axios from 'axios';
import './App.css';


// If a token is stored, set it on all axios requests
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
