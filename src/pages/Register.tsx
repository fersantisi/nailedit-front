import Typography from '@mui/material/Typography';
import { Card } from '../components/ui/card';
import { Box, Button } from '@mui/material';
import { TextField } from '@mui/material';

export const Register = () => {
  const register = async (formData: FormData) => {
    const email = formData.get('email');
    const password = formData.get('password');

    console.log(email, password);
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
          window.location.href = '/login';
        }}
      >
        Back to Login
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
            Register
          </Typography>
        </Box>
        <Box component="form" action={register} noValidate>
          <Box sx={{ marginBottom: '20px' }}>
            <TextField
              variant="outlined"
              name="name"
              id="name"
              type="name"
              label="Name"
              placeholder="Enter your Name"
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
              type="confirmPassword"
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
    </Box>
  );
};
