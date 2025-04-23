import { Card } from '../ui/card';
import { Add } from '@mui/icons-material';

interface HomeMoreButtonProps {
  edge: string;
  fontSize: string;
  iconSize: string;
}

export const HomeMoreButton = ({ edge, fontSize, iconSize }: HomeMoreButtonProps) => {
  return (
    <Card
      variant="outlined"
      sx={{
        width: edge,
        margin: '10px',
        padding: '20px',
        backgroundColor: 'primary.main',
        height: edge,
        display: 'flex',
        justifyContent: 'center',
        alignSelf: 'center',
        alignItems: 'center',
        gap: '5px',
        fontSize: fontSize,
      }}
    >
      <Add sx={{ fontSize: iconSize, color: 'text.primary' }} />
      More
    </Card>
  );
};
