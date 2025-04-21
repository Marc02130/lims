import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';

interface ResetPasswordProps {
  setMessage: (msg: string) => void;
  setError: (err: string) => void;
}

const API_BASE_URL = 'http://localhost:8000/api/auth';

const ResetPassword: React.FC<ResetPasswordProps> = ({ setMessage, setError }) => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [newPassword, setNewPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const response = await axios.post(`${API_BASE_URL}/reset-password?token=${token}`, {
        new_password: newPassword,
      });
      setMessage(response.data.message);
      setNewPassword('');
      setTimeout(() => (window.location.href = '/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Password reset failed');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Reset Password
        </button>
      </form>
      <p className="mt-4">
        <Link to="/login" className="text-blue-500">
          Back to Login
        </Link>
      </p>
    </div>
  );
};

export default ResetPassword;