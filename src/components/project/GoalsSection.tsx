import React from 'react';
import { Box, Typography, Button, Card } from '@mui/material';
import { Add as AddIcon, Flag as GoalIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Goal } from '../../types';
import { GoalCard } from './GoalCard';

interface GoalsSectionProps {
  goals: Goal[];
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

export const GoalsSection: React.FC<GoalsSectionProps> = ({
  goals,
  projectId,
  formatDate,
  getPriorityColor,
  onOpenNotes,
}) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ mb: 4, maxWidth: '1200px', mx: 'auto', width: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography
          variant="h4"
          component="h2"
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <GoalIcon color="primary" />
          Goals
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate(`/project/${projectId}/goal/create`)}
        >
          Add Goal
        </Button>
      </Box>

      {goals.length > 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 3,
            justifyContent: 'center',
          }}
        >
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              projectId={projectId}
              formatDate={formatDate}
              getPriorityColor={getPriorityColor}
              onOpenNotes={onOpenNotes}
            />
          ))}
        </Box>
      ) : (
        <Card sx={{ p: 4, textAlign: 'center', maxWidth: '600px', mx: 'auto' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No goals set for this project
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Start by creating your first goal to organize your project tasks.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate(`/project/${projectId}/goal/create`)}
          >
            Create First Goal
          </Button>
        </Card>
      )}
    </Box>
  );
};
