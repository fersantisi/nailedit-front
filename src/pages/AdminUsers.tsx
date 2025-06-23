import { Box, Container } from '@mui/material';
import { Navbar } from '../components/ui/navbar';
import { HomeGuest } from '../components/home/HomeGuest';
import { UserTable } from '../components/admin/UserTable';
import { useEffect, useState } from 'react';
import { User } from '../types';

export const AdminUsers = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const meResponse = await fetch(
          import.meta.env.VITE_SERVER_URL + '/admin/me',
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

        console.log('userId', userId);

        const profileResponse = await fetch(
          import.meta.env.VITE_SERVER_URL + `/admin/profile/${userId}`,
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
      <Navbar user={user} isAdmin={true} />
      {user ? (
        <Container
          maxWidth={false}
          sx={{
            pt: 3,
            pb: '80px',
            px: { xs: 2, sm: 3, md: 4 },
            minHeight: 'calc(100vh - 70px)',
            overflow: 'hidden',
            overflowX: 'hidden',
          }}
        >
          <UserTable />
        </Container>
      ) : (
        <HomeGuest />
      )}
    </>
  );
};
