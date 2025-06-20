// frontend/src/pages/SearchPage.jsx
import React, { useState } from 'react';
import axios from 'axios';

export default function SearchPage() {
  const [filters, setFilters] = useState({ supplier: '', product_code: '', variant: '' });
  const [results, setResults] = useState([]);

  const handleChange = e => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const doSearch = async () => {
    const params = new URLSearchParams(filters);
    const res = await axios.get(`http://127.0.0.1:5000/api/user/products?${params}`);
    setResults(res.data);
  };

  const exportExcel = () => {
    const params = new URLSearchParams(filters);
    window.location = `http://127.0.0.1:5000/api/user/products/export?${params}`;
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <h2>Search Products</h2>
      <div style={{ display:'flex', gap:8, marginBottom:16 }}>
        <input name="supplier" placeholder="Supplier" onChange={handleChange} />
        <input name="product_code" placeholder="Code" onChange={handleChange} />
        <input name="variant" placeholder="Variant" onChange={handleChange} />
        <button onClick={doSearch}>Search</button>
      </div>

      <button onClick={exportExcel}>Export to Excel</button>

      <table border="1" cellPadding="4" style={{ width:'100%', marginTop:16 }}>
        <thead>
          <tr>
            {['Supplier','Code','Variant','Cost','Updated','Remark','Proposed','Image'].map(h => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {results.map(r => (
            <tr key={r.id}>
              <td>{r.supplier}</td>
              <td>{r.product_code}</td>
              <td>{r.variant}</td>
              <td>{r.cost}</td>
              <td>{new Date(r.date_updated).toLocaleString()}</td>
              <td>{r.remark}</td>
              <td>{r.proposed_selling_price}</td>
              <td>
                {r.image_url && <img src={r.image_url} alt="" width={50} />}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
