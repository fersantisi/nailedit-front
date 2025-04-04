import Typography from '@mui/material/Typography';
import { Card } from '../components/ui/card';
import { Box, Button } from '@mui/material';
import { TextField } from '@mui/material';

export const Login = () => {
  const login = async (formData: FormData) => {
    const email = formData.get('email');
    const password = formData.get('password');

    if (!email || !password) {
      console.error('Email and password are required');
      return;
    }

    try {
      const response = await fetch(import.meta.env.VITE_SERVER_URL + '/user/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response:', response);

      if (!response.ok) {
        throw new Error('Failed to login');
      }

      const data = await response.json();
      console.log('Login successful:', data);
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  return (
    <Box>
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
          window.location.href = '/register';
        }}
      >
        Back to Register
      </Button>
      <Card
        variant="outlined"
        sx={{
          width: '300px',
          margin: 'auto',
          padding: '20px',
          backgroundColor: 'secondary.main',
        }}
      >
        <Box
          sx={{ textAlign: 'center', marginBottom: '20px', fontWeight: 'bold' }}
        >
          <Typography variant="h2" component="h1" gutterBottom>
            Login
          </Typography>
        </Box>
        <Box component="form" action={login} noValidate>
          <Box sx={{ marginBottom: '20px' }}>
            <TextField
              variant="outlined"
              name="email"
              id="email"
              type="email"
              label="Email"
              placeholder="Enter your email"
              required
              fullWidth
              sx={{ marginTop: '10px' }}
            />
          </Box>
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
            Login
          </Button>
        </Box>
      </Card>
    </Box>
  );
};
