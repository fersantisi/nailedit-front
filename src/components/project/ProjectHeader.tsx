import React from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import {
  Edit as EditIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DeleteProject from './DeleteProject';

interface ProjectHeaderProps {
  projectId: string;
  projectData: {
    name: string;
    description: string;
    category: string;
    dueDate: string;
  } | null;
  formatDate: (dateString: string) => string;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  projectId,
  projectData,
  formatDate,
}) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ mb: 4, maxWidth: '1200px', mx: 'auto', width: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 2,
        }}
      >
        <Box>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 'bold' }}
          >
            {projectData?.name || 'Project'}
          </Typography>
          {projectData?.description && (
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {projectData.description}
            </Typography>
          )}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {projectData?.category && (
              <Chip
                label={projectData.category}
                color="primary"
                variant="filled"
                sx={{ fontWeight: 'bold' }}
              />
            )}
            {projectData?.dueDate && (
              <Chip
                icon={<CalendarIcon />}
                label={`Due: ${formatDate(projectData.dueDate)}`}
                color="secondary"
                variant="filled"
                sx={{
                  pl: 1,
                  fontWeight: 'bold',
                  '& .MuiChip-icon': {
                    ml: 0.5,
                  },
                }}
              />
            )}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/project/${projectId}/edit`)}
          >
            Edit Project
          </Button>
          <DeleteProject projectId={projectId} />
        </Box>
      </Box>
    </Box>
  );
};
