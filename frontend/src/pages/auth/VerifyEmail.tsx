import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

interface VerifyEmailProps {
  setMessage: (msg: string) => void;
  setError: (err: string) => void;
}

const API_BASE_URL = 'http://localhost:8000/api/auth';

const VerifyEmail: React.FC<VerifyEmailProps> = ({ setMessage, setError }) => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  useEffect(() => {
    const verify = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/verify?token=${token}`);
        setMessage(response.data.message);
        setTimeout(() => (window.location.href = '/login'), 2000);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Verification failed');
      }
    };
    verify();
  }, [token, setMessage, setError]);

  return <div className="text-center p-4">Verifying email...</div>;
};

export default VerifyEmail;