import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface ForgotPasswordProps {
  setMessage: (msg: string) => void;
  setError: (err: string) => void;
}

const API_BASE_URL = 'http://localhost:8000/api/auth';

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ setMessage, setError }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const response = await axios.post(`${API_BASE_URL}/forgot-password`, { email });
      setMessage(response.data.message);
      setEmail('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send reset link');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Send Reset Link
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

export default ForgotPassword;