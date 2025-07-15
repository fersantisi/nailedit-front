import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  Person as PersonIcon,
  Group as GroupIcon,
  CalendarToday as CalendarIcon,
  Send as SendIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Launch as LaunchIcon,
} from '@mui/icons-material';
import { Project, User, ProjectPermissions } from '../../types';
import { communityApi, communityUtils } from '../../utils/communityApi';
import { formatDate } from '../../utils/dateUtils';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

interface ProjectCardProps {
  project: Project;
  currentUser: User;
  onRequestSent?: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  currentUser,
  onRequestSent,
}) => {
  const [requestStatus, setRequestStatus] = useState<
    'owner' | 'member' | 'pending' | 'none'
  >('none');
  const [permissions, setPermissions] = useState<ProjectPermissions | null>(
    null
  );
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const navigate = useNavigate();

  // Load accurate permissions when component mounts
  useEffect(() => {
    const loadPermissions = async () => {
      // Try to get the project ID from different possible field names
      const projectId =
        project.id || (project as any).projectId || (project as any).project_id;

      // Fetch participants if missing from project data
      if (!project.participants && projectId) {
        setParticipantsLoading(true);

        try {
          const response = await fetch(
            import.meta.env.VITE_SERVER_URL +
              `/project/${projectId}/participants`,
            {
              method: 'GET',
              credentials: 'include',
            }
          );

          if (response.ok) {
            const participantData = await response.json();
            setParticipants(participantData || []);
          } else {
            setParticipants([]);
          }
        } catch (error) {
          console.error('Error fetching participants:', error);
          setParticipants([]);
        } finally {
          setParticipantsLoading(false);
        }
      } else if (project.participants) {
        // Use existing participant data
        setParticipants(project.participants);
      }

      if (!projectId) {
        setPermissionsLoading(false);
        return;
      }

      try {
        const status = await communityUtils.getProjectStatus(projectId);
        setPermissions(status.permissions);

        // Check for stored pending state first
        const storedPending = localStorage.getItem(
          `pending-request-${projectId}`
        );

        // If we have a stored pending state and no access, show pending
        if (storedPending && !status.permissions.hasAccess) {
          setRequestStatus('pending');
        } else {
          setRequestStatus(status.uiStatus);

          // Clear stored pending state if user now has access (request was accepted)
          if (status.permissions.hasAccess && storedPending) {
            localStorage.removeItem(`pending-request-${projectId}`);
          }
        }
      } catch (error) {
        console.error('Failed to load permissions:', error);

        // Check for stored pending state in fallback too
        const storedPending = localStorage.getItem(
          `pending-request-${projectId}`
        );

        if (storedPending) {
          setRequestStatus('pending');
        } else {
          // Fallback to basic ownership check if permissions fail
          const fallbackStatus = communityUtils.getCommunityUserStatus(
            currentUser.id,
            project
          );
          setRequestStatus(fallbackStatus === 'owner' ? 'owner' : 'none');
        }
      } finally {
        setPermissionsLoading(false);
      }
    };

    loadPermissions();
  }, [project.id, currentUser.id]);

  const handleRequestParticipation = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to get the project ID from different possible field names
      const projectId =
        project.id || (project as any).projectId || (project as any).project_id;

      if (!projectId) {
        console.error('Project ID is missing from community API response');
        setError(
          'Cannot send request: Project ID is missing from the server response. Please contact support.'
        );
        return;
      }

      await communityApi.requestParticipation(projectId, currentUser.id);

      // Immediately update to pending state
      setRequestStatus('pending');
      setSuccess('Participation request sent successfully!');

      // Store the pending state in localStorage so it persists across page refreshes
      localStorage.setItem(`pending-request-${projectId}`, 'true');

      onRequestSent?.();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to send request';

      // Check if error indicates already requested or already member
      if (
        errorMessage.includes('already') ||
        errorMessage.includes('pending') ||
        errorMessage.includes('member')
      ) {
        setRequestStatus('pending');
        setSuccess('You have already requested to join this project.');

        // Store the pending state
        const projectId =
          project.id ||
          (project as any).projectId ||
          (project as any).project_id;
        if (projectId) {
          localStorage.setItem(`pending-request-${projectId}`, 'true');
        }
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewProject = () => {
    // Try to get the project ID from different possible field names
    const projectId =
      project.id || (project as any).projectId || (project as any).project_id;

    if (!projectId) {
      console.error('Project ID is missing from community API response');
      console.error('Available fields:', Object.keys(project));
      setError(
        'Cannot view project: Project ID is missing from the server response. Please contact support.'
      );
      return;
    }

    navigate(`/project/${projectId}`);
  };

  const getStatusButton = () => {
    const projectId =
      project.id || (project as any).projectId || (project as any).project_id;

    // Show loading state while permissions are being fetched
    if (permissionsLoading) {
      return (
        <Button
          variant="outlined"
          disabled
          fullWidth
          startIcon={<CircularProgress size={16} />}
        >
          Loading...
        </Button>
      );
    }

    switch (requestStatus) {
      case 'owner':
        return (
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonIcon />}
            onClick={handleViewProject}
            disabled={!projectId}
            fullWidth
            title={!projectId ? 'Disabled: Missing project ID from server' : ''}
          >
            {!projectId ? 'Unavailable' : 'Your Project'}
          </Button>
        );
      case 'member':
        return (
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckIcon />}
            onClick={handleViewProject}
            disabled={!projectId}
            fullWidth
            title={!projectId ? 'Disabled: Missing project ID from server' : ''}
          >
            {!projectId ? 'Unavailable' : "You're a Member"}
          </Button>
        );
      case 'pending':
        return (
          <Button
            variant="outlined"
            color="warning"
            startIcon={<CloseIcon />}
            disabled
            fullWidth
          >
            Request Pending
          </Button>
        );
      case 'none':
        return (
          <Button
            variant="contained"
            color="secondary"
            startIcon={<SendIcon />}
            onClick={handleRequestParticipation}
            disabled={loading || !projectId}
            fullWidth
            title={
              !projectId
                ? 'Disabled: Missing project ID from server'
                : 'Send a request to join this project'
            }
          >
            {loading
              ? 'Sending...'
              : !projectId
                ? 'Unavailable'
                : 'Request to Join'}
          </Button>
        );
      default:
        return null;
    }
  };

  const getCategoryColor = (category?: string) => {
    const colors = {
      web: 'primary',
      mobile: 'secondary',
      desktop: 'success',
      game: 'warning',
      ai: 'info',
      other: 'default',
    };
    return colors[category?.toLowerCase() as keyof typeof colors] || 'default';
  };

  return (
    <>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#3a3a3a',
          '&:hover': {
            backgroundColor: '#404040',
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
            <Typography
              variant="h6"
              component="h2"
              sx={{
                color: '#e2e2e2',
                fontWeight: 'bold',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                flex: 1,
              }}
            >
              {project.name}
            </Typography>
            <Tooltip
              title={
                !project.id
                  ? 'View Project (Disabled: Missing project ID)'
                  : 'View Project'
              }
            >
              <IconButton
                onClick={handleViewProject}
                sx={{ color: !project.id ? '#666' : '#79799a' }}
                size="small"
                disabled={!project.id}
              >
                <LaunchIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {project.category && (
            <Box sx={{ mb: 2 }}>
              <Chip
                label={project.category}
                color={getCategoryColor(project.category) as any}
                size="small"
                sx={{ textTransform: 'capitalize' }}
              />
            </Box>
          )}

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              minHeight: '60px',
            }}
          >
            {project.description || 'No description available'}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <PersonIcon sx={{ color: '#79799a', mr: 1, fontSize: 20 }} />
            <Typography variant="body2" color="text.secondary">
              Owner: {project.owner?.username || 'Unknown'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <GroupIcon sx={{ color: '#79799a', mr: 1, fontSize: 20 }} />
            <Typography variant="body2" color="text.secondary">
              {participantsLoading
                ? 'Loading members...'
                : `${(participants?.length || 0) + 1} members`}
            </Typography>
          </Box>

          {project.dueDate && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CalendarIcon sx={{ color: '#79799a', mr: 1, fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">
                Due: {formatDate(project.dueDate)}
              </Typography>
            </Box>
          )}
        </CardContent>

        <CardActions sx={{ p: 2, pt: 0 }}>{getStatusButton()}</CardActions>
      </Card>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
    </>
  );
};
