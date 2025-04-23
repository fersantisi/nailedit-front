import { Box } from '@mui/material';
import { Navbar } from '../components/ui/navbar';
import { HomeTopSection } from '../components/home/HomeTopSection';
import { HomeBelowSection } from '../components/home/HomeBelowSection';

export const Home = () => {
  return (
    <>
      <Navbar isLoggedIn={true} />
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
        <HomeBelowSection />
      </Box>
    </>
  );
};
