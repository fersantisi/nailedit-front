import Typography from '@mui/material/Typography';
import { Card } from '../components/ui/card';
import { Box, Button } from '@mui/material';
import { TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';



export const PasswordRecovery = () => {
  const navigate = useNavigate();
  const passRecovery = async (formData: FormData) => {
    const email = formData.get('email');

    if (!email) {
      console.error('Email is required');
      return;
    }

    try {
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

      console.log('Response:', response);

      if (response.ok) {
        const data = await response.json();
        navigate(data.link);
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
            Recovery
          </Typography>
        </Box>
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
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Recover Password
          </Button>
        </Box>
      </Card>
    </Box>
  );
};
