import { Box } from '@mui/material';
import { HomeMoreButton } from './HomeMoreButton';
import { HomeTitle } from './HomeTitle';
import { HomeTaskCard } from './HomeTaskCard';

export const HomeScheduleSection = () => {
  return (
    <Box
      sx={{
        width: '50%',
        backgroundColor: 'secondary.main',
        borderRadius: '10px',
      }}
    >
      <HomeTitle title="Schedule" fontSize="30px" />
      <HomeTitle title="Upcoming deadlines" fontSize="20px" />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          alignItems: 'space-evenly',
          flexWrap: 'wrap',
          width: '100%',
          height: '30%',
          pb: '10px',
        }}
      >
        {[1, 2, 3, 4].map((_, index) => (
          <HomeTaskCard name={index} />
        ))}
        <HomeMoreButton edge="50px" fontSize="15px" iconSize="30px" />
      </Box>
      <HomeTitle title="High-priority tasks" fontSize="20px" />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          alignItems: 'space-evenly',
          flexWrap: 'wrap',
          width: '100%',
          height: '30%',
          pb: '10px',
        }}
      >
        {[1, 2, 3, 4].map((_, index) => (
          <HomeTaskCard name={index} />
        ))}
        <HomeMoreButton edge="50px" fontSize="15px" iconSize="30px" />
      </Box>
    </Box>
  );
};
