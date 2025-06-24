import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  CardActionArea,
} from '@mui/material';
import {
  Assignment as TaskIcon,
  CalendarToday as CalendarIcon,
  Flag as PriorityIcon,
  Folder as ProjectIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Task } from '../../types';
import { formatDate, getPriorityColor } from '../../utils/dateUtils';

interface HomeTaskCardProps {
  task: Task & {
    projectName?: string;
    projectId?: number;
  };
}

export const HomeTaskCard = ({ task }: HomeTaskCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Navigate to the project page where the task belongs
    if (task.projectId) {
      navigate(`/project/${task.projectId}`);
    } else {
      navigate('/');
    }
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
          transform: 'translateY(-2px)',
          boxShadow: 3,
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
        <CardContent sx={{ flexGrow: 1, p: 1.5 }}>
          {/* Project Name */}
          {task.projectName && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <ProjectIcon color="action" sx={{ mr: 0.5, fontSize: '1rem' }} />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontWeight: 'medium',
                }}
              >
                {task.projectName}
              </Typography>
            </Box>
          )}

          {/* Task Name */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
            <TaskIcon
              color="primary"
              sx={{ mr: 0.5, mt: 0.25, fontSize: '1rem' }}
            />
            <Typography
              variant="body2"
              component="h4"
              sx={{
                fontWeight: 'bold',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
                fontSize: '0.875rem',
              }}
            >
              {task.name}
            </Typography>
          </Box>

          {/* Description */}
          {task.description && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                mb: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.3,
                fontSize: '0.75rem',
              }}
            >
              {task.description}
            </Typography>
          )}

          {/* Chips */}
          <Box
            sx={{
              mt: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
            }}
          >
            {task.label && (
              <Chip
                icon={<PriorityIcon />}
                label={task.label}
                size="small"
                color={getPriorityColor(task.label) as any}
                variant="filled"
                sx={{ fontSize: '0.7rem', height: '20px' }}
              />
            )}
            {task.dueDate && (
              <Chip
                icon={<CalendarIcon />}
                label={formatDate(task.dueDate)}
                size="small"
                color={new Date(task.dueDate) < new Date() ? 'error' : 'info'}
                variant="filled"
                sx={{
                  fontSize: '0.7rem',
                  height: '20px',
                  pl: 1,
                  backgroundColor:
                    new Date(task.dueDate) < new Date() ? '#b71c1c' : undefined,
                  color:
                    new Date(task.dueDate) < new Date() ? '#fff' : undefined,
                  '& .MuiChip-icon': {
                    ml: 0.5,
                    color:
                      new Date(task.dueDate) < new Date() ? '#fff' : undefined,
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
