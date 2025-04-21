import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { decodeJWT, getToken, clearTokens } from './utils/auth';
import Navbar from './components/Navbar';
import Signup from './pages/auth/Signup';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import AdminDashboard from './pages/dashboard/AdminDashboard';

export interface User {
  id: string;
  roles: string[];
  groups: number[];
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    if (token) {
      const payload = decodeJWT(token);
      if (payload) {
        setUser({ id: payload.sub, roles: payload.roles || [], groups: payload.groups || [] });
      }
    }
  }, []);

  const handleLogout = () => {
    clearTokens();
    setUser(null);
    setMessage('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar user={user} onLogout={handleLogout} />
      <div className="container mx-auto p-4">
        {message && (
          <div className="bg-green-100 text-green-700 p-4 rounded mb-4">{message}</div>
        )}
        {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}
        <Routes>
          <Route path="/signup" element={<Signup setMessage={setMessage} setError={setError} />} />
          <Route
            path="/login"
            element={<Login setUser={setUser} setMessage={setMessage} setError={setError} />}
          />
          <Route
            path="/forgot-password"
            element={<ForgotPassword setMessage={setMessage} setError={setError} />}
          />
          <Route
            path="/reset-password"
            element={<ResetPassword setMessage={setMessage} setError={setError} />}
          />
          <Route
            path="/verify-email"
            element={<VerifyEmail setMessage={setMessage} setError={setError} />}
          />
          <Route
            path="/dashboard"
            element={
              user && user.roles.includes('Admin') ? (
                <AdminDashboard user={user} setMessage={setMessage} setError={setError} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;