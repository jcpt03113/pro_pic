// frontend/src/pages/AdminInput.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminInput({ role }) {
  const isAdmin = role === 'admin';

  // Attach JWT to every request
  const token = localStorage.getItem('token');
  if (token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  }

  // ─── State ───────────────────────────────────────────────────────────────────
  const [filters, setFilters] = useState({
    supplier: '',
    product_code: '',
    variant: '',
  });
  const [form, setForm] = useState({
    supplier: '',
    product_code: '',
    variant: '',
    cost: '',
    remark: '',
    proposed_selling_price: '',
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [bulkFile, setBulkFile] = useState(null);
  const [products, setProducts] = useState([]);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState('');

  // ─── Load Products via user endpoint ──────────────────────────────────────────
  const loadProducts = async (qry = {}) => {
    try {
      const res = await axios.get(
        'http://127.0.0.1:5000/api/user/products',
        { params: qry }
      );
      setProducts(res.data);
    } catch {
      setMessage('Failed to load products');
    }
  };

  useEffect(() => {
    loadProducts(filters);
  }, [filters]);

  // ─── Handlers ─────────────────────────────────────────────────────────────────
  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handleImages = e => setImageFiles(Array.from(e.target.files) || []);

  const resetForm = () => {
    setEditId(null);
    setForm({
      supplier: '',
      product_code: '',
      variant: '',
      cost: '',
      remark: '',
      proposed_selling_price: '',
    });
    setImageFiles([]);
    setMessage('');
  };

  const onSubmit = async e => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    imageFiles.forEach(f => data.append('images', f));

    try {
      const url = editId
        ? `http://127.0.0.1:5000/api/admin/products/${editId}`
        : 'http://127.0.0.1:5000/api/admin/products';
      const method = editId ? 'put' : 'post';
      const res = await axios[method](url, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage(`${editId ? 'Updated' : 'Created'} id=${res.data.id}`);
      resetForm();
      loadProducts(filters);
    } catch (err) {
      setMessage(`Error: ${err.response?.data?.error || err.message}`);
    }
  };

  const onEdit = p => {
    setEditId(p.id);
    setForm({
      supplier: p.supplier,
      product_code: p.product_code,
      variant: p.variant || '',
      cost: p.cost,
      remark: p.remark || '',
      proposed_selling_price: p.proposed_selling_price,
    });
    setImageFiles([]);
    window.scrollTo(0, 0);
  };

  const onDelete = async id => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await axios.delete(
        `http://127.0.0.1:5000/api/admin/products/${id}`
      );
      setMessage(`Deleted id=${id}`);
    } catch (err) {
      console.error('DELETE error:', err.response || err);
      setMessage(`Delete failed (status: ${err.response?.status})`);
    } finally {
      loadProducts(filters);
      if (editId === id) resetForm();
    }
  };

  const onBulkUpload = async e => {
    e.preventDefault();
    if (!bulkFile) return setMessage('Select an Excel file first');
    const data = new FormData();
    data.append('file', bulkFile);

    try {
      const res = await axios.post(
        'http://127.0.0.1:5000/api/admin/products/bulk-upload',
        data,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      const created = res.data.created ?? 0;
      const skipped = res.data.skipped_duplicates ?? 0;
      setMessage(`Bulk upload complete: created ${created}, skipped ${skipped}`);
      setBulkFile(null);
      loadProducts(filters);
    } catch (err) {
      setMessage(`Bulk error: ${err.response?.data?.error || err.message}`);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 1000, margin: '1em auto', padding: '0 1em' }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.5em 1em',
        borderBottom: '2px solid #dce1e3',
        marginBottom: '1em',
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', flex: 1, textAlign: 'center' }}>
          ÄNZ Product Database
        </h1>
        <img
          src="/anz-logo.png"
          alt="ANZ Logo"
          style={{ height: 80, objectFit: 'contain' }}
        />
      </header>

      {/* Logout */}
      <button

        style={{ float: 'right', margin: '0.5em 0' }}
        onClick={() => {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          window.location.href = '/login';
        }}
      >
        Logout
      </button>

      {/* SIMPLE STATUS MESSAGE */}
        {message && (
          <div style={{ color: 'red', margin: '1em 0' }}>
            {message}
          </div>
        )}

      {/* Top Row: Search & Add/Edit */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
        {/* Search */}
        <div style={{ flex: 1, padding: 16, border: '1px solid #ddd', borderRadius: 4 }}>
          <h3>Search Products</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              name="supplier"
              placeholder="Supplier"
              value={filters.supplier}
              onChange={e => setFilters(f => ({ ...f, supplier: e.target.value }))}
            />
            <input
              name="product_code"
              placeholder="Product Code"
              value={filters.product_code}
              onChange={e => setFilters(f => ({ ...f, product_code: e.target.value }))}
            />
            <input
              name="variant"
              placeholder="Variant"
              value={filters.variant}
              onChange={e => setFilters(f => ({ ...f, variant: e.target.value }))}
            />
            <div style={{ marginTop: 8 }}>
              <button onClick={() => loadProducts(filters)}>Search</button>
              <button
                style={{ marginLeft: 8 }}
                onClick={() => {
                  setFilters({ supplier: '', product_code: '', variant: '' });
                  loadProducts({});
                }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Add/Edit */}
        {isAdmin && (
          <div style={{ flex: 1, padding: 16, border: '1px solid #ddd', borderRadius: 4 }}>
            <h3>{editId ? 'Edit' : 'Add'} Product</h3>
            <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8 }}>
              {[
                ['supplier', 'Supplier'],
                ['product_code', 'Product Code'],
                ['variant', 'Variant'],
                ['cost', 'Cost', 'number'],
                ['proposed_selling_price', 'Proposed Price', 'number'],
              ].map(([name, placeholder, type]) => (
                <input
                  key={name}
                  name={name}
                  placeholder={placeholder}
                  type={type || 'text'}
                  value={form[name]}
                  onChange={handleChange}
                  required={['supplier', 'product_code', 'cost'].includes(name)}
                />
              ))}
              <textarea
                name="remark"
                placeholder="Remark"
                value={form.remark}
                onChange={handleChange}
              />
              <label style={{ fontSize: '.9rem' }}>
                Images:
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImages}
                  style={{ display: 'block', marginTop: 4 }}
                />
              </label>
              <div>
                <button type="submit">{editId ? 'Update' : 'Save'}</button>
                {editId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    style={{ marginLeft: 8 }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Bulk Upload */}
      {isAdmin && (
        <section
          style={{
            padding: 16,
            border: '1px solid #ddd',
            borderRadius: 4,
            marginBottom: 32,
          }}
        >
          <h3>Bulk Upload</h3>
          <form
            onSubmit={onBulkUpload}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <input
              type="file"
              accept=".xlsx"
              onChange={e => setBulkFile(e.target.files[0])}
            />
            <button type="submit">Upload Excel</button>
          </form>
        </section>
      )}

      {/* Product Table */}
      <h2>All Products</h2>
      <table
        border="1"
        cellPadding="6"
        style={{ width: '100%', borderCollapse: 'collapse' }}
      >
        <thead>
          <tr>
            {[
              'ID',
              'Supplier',
              'Code',
              'Variant',
              ...(isAdmin ? ['Cost'] : []),
              'Remark',
              'Proposed',
              'Images',
              ...(isAdmin ? ['Actions'] : []),
              'Updated',
            ].map(h => (
              <th
                key={h}
                style={{
                  whiteSpace: 'normal',
                  wordWrap: 'break-word',
                  background: '#f0f0f0',
                  color: '#222',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.supplier}</td>
              <td>{p.product_code}</td>
              <td>{p.variant}</td>
              {isAdmin && <td>{p.cost}</td>}
              <td>{p.remark}</td>
              <td>{p.proposed_selling_price}</td>
              <td style={{ textAlign: 'center' }}>
                {p.image_urls?.length ? (
                  p.image_urls.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={url}
                        alt={`img-${p.id}-${i}`}
                        style={{
                          width: 40,
                          height: 40,
                          objectFit: 'cover',
                          marginRight: 4,
                        }}
                      />
                    </a>
                  ))
                ) : (
                  '—'
                )}
              </td>
              {isAdmin && (
                <td>
                  <button onClick={() => onEdit(p)}>Edit</button>
                  <button
                    onClick={() => onDelete(p.id)}
                    style={{ marginLeft: 4 }}
                  >
                    Delete
                  </button>
                </td>
              )}
              <td>{new Date(p.date_updated).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
