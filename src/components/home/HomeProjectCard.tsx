import { Divider } from '@mui/material';
import { Card } from '../ui/card';
import { Image } from '@mui/icons-material';

interface HomeProjectCardProps {
  project: Project;
}

interface Project {
  id: number;
  name: string;
  description: string;
}

export const HomeProjectCard = ({ project }: HomeProjectCardProps) => {
  return (
    <Card
      key={project.id}
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
      {project.name}
    </Card>
  );
};
