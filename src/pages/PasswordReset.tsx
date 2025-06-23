import { Card } from '../components/ui/card';
import { Box, Button, Typography, TextField, Alert } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

export const PasswordReset = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const passRecovery = async (formData: FormData) => {
    const password = formData.get('password');

    if (!password) {
      console.error('Password is required');
      return;
    }

    try {
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

      console.log('Response:', response);

      if (response.ok) {
        navigate('/login');
      } else {
        console.error(response);
      }

      if (!response.ok) {
        throw new Error('Failed to recover password');
      }
    } catch (error) {
      console.error('Error during recovery:', error);
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
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
      <Button
        variant="contained"
        color="primary"
        sx={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 1,
          backgroundColor: 'primary.main',
          '&:hover': {
            backgroundColor: 'primary.dark',
          },
        }}
        onClick={() => {
          window.location.href = '/';
        }}
      >
        Back to Home
      </Button>
      <Card
        variant="outlined"
        sx={{
          width: '300px',
          padding: '20px',
          backgroundColor: 'secondary.main',
        }}
      >
        <Box
          sx={{ textAlign: 'center', marginBottom: '20px', fontWeight: 'bold' }}
        >
          <Typography variant="h3" component="h1" gutterBottom>
            Reset pass
          </Typography>
        </Box>
        <Box component="form" action={passRecovery} noValidate>
          <Box sx={{ marginBottom: '20px' }}>
            <TextField
              variant="outlined"
              name="password"
              id="password"
              type="password"
              label="Password"
              placeholder="Enter your password"
              required
              fullWidth
              sx={{ marginTop: '10px' }}
            />
          </Box>
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Reset Password
          </Button>
        </Box>
      </Card>
    </Box>
  );
};
