import Typography from '@mui/material/Typography';
import { Card } from '../components/ui/card';
import { Box, Button } from '@mui/material';
import { TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const Register = () => {
  const navigate = useNavigate();
  const register = async (formData: FormData) => {
    const username = formData.get('username');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    if (!username || !email || !password || !confirmPassword) {
      console.error('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      console.error('Passwords do not match');
      return;
    }

    try {
      const response = await fetch(import.meta.env.VITE_SERVER_URL + '/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response:', response);

      if (response.ok) {
        navigate('/login');
      } 
      
      if (!response.ok) {
        throw new Error('Failed to register');
      }

      const data = await response.json();
      console.log('Registration successful:', data);
    } catch (error) {
      console.error('Error during registration:', error);
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
          window.location.href = '/';
        }}
      >
        Back to Home
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
          <Typography variant="h3" component="h1" gutterBottom>
            Register
          </Typography>
        </Box>
        <Box component="form" action={register} noValidate>
          <Box sx={{ marginBottom: '20px' }}>
            <TextField
              variant="outlined"
              name="username"
              id="username"
              type="username"
              label="Username"
              placeholder="Enter your username"
              required
              fullWidth
              sx={{ marginTop: '10px' }}
            />
          </Box>
          <Box sx={{ marginBottom: '20px' }}>
            <TextField
              variant="outlined"
              name="email"
              id="email"
              type="email"
              label="Email"
              placeholder="Enter your e-mail"
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
          <Box sx={{ marginBottom: '20px' }}>
            <TextField
              variant="outlined"
              name="confirmPassword"
              id="confirmPassword"
              type="password"
              label="Confirm password"
              placeholder="Confirm your password"
              required
              fullWidth
              sx={{ marginTop: '10px' }}
            />
          </Box>
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Register
          </Button>
        </Box>
      </Card>
      <Box
        sx={{
          textAlign: 'center',
          marginTop: '20px',
          fontWeight: 'bold',
        }}
      >
        <Typography variant="body1" component="p">
          Already registered?{' '}
          <Button
            variant="text"
            color="primary"
            onClick={() => {
              window.location.href = '/login';
            }}
          >
            Log in
          </Button>
        </Typography>
      </Box>
    </Box>
  );
};
