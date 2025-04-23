import { Divider } from '@mui/material';
import { Card } from '../ui/card';
import { Image } from '@mui/icons-material';

interface HomeProjectCardProps {
  name: number;
}

export const HomeProjectCard = ({ name }: HomeProjectCardProps) => {
  return (
    <Card
      key={name}
      variant="outlined"
      sx={{
        width: '12%',
        margin: 'auto',
        padding: '20px',
        backgroundColor: 'primary.main',
        height: '80%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Image />
      <Divider sx={{ bgcolor: 'text.primary' }} flexItem />
      {'Project ' + (name + 1)}
    </Card>
  );
};
