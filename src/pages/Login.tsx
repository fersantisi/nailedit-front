import { Card } from '../components/ui/card';
import { Box, Button, Alert, Typography, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/ui/navbar';
import { useState, useEffect } from 'react';
import { User } from '../types';

export const Login = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const login = async (formData: FormData) => {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    // Update form state with current values
    setFormData({ username, password });

    if (!username || !password) {
      setErrorMessage('Username and password are required');
      return;
    }

    try {
      const response = await fetch(
        import.meta.env.VITE_SERVER_URL + '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ username, password }),
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      console.log('Response:', response);

      const data = await response.json();

      console.log('Data:', data);

      if (response.ok && !data.admin) {
        navigate('/');
      } else if (response.ok && data.admin) {
        navigate('/admin/users');
      } else {
        console.error(response);
        console.error('Login failed');
        setErrorMessage('Invalid username or password. Please try again.');
      }

      if (!response.ok) {
        throw new Error('Failed to login');
      }

      console.log('Login successful:', data);
    } catch (error) {
      console.error('Error during login:', error);
      setErrorMessage('An error occurred during login. Please try again.');
    }
  };

  return (
    <>
      <Navbar user={user} />
      <Box
        sx={{
          height: 'calc(100vh - 70px)', // Account for navbar height
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
            padding: '16px',
            backgroundColor: 'secondary.main',
          }}
        >
          <Box
            sx={{
              textAlign: 'center',
              marginBottom: '12px',
              fontWeight: 'bold',
            }}
          >
            <Typography variant="h4" component="h1" gutterBottom>
              Log in
            </Typography>
          </Box>

          {errorMessage && (
            <Alert severity="error" sx={{ marginBottom: '12px' }}>
              {errorMessage}
            </Alert>
          )}

          <Box component="form" action={login} noValidate>
            <Box sx={{ marginBottom: '12px' }}>
              <TextField
                variant="outlined"
                name="username"
                id="username"
                type="text"
                label="Username"
                placeholder="Enter your username"
                required
                fullWidth
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                size="small"
              />
            </Box>
            <Box sx={{ marginBottom: '12px' }}>
              <TextField
                variant="outlined"
                name="password"
                id="password"
                type="password"
                label="Password"
                placeholder="Enter your password"
                required
                fullWidth
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                size="small"
              />
            </Box>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Login
            </Button>
          </Box>

          <Box
            sx={{
              textAlign: 'center',
              marginTop: '12px',
              fontWeight: 'bold',
            }}
          >
            <Typography variant="body2" component="p" sx={{ mb: 0.5 }}>
              Don't have an account?{' '}
              <Button
                variant="text"
                color="primary"
                size="small"
                onClick={() => {
                  window.location.href = '/register';
                }}
              >
                Register
              </Button>
            </Typography>
            <Typography variant="body2" component="p">
              Forgot your password?{' '}
              <Button
                variant="text"
                color="primary"
                size="small"
                onClick={() => {
                  window.location.href = '/forgot-password';
                }}
              >
                Reset password
              </Button>
            </Typography>
          </Box>
        </Card>
      </Box>
    </>
  );
};
