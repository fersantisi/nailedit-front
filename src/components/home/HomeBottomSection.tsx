import { Box } from '@mui/material';
import { HomeScheduleSection } from './HomeScheduleSection';
import { HomeResourcesSection } from './HomeResourcesSection';

export const HomeBottomSection = () => {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 3,
        minHeight: 0,
      }}
    >
      <HomeScheduleSection />
      <HomeResourcesSection />
    </Box>
  );
};
