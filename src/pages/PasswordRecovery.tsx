import { Card } from '../components/ui/card';
import {
  Box,
  Button,
  Typography,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import React from 'react';
import { Navbar } from '../components/ui/navbar';

export const PasswordRecovery = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const passRecovery = async (formData: FormData) => {
    const email = formData.get('email');

    if (!email) {
      setError('Email is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        import.meta.env.VITE_SERVER_URL + '/auth/forgot-password',
        {
          method: 'POST',
          body: JSON.stringify({ email }),
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (response.ok) {
        setSuccess(true);
        setLoading(false);
        return;
      } else {
        setError('Failed to recover password. Please try again.');
      }

      if (!response.ok) {
        setError('Failed to recover password');
      }
    } catch (error) {
      setError('Error during recovery. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar user={null} />
      <Box
        sx={{
          height: 'calc(100vh - 70px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          px: '15px',
          width: '100%',
          overflow: 'hidden',
          overflowX: 'hidden',
        }}
      >
        <Card
          variant="outlined"
          sx={{
            width: '300px',
            padding: '20px',
            backgroundColor: 'secondary.main',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{ fontWeight: 'bold' }}
            >
              Password Recovery
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Enter your email to receive a recovery link
            </Typography>
          </Box>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress />
            </Box>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && !loading ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              If the email exists, a recovery link has been sent.
            </Alert>
          ) : (
            !loading &&
            !success && (
              <Box component="form" action={passRecovery} noValidate>
                <Box sx={{ marginBottom: '20px' }}>
                  <TextField
                    variant="outlined"
                    name="email"
                    id="email"
                    type="text"
                    label="Email"
                    placeholder="Enter your email"
                    required
                    fullWidth
                    sx={{ marginTop: '10px' }}
                  />
                </Box>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  Recover Password
                </Button>
              </Box>
            )
          )}
        </Card>
      </Box>
    </>
  );
};
