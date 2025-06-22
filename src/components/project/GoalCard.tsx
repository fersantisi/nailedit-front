import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Edit as EditIcon,
  Note as NoteIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Goal, Task } from '../../types';
import DeleteGoal from './DeleteGoal';
import { TasksList } from './TasksList';

interface GoalCardProps {
  goal: Goal;
  projectId: string;
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
  formatDate,
  getPriorityColor,
  onOpenNotes,
}) => {
  const navigate = useNavigate();

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
            <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
              {goal.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
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
              <DeleteGoal goalId={goal.id} projectId={projectId} />
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
              sx={{ mb: 2 }}
            />
          )}

          <Divider sx={{ my: 2 }} />

          <TasksList
            tasks={goal.tasks || []}
            projectId={projectId}
            goalId={goal.id}
            formatDate={formatDate}
            getPriorityColor={getPriorityColor}
            onOpenNotes={onOpenNotes}
          />
        </CardContent>
      </Card>
    </Box>
  );
};
