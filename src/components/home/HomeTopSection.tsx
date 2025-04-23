import { Box } from '@mui/material';
import { HomeTitle } from './HomeTitle';
import { HomeProjectCard } from './HomeProjectCard';
import { HomeMoreButton } from './HomeMoreButton';

export const HomeTopSection = () => {
  return (
    <Box
      sx={{
        flex: 1,
        backgroundColor: 'secondary.main',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: '10px',
        flexWrap: 'wrap',
        minHeight: 0,
      }}
    >
      <HomeTitle title="Projects" fontSize="30px" />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          alignItems: 'space-evenly',
          flexWrap: 'wrap',
          width: '100%',
          gap: '20px',
          height: '80%',
          pb: '10px',
        }}
      >
        {[1, 2, 3, 4, 5].map((_, index) => (
          <HomeProjectCard name={index} />
        ))}
        <HomeMoreButton edge="100px" fontSize="20px" iconSize="50px" />
      </Box>
    </Box>
  );
};
