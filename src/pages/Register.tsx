import Typography from '@mui/material/Typography';
import { Card } from '../components/ui/card';
import { Box, Button, Alert } from '@mui/material';
import { TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/ui/navbar';
import { useState, useEffect } from 'react';
import { User } from '../types';

export const Register = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

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
    // Clear field error when user starts typing
    if (fieldErrors[field as keyof typeof fieldErrors]) {
      setFieldErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const validateFields = (
    username: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => {
    const errors: {
      username?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    // Username validation
    if (!username) {
      errors.username = 'Username is required';
    } else if (username.length < 3) {
      errors.username = 'Username must be at least 3 characters long';
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.username =
        'Username can only contain letters, numbers, and underscores';
    }

    // Email validation
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      errors.password =
        'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    // Confirm password validation
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    return errors;
  };

  const register = async (formData: FormData) => {
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    // Update form state with current values
    setFormData({ username, email, password, confirmPassword });

    // Clear previous errors
    setErrorMessage('');

    // Validate all fields
    const errors = validateFields(username, email, password, confirmPassword);

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      const response = await fetch(
        import.meta.env.VITE_SERVER_URL + '/auth/signin',
        {
          method: 'POST',
          body: JSON.stringify({ username, email, password }),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Response:', response);

      if (response.ok) {
        navigate('/login');
      } else {
        const data = await response.json();
        if (data.message) {
          setErrorMessage(data.message);
        } else if (response.status === 409) {
          setErrorMessage(
            'Username or email already exists. Please choose different credentials.'
          );
        } else {
          setErrorMessage('Registration failed. Please try again.');
        }
      }

      if (!response.ok) {
        throw new Error('Failed to register');
      }

      const data = await response.json();
      console.log('Registration successful:', data);
    } catch (error) {
      console.error('Error during registration:', error);
      setErrorMessage(
        'An error occurred during registration. Please try again.'
      );
    }
  };

  return (
    <>
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
            sx={{
              textAlign: 'center',
              marginBottom: '20px',
              fontWeight: 'bold',
            }}
          >
            <Typography variant="h3" component="h1" gutterBottom>
              Register
            </Typography>
          </Box>

          {errorMessage && (
            <Alert severity="error" sx={{ marginBottom: '20px' }}>
              {errorMessage}
            </Alert>
          )}

          <Box component="form" action={register} noValidate>
            <Box sx={{ marginBottom: '20px' }}>
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
                error={!!fieldErrors.username}
                helperText={fieldErrors.username}
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
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={!!fieldErrors.email}
                helperText={fieldErrors.email}
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
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                error={!!fieldErrors.password}
                helperText={fieldErrors.password}
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
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange('confirmPassword', e.target.value)
                }
                error={!!fieldErrors.confirmPassword}
                helperText={fieldErrors.confirmPassword}
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
      <Navbar user={user} />
    </>
  );
};
