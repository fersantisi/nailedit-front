import { Box } from '@mui/material';
import { Navbar } from '../components/ui/navbar';
import { HomeTopSection } from '../components/home/HomeTopSection';
import { HomeBottomSection } from '../components/home/HomeBottomSection';
import { HomeGuest } from '../components/home/HomeGuest';

export const Home = () => {
  const isLoggedIn = true;

  return (
    <>
      {isLoggedIn ? (
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
          <HomeTopSection />
          <HomeBottomSection />
        </Box>
      ) : (
        <HomeGuest />
      )}
      <Navbar isLoggedIn={isLoggedIn} />
    </>
  );
};
