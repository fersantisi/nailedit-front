import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const Logout: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const logoutUser = async () => {
      try {
        await fetch(import.meta.env.VITE_SERVER_URL + '/auth/logout', {
          method: 'GET',
          credentials: 'include',
        });
      } catch (error) {
        console.error('Logout failed:', error);
      } finally {
        navigate('/');
      }
    };

    logoutUser();
  }, [navigate]);

  return null;
};
