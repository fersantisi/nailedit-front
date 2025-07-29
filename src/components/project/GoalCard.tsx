import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  IconButton,
  Divider,
  Checkbox,
} from '@mui/material';
import {
  Edit as EditIcon,
  Note as NoteIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Goal, Task, ProjectPermissions } from '../../types';
import DeleteGoal from './DeleteGoal';
import { TasksList } from './TasksList';

interface GoalCardProps {
  goal: Goal;
  projectId: string;
  permissions: ProjectPermissions;
  formatDate: (dateString: string) => string;
  getPriorityColor: (label: string) => string;
  onOpenNotes: (
    entityType: 'goal' | 'task',
    entityId: number,
    entityName: string,
    goalId?: number
  ) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  projectId,
  permissions,
  formatDate,
  getPriorityColor,
  onOpenNotes,
}) => {
  const navigate = useNavigate();
  const [completed, setCompleted] = React.useState(!!goal.completed);
  const [loading, setLoading] = React.useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/project/${projectId}/goal/${goal.id}/complete`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ completed: !completed }),
        }
      );
      if (response.ok) {
        setCompleted((prev) => !prev);

        // If goal is being completed, also complete all tasks
        if (!completed && goal.tasks && goal.tasks.length > 0) {
          const taskCompletionPromises = goal.tasks.map(async (task) => {
            if (!task.completed) {
              return fetch(
                `${import.meta.env.VITE_SERVER_URL}/project/${projectId}/goal/${goal.id}/task/${task.id}/complete`,
                {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({ completed: true }),
                }
              );
            }
          });

          // Wait for all task completions to finish
          await Promise.all(taskCompletionPromises);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        flex: '1 1 350px',
        maxWidth: '400px',
        minWidth: '300px',
      }}
    >
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          '&:hover': {
            boxShadow: 6,
            transform: 'translateY(-2px)',
            transition: 'all 0.2s ease-in-out',
          },
          opacity: completed ? 0.5 : 1,
          textDecoration: completed ? 'line-through' : 'none',
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Checkbox
                checked={completed}
                onChange={handleToggle}
                disabled={loading || permissions.role === 'viewer'}
                size="small"
                sx={{ p: 0.5 }}
              />
              <Typography
                variant="h6"
                component="h3"
                sx={{ fontWeight: 'bold' }}
              >
                {goal.name}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {permissions.role !== 'viewer' && (
                <>
                  <IconButton
                    size="small"
                    onClick={() =>
                      navigate(`/project/${projectId}/goal/${goal.id}/edit`)
                    }
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => onOpenNotes('goal', goal.id, goal.name)}
                  >
                    <NoteIcon fontSize="small" />
                  </IconButton>
                </>
              )}
              {permissions.role !== 'viewer' && (
                <DeleteGoal goalId={goal.id} projectId={projectId} />
              )}
            </Box>
          </Box>

          {goal.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {goal.description}
            </Typography>
          )}

          {goal.dueDate && (
            <Chip
              icon={<CalendarIcon />}
              label={`Due: ${formatDate(goal.dueDate)}`}
              size="small"
              variant="outlined"
              sx={{
                mb: 2,
                pl: 1,
                '& .MuiChip-icon': {
                  ml: 0.5,
                },
              }}
            />
          )}

          <Divider sx={{ my: 2 }} />

          <TasksList
            tasks={goal.tasks || []}
            projectId={projectId}
            goalId={goal.id}
            permissions={permissions}
            formatDate={formatDate}
            getPriorityColor={getPriorityColor}
            onOpenNotes={onOpenNotes}
          />
        </CardContent>
      </Card>
    </Box>
  );
};
