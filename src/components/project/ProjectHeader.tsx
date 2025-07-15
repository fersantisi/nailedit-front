import React from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import {
  Edit as EditIcon,
  CalendarToday as CalendarIcon,
  Note as NoteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DeleteProject from './DeleteProject';
import { Project, ProjectPermissions } from '../../types';

interface ProjectHeaderProps {
  projectId: string;
  projectData: Project | null;
  permissions: ProjectPermissions;
  formatDate: (dateString: string) => string;
  onOpenProjectNotes?: () => void;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  projectId,
  projectData,
  permissions,
  formatDate,
  onOpenProjectNotes,
}) => {
  const navigate = useNavigate();

  if (!projectData) {
    return null;
  }

  const getCategoryColor = (
    category?: string
  ):
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'info'
    | 'default'
    | 'error' => {
    const colors: Record<
      string,
      | 'primary'
      | 'secondary'
      | 'success'
      | 'warning'
      | 'info'
      | 'default'
      | 'error'
    > = {
      web: 'primary',
      mobile: 'secondary',
      desktop: 'success',
      game: 'warning',
      ai: 'info',
      other: 'default',
    };
    return colors[category?.toLowerCase() || ''] || 'default';
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        p: 3,
        backgroundColor: 'secondary.main',
        borderRadius: '10px',
        mb: 3,
        maxWidth: '1200px',
        mx: 'auto',
        width: '100%',
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 2,
            flexWrap: 'wrap',
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 'bold',
              minWidth: 0,
              wordBreak: 'break-word',
            }}
          >
            {projectData.name}
          </Typography>
          <Chip
            label={projectData.category || 'Other'}
            color={getCategoryColor(projectData.category)}
            sx={{ fontWeight: 'bold', flexShrink: 0 }}
          />
        </Box>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            mb: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {projectData.description}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarIcon fontSize="small" />
          <Typography variant="body2" color="text.secondary">
            Due: {formatDate(projectData.dueDate || '')}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, flexShrink: 0, ml: 2 }}>
        {onOpenProjectNotes && (
          <Button
            variant="outlined"
            startIcon={<NoteIcon />}
            onClick={onOpenProjectNotes}
            size="small"
          >
            Notes
          </Button>
        )}
        {permissions.role === 'owner' && (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/project/${projectId}/edit`)}
            size="small"
          >
            Edit
          </Button>
        )}
        <DeleteProject projectId={projectId} permissions={permissions} />
      </Box>
    </Box>
  );
};
