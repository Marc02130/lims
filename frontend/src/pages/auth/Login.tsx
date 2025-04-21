import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { User } from '../../App';
import { setTokens, decodeJWT } from '../../utils/auth';

interface LoginProps {
  setUser: (user: User | null) => void;
  setMessage: (msg: string) => void;
  setError: (err: string) => void;
}

const API_BASE_URL = 'http://localhost:8000/api/auth';

const Login: React.FC<LoginProps> = ({ setUser, setMessage, setError }) => {
  const [formData, setFormData] = useState({ email: '', password: '', role: '' });
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    if (formData.email) {
      axios
        .get(`${API_BASE_URL}/roles?email=${formData.email}`)
        .then((response) => setRoles(response.data.roles || ['Read-Only']))
        .catch(() => setRoles(['Read-Only']));
    }
  }, [formData.email]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const response = await axios.post(`${API_BASE_URL}/token`, {
        grant_type: 'password',
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      setTokens(response.data.access_token, response.data.refresh_token);
      const payload = decodeJWT(response.data.access_token);
      setUser({
        id: payload.sub,
        roles: payload.roles || [],
        groups: payload.groups || [],
      });
      setMessage('Login successful');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select a role</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Login
        </button>
      </form>
      <p className="mt-4">
        <Link to="/signup" className="text-blue-500">
          Sign Up
        </Link>{' '}
        |{' '}
        <Link to="/forgot-password" className="text-blue-500">
          Forgot Password
        </Link>
      </p>
    </div>
  );
};

export default Login;