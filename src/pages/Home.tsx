import { Box, Container } from '@mui/material';
import { Navbar } from '../components/ui/navbar';
import { HomeTopSection } from '../components/home/HomeTopSection';
import { HomeBottomSection } from '../components/home/HomeBottomSection';
import { HomeGuest } from '../components/home/HomeGuest';
import { useEffect, useState } from 'react';
import { User } from '../types';

export const Home = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        Loading...
      </Box>
    );
  }

  return (
    <>
      <Navbar user={user} />
      {user ? (
        <Container
          maxWidth={false}
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            pt: { xs: 2, sm: 3, md: 4 },
            pb: '80px',
            px: { xs: 2, sm: 3, md: 4 },
            gap: 3,
          }}
        >
          <HomeTopSection />
          <HomeBottomSection />
        </Container>
      ) : (
        <HomeGuest />
      )}
    </>
  );
};
