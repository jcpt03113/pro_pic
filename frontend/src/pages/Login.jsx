import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [creds, setCreds] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const nav = useNavigate();

  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('http://127.0.0.1:5000/api/auth/login', creds);
      // Save token & role
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('role', res.data.role);
      // Set axios header
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.access_token}`;
      // Redirect to admin page
      nav('/admin');
    } catch {
      setError('Invalid credentials');
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ maxWidth:300, margin:'2em auto', display:'grid', gap:8 }}>
      <h2>Login</h2>
      <input
        placeholder="Username"
        value={creds.username}
        onChange={e => setCreds({ ...creds, username: e.target.value })}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={creds.password}
        onChange={e => setCreds({ ...creds, password: e.target.value })}
        required
      />
      <button type="submit">Log In</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}
