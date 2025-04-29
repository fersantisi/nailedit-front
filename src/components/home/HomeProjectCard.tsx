import { Divider, Link } from '@mui/material';
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
  
  const handleClick = () => {
    console.log('Card clicked:', project.id);
  };
  return (
    <Link href={`/project/${project.id}`} sx={{ textDecoration: 'none', width: '12%' }} onClick={handleClick}>
    <Card
      key={project.id}
      variant="outlined"
      sx={{
        width: '100%',
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
      </Link>
  );
};
