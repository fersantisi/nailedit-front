import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Add as AddIcon, Assignment as TaskIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Task } from '../../types';
import { TaskItem } from './TaskItem';

interface TasksListProps {
  tasks: Task[];
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

export const TasksList: React.FC<TasksListProps> = ({
  tasks,
  projectId,
  goalId,
  formatDate,
  getPriorityColor,
  onOpenNotes,
}) => {
  const navigate = useNavigate();

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          <TaskIcon fontSize="small" />
          Tasks ({tasks.length})
        </Typography>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={() =>
            navigate(`/project/${projectId}/goal/${goalId}/task/create`)
          }
        >
          Add Task
        </Button>
      </Box>

      {tasks.length > 0 ? (
        <Box sx={{ mt: 1 }}>
          {tasks.map((task: Task) => (
            <TaskItem
              key={task.id}
              task={task}
              projectId={projectId}
              goalId={goalId}
              formatDate={formatDate}
              getPriorityColor={getPriorityColor}
              onOpenNotes={onOpenNotes}
            />
          ))}
        </Box>
      ) : (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontStyle: 'italic' }}
        >
          No tasks yet. Add your first task!
        </Typography>
      )}
    </Box>
  );
};
