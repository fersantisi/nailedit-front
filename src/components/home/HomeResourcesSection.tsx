import { Box } from '@mui/material';
import { HomeTitle } from './HomeTitle';
import { HomeResourceList } from './HomeResourceList';

export const HomeResourcesSection = () => {
  return (
    <Box
      sx={{
        width: '50%',
        backgroundColor: 'secondary.main',
        borderRadius: '10px',
      }}
    >
      <HomeTitle title="Resources" fontSize="30px" />
      <HomeTitle title="Wishlist" fontSize="20px" />
      <HomeResourceList />
      <HomeTitle title="Nearly Out Of Stock" fontSize="20px" />
      <HomeResourceList />
    </Box>
  );
};
