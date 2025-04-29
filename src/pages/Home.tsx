import { Box } from '@mui/material';
import { Navbar } from '../components/ui/navbar';
import { HomeTopSection } from '../components/home/HomeTopSection';
import { HomeBottomSection } from '../components/home/HomeBottomSection';
import { HomeGuest } from '../components/home/HomeGuest';
import { useEffect, useState } from 'react';
import { User } from '../types';

export const Home = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch(
        import.meta.env.VITE_SERVER_URL + '/users/profile/2',
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  return (
    <>
      {user ? (
        <Box
          sx={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            pt: '170px',
            px: '15px',
            width: '100%',
            gap: '20px',
            overflow: 'hidden',
          }}
        >
          <HomeTopSection />
          <HomeBottomSection />
        </Box>
      ) : (
        <HomeGuest />
      )}
      <Navbar user={user} />
    </>
  );
};
