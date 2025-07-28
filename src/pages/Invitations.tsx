import React from 'react';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Navbar } from '../components/ui/navbar';
import { ReceivedInvitationsSection } from '../components/invitations/ReceivedInvitationsSection';
import { SentInvitationsSection } from '../components/invitations/SentInvitationsSection';
import { useEffect, useState } from 'react';
import { User } from '../types';
import { useNavigate } from 'react-router-dom';

export const Invitations = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch current user session
        const meResponse = await fetch(
          import.meta.env.VITE_SERVER_URL + '/users/me',
          {
            method: 'GET',
            credentials: 'include',
          }
        );

        if (!meResponse.ok) {
          setUser(null);
          navigate('/login');
          return;
        }

        const meData = await meResponse.json();
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
          navigate('/login');
          return;
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  if (loading) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          overflowX: 'hidden',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <>
        <Navbar user={user} />
        <Container
          sx={{ pt: 3, pb: '80px', overflow: 'hidden', overflowX: 'hidden' }}
        >
          <Alert severity="error">{error}</Alert>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar user={user} />
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
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Project Invitations
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your project invitations
          </Typography>
        </Box>

        {/* Received Invitations Section */}
        <Box sx={{ mb: 4 }}>
          <ReceivedInvitationsSection />
        </Box>

        {/* Sent Invitations Section */}
        <Box sx={{ mb: 4 }}>
          <SentInvitationsSection />
        </Box>
      </Container>
    </>
  );
};
