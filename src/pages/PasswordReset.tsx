import { Card } from '../components/ui/card';
import { Box, Button, Typography, TextField, Alert } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import React from 'react';
import { Navbar } from '../components/ui/navbar';

export const PasswordReset = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  React.useEffect(() => {
    const checkToken = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          import.meta.env.VITE_SERVER_URL + `/auth/recoverPassword/${token}`,
          {
            method: 'GET',
            credentials: 'include',
          }
        );
        if (!response.ok) {
          setError('Invalid or expired link.');
        }
      } catch (e) {
        setError('Invalid or expired link.');
      } finally {
        setLoading(false);
      }
    };
    checkToken();
  }, [token]);

  const passRecovery = async (formData: FormData) => {
    const password = formData.get('password');

    if (!password) {
      setError('Password is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        import.meta.env.VITE_SERVER_URL + `/auth/recoverPassword/${token}`,
        {
          method: 'POST',
          body: JSON.stringify({ password }),
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );
      if (response.ok) {
        setResetSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError('Failed to reset password. Please try again.');
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
              Reset Password
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Enter your new password below
            </Typography>
          </Box>
          {loading && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Loading...
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {resetSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Password reset! Redirecting to login...
            </Alert>
          )}
          {!loading && !error && !resetSuccess && (
            <Box component="form" action={passRecovery} noValidate>
              <Box sx={{ marginBottom: '20px' }}>
                <TextField
                  variant="outlined"
                  name="password"
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  label="New Password"
                  placeholder="Enter your new password"
                  required
                  fullWidth
                  sx={{ marginTop: '10px' }}
                  InputProps={{
                    endAdornment: (
                      <Button
                        onClick={() => setShowPassword((show) => !show)}
                        size="small"
                        sx={{ minWidth: 0, px: 1 }}
                        tabIndex={-1}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </Button>
                    ),
                  }}
                />
              </Box>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
              >
                Reset Password
              </Button>
            </Box>
          )}
        </Card>
      </Box>
    </>
  );
};
