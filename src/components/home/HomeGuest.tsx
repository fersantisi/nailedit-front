import { Box, Typography } from '@mui/material';

export const HomeGuest = () => {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        px: 3,
        color: 'white',
        gap: 4,
      }}
    >
      <Box
        component="img"
        src="public/assets/nailedit.svg"
        sx={{
          width: { xs: '120px', sm: '180px' },
          height: 'auto',
        }}
        alt="NailedIt Logo"
      />

      <Typography
        variant="h3"
        sx={{
          fontWeight: 'bold',
          color: 'text.main',
          mb: 2,
        }}
      >
        Welcome to NailedIt!
      </Typography>

      <Typography
        variant="body1"
        sx={{
          maxWidth: '500px',
          color: 'text.main',
          lineHeight: 1.6,
        }}
      >
        A productivity app to help you nail your goals and stay on track with
        your daily tasks.
      </Typography>

      <Typography
        variant="body2"
        sx={{
          mt: 4,
          color: 'text.main',
          fontStyle: 'italic',
        }}
      >
        Sign in to get started
      </Typography>
    </Box>
  );
};
