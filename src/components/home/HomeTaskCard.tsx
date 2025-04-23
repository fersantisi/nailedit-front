import { Divider } from '@mui/material';
import { Card } from '../ui/card';

interface HomeTaskCardProps {
  name: number;
}

export const HomeTaskCard = ({ name }: HomeTaskCardProps) => {
  return (
    <Card
      key={name}
      variant="outlined"
      sx={{
        width: '12%',
        margin: '10px',
        padding: '20px',
        backgroundColor: 'primary.main',
        height: '70%',
        display: 'flex',
        justifyContent: 'center',
        alignSelf: 'center',
        alignItems: 'center',
        gap: '5px',
        overflow: 'auto',
      }}
    >
      {'Project ' + (name + 1)}
      <Divider sx={{ bgcolor: 'text.primary' }} flexItem />
      Task
      <Divider sx={{ bgcolor: 'text.primary' }} flexItem />
      Due date
      <Divider sx={{ bgcolor: 'text.primary' }} flexItem />
      Description
    </Card>
  );
};
