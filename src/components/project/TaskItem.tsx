import React from 'react';
import {
  Card,
  Box,
  Typography,
  Chip,
  IconButton,
  Checkbox,
} from '@mui/material';
import {
  Edit as EditIcon,
  Note as NoteIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Task, ProjectPermissions } from '../../types';
import DeleteTask from './DeleteTask';

interface TaskItemProps {
  task: Task;
  projectId: string;
  goalId: number;
  permissions: ProjectPermissions;
  formatDate: (dateString: string) => string;
  getPriorityColor: (label: string) => string;
  onOpenNotes: (
    entityType: 'task',
    entityId: number,
    entityName: string,
    goalId: number
  ) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  projectId,
  goalId,
  permissions,
  formatDate,
  getPriorityColor,
  onOpenNotes,
}) => {
  const navigate = useNavigate();
  const [completed, setCompleted] = React.useState(!!task.completed);
  const [loading, setLoading] = React.useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/project/${projectId}/goal/${goalId}/task/${task.id}/complete`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ completed: !completed }),
        }
      );
      if (response.ok) {
        setCompleted((prev) => !prev);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      variant="outlined"
      sx={{
        mb: 1,
        p: 1,
        '&:hover': {
          backgroundColor: 'action.hover',
        },
        opacity: completed ? 0.5 : 1,
        textDecoration: completed ? 'line-through' : 'none',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Checkbox
            checked={completed}
            onChange={handleToggle}
            disabled={loading || permissions.role === 'viewer'}
            size="small"
            sx={{ p: 0.5 }}
          />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              {task.name}
            </Typography>
            {task.description && (
              <Typography variant="caption" color="text.secondary">
                {task.description}
              </Typography>
            )}
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
              {task.label && (
                <Chip
                  label={task.label}
                  size="small"
                  color={getPriorityColor(task.label) as any}
                  variant="outlined"
                />
              )}
              {task.dueDate && (
                <Chip
                  icon={<CalendarIcon />}
                  label={formatDate(task.dueDate)}
                  size="small"
                  variant="outlined"
                  sx={{
                    pl: 1,
                    '& .MuiChip-icon': {
                      ml: 0.5,
                    },
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {permissions.role !== 'viewer' && (
            <>
              <IconButton
                size="small"
                onClick={() =>
                  navigate(
                    `/project/${projectId}/goal/${goalId}/task/${task.id}/edit`
                  )
                }
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => onOpenNotes('task', task.id, task.name, goalId)}
              >
                <NoteIcon fontSize="small" />
              </IconButton>
            </>
          )}
          {permissions.role !== 'viewer' && (
            <DeleteTask
              goalId={goalId}
              projectId={projectId}
              taskId={task.id}
            />
          )}
        </Box>
      </Box>
    </Card>
  );
};
