import { Box, Divider, Typography } from '@mui/material';
import { HomeResourceItem } from './HomeResourceItem';
import { Card } from '../ui/card';
import { Resource } from '../../types';

interface HomeResourceListProps {
  resources: Resource[];
  emptyMessage: string;
}

export const HomeResourceList = ({
  resources,
  emptyMessage,
}: HomeResourceListProps) => {
  if (resources.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100px',
          p: 2,
        }}
      >
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <Card
      variant="outlined"
      sx={{
        width: '100%',
        padding: 2,
        backgroundColor: 'primary.main',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        maxHeight: '200px',
        overflow: 'auto',
      }}
    >
      {resources.map((resource, index) => (
        <Box key={resource.id}>
          <HomeResourceItem
            title={resource.name}
            project={resource.project}
            amount={`${resource.stock}/${resource.amount}`}
          />
          {index < resources.length - 1 && (
            <Divider sx={{ bgcolor: 'text.primary', my: 1 }} />
          )}
        </Box>
      ))}
    </Card>
  );
};
