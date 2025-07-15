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
  Star as StarIcon,
  Group as GroupIcon,
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
    userRole?: 'owner' | 'participant';
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
          {/* Header with Icon, Title, and Role */}
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
            <Box sx={{ flex: 1, minWidth: 0 }}>
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
                  mb: 0.5,
                }}
              >
                {project.name}
              </Typography>
              {/* Role Chip */}
              {project.userRole && (
                <Chip
                  icon={
                    project.userRole === 'owner' ? <StarIcon /> : <GroupIcon />
                  }
                  label={project.userRole === 'owner' ? 'Owner' : 'Member'}
                  size="small"
                  color={project.userRole === 'owner' ? 'primary' : 'secondary'}
                  variant="outlined"
                  sx={{
                    fontSize: '0.75rem',
                    height: '20px',
                    '& .MuiChip-icon': {
                      fontSize: '0.9rem',
                    },
                  }}
                />
              )}
            </Box>
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
              display: 'flex',
              gap: 1,
              flexWrap: 'wrap',
              alignItems: 'center',
              mt: 'auto',
            }}
          >
            {project.category && (
              <Chip
                label={project.category}
                size="small"
                color="primary"
                variant="outlined"
                sx={{
                  fontSize: '0.75rem',
                  textTransform: 'capitalize',
                }}
              />
            )}
            {project.dueDate && (
              <Chip
                icon={<CalendarIcon />}
                label={formatDate(project.dueDate)}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: '0.75rem',
                  pl: 1,
                  '& .MuiChip-icon': {
                    ml: 0.5,
                    fontSize: '1rem',
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
