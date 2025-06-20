import React, { useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import Login from './pages/Login';
import AdminInput from './pages/AdminInput';

function RequireAuth({ children, token }) {
  const location = useLocation();
  if (!token) {
    // If no token, redirect to /login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function App() {
  const token = localStorage.getItem('token');
  const role  = localStorage.getItem('role');

  return (
    <BrowserRouter>
      <Routes>
        {/* Root always goes to login first */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login page */}
        <Route path="/login" element={<Login />} />

        {/* Protected admin page */}
        <Route
          path="/admin"
          element={
            <RequireAuth token={token}>
              <AdminInput role={role} />
            </RequireAuth>
          }
        />

        {/* Catch-all: send everything else to /login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
