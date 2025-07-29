import { GoogleLogin } from '@react-oauth/google';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface GoogleLoginButtonProps {
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
}

export const GoogleLoginButton = ({
  onSuccess,
  onError,
}: GoogleLoginButtonProps) => {
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse: any) => {
    try {
      // Send the credential to your backend
      const response = await fetch(
        import.meta.env.VITE_SERVER_URL + '/auth/google',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            credential: credentialResponse.credential,
          }),
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();

        // Call the onSuccess callback if provided
        if (onSuccess) {
          onSuccess(data);
        }

        // Navigate based on user role
        if (data.admin) {
          navigate('/admin/users');
        } else {
          navigate('/');
        }
      } else {
        const errorData = await response.json();
        console.error('Google login failed:', errorData);

        if (onError) {
          onError(errorData);
        }
      }
    } catch (error) {
      console.error('Error during Google login:', error);

      if (onError) {
        onError(error);
      }
    }
  };

  const handleError = () => {
    console.error('Google login error');

    if (onError) {
      onError('Google login failed');
    }
  };

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
        Or continue with
      </Typography>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap
        theme="filled_black"
        size="large"
        text="continue_with"
        shape="rectangular"
      />
    </Box>
  );
};
