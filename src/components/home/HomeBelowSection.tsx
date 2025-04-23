import { Box } from '@mui/material';
import { HomeScheduleSection } from './HomeScheduleSection';
import { HomeResourcesSection } from './HomeResourcesSection';


export const HomeBelowSection = () => {
  return (
    <Box sx={{ flex: 1, display: 'flex', gap: '20px', minHeight: 0 }}>
      <HomeScheduleSection />
      <HomeResourcesSection />
    </Box>
  );
};
