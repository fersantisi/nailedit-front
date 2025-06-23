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
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
          borderColor: 'primary.main',
        },
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
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
        <CardContent
          sx={{ flexGrow: 1, p: 2.5, display: 'flex', flexDirection: 'column' }}
        >
          {/* Header with Icon and Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
            <Box
              sx={{
                backgroundColor: 'primary.main',
                borderRadius: '50%',
                p: 1,
                mr: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ProjectIcon sx={{ color: 'white', fontSize: '1.2rem' }} />
            </Box>
            <Typography
              variant="h6"
              component="h3"
              sx={{
                fontWeight: 'bold',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: 'text.primary',
                fontSize: '1.1rem',
              }}
            >
              {project.name}
            </Typography>
          </Box>

          {/* Description */}
          {project.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 3,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.5,
                fontSize: '0.875rem',
                flexGrow: 1,
              }}
            >
              {project.description}
            </Typography>
          )}

          {/* Chips Section */}
          <Box
            sx={{
              mt: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            {project.category && (
              <Chip
                label={project.category}
                size="small"
                color="success"
                variant="filled"
                sx={{
                  fontWeight: 'bold',
                  fontSize: '0.75rem',
                  height: '24px',
                  alignSelf: 'flex-start',
                }}
              />
            )}
            {project.dueDate && (
              <Chip
                icon={<CalendarIcon />}
                label={formatDate(project.dueDate)}
                size="small"
                color="warning"
                variant="filled"
                sx={{
                  pl: 1,
                  fontWeight: 'bold',
                  fontSize: '0.75rem',
                  height: '24px',
                  alignSelf: 'flex-start',
                  '& .MuiChip-icon': {
                    ml: 0.5,
                    fontSize: '0.9rem',
                  },
                }}
              />
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
