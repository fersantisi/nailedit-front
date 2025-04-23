import { Box, Divider } from '@mui/material';
import { HomeResourceItem } from './HomeResourceItem';
import { Card } from '../ui/card';

export const HomeResourceList = () => {
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          justifySelf: 'center',
          alignItems: 'space-evenly',
          flexWrap: 'wrap',
          width: '90%',
        }}
      >
        <HomeResourceItem
          title="Item"
          project="Project"
          amount="Amount Required"
        />
      </Box>
      <Card
        variant="outlined"
        sx={{
          width: '90%',
          margin: '10px',
          padding: '10px',
          backgroundColor: 'primary.main',
          height: '20%',
          display: 'flex',
          justifyContent: 'start',
          justifySelf: 'center',
          alignSelf: 'center',
          alignItems: 'center',
          gap: '5px',
          overflow: 'auto',
        }}
      >
        {[
          'Nails',
          'Bolts',
          'Screws',
          'Clips',
          'Washers',
          'Nuts',
          'Anchors',
          'Pins',
          'Rivets',
          'Staples',
        ].map((item, index, arr) => (
          <>
            <Box
              key={index}
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-evenly',
                justifySelf: 'center',
                alignItems: 'space-evenly',
                flexWrap: 'wrap',
                width: '100%',
              }}
            >
              <HomeResourceItem
                title={item}
                project={'Project ' + (index + 1)}
                amount={(index + 1) * 10}
              />
            </Box>
            {index < arr.length - 1 && (
              <Divider flexItem sx={{ bgcolor: 'text.primary', mx: 2 }} />
            )}
          </>
        ))}
      </Card>
    </>
  );
};
