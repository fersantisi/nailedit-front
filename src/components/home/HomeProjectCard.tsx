import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  CardActionArea,
} from '@mui/material';
import {
  Assignment as ProjectIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/dateUtils';

interface HomeProjectCardProps {
  project: {
    id: number;
    name: string;
    description: string;
    category?: string;
    dueDate?: string;
  };
}

export const HomeProjectCard = ({ project }: HomeProjectCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/project/${project.id}`);
  };

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
          borderColor: 'primary.main',
        },
        cursor: 'pointer',
      }}
    >
      <CardActionArea
        onClick={handleClick}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          p: 0,
        }}
      >
        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <ProjectIcon color="primary" sx={{ mr: 1 }} />
            <Typography
              variant="h6"
              component="h3"
              sx={{
                fontWeight: 'bold',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {project.name}
            </Typography>
          </Box>

          {project.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.4,
              }}
            >
              {project.description}
            </Typography>
          )}

          <Box sx={{ mt: 'auto', display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {project.category && (
              <Chip
                label={project.category}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {project.dueDate && (
              <Chip
                icon={<CalendarIcon />}
                label={formatDate(project.dueDate)}
                size="small"
                color="secondary"
                variant="outlined"
              />
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
