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
      try {
        const meResponse = await fetch(
          import.meta.env.VITE_SERVER_URL + '/users/me',
          {
            method: 'GET',
            credentials: 'include',
          }
        );

        if (!meResponse.ok) {
          setUser(null);
          return;
        }

        const meData = await meResponse.json();
        console.log('meData', meData);
        
        const userId = meData.userId;
        
        const profileResponse = await fetch(
          import.meta.env.VITE_SERVER_URL + `/users/profile/${userId}`,
          {
            method: 'GET',
            credentials: 'include',
          }
        );

        if (profileResponse.ok) {
          const userData = await profileResponse.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
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
