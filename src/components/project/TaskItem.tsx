import React from 'react';
import { Card, Box, Typography, Chip, IconButton } from '@mui/material';
import {
  Edit as EditIcon,
  Note as NoteIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Task } from '../../types';
import DeleteTask from './DeleteTask';

interface TaskItemProps {
  task: Task;
  projectId: string;
  goalId: number;
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
  formatDate,
  getPriorityColor,
  onOpenNotes,
}) => {
  const navigate = useNavigate();

  return (
    <Card
      variant="outlined"
      sx={{
        mb: 1,
        p: 1,
        '&:hover': {
          backgroundColor: 'action.hover',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{ flex: 1 }}>
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
        <Box sx={{ display: 'flex', gap: 0.5 }}>
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
          <DeleteTask goalId={goalId} projectId={projectId} taskId={task.id} />
        </Box>
      </Box>
    </Card>
  );
};
