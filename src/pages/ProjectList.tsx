import {
  Box,
  Card,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Chip,
  Fab,
  Container,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { Navbar } from '../components/ui/navbar';
import { useEffect, useState } from 'react';
import { User, Project } from '../types';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../utils/dateUtils';

export const ProjectList = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch current user session
        const meResponse = await fetch(
          import.meta.env.VITE_SERVER_URL + '/users/me',
          {
            method: 'GET',
            credentials: 'include',
          }
        );

        if (!meResponse.ok) {
          setUser(null);
          navigate('/login');
          return;
        }

        const meData = await meResponse.json();
        console.log('meData', meData);

        const userId = meData.userId;

        const profileResponse = await fetch(
          import.meta.env.VITE_SERVER_URL + `/users/profile/${userId}`,
          {
            method: 'GET',
            credentials: 'include',
          }
        );

        if (profileResponse.ok) {
          const userData = await profileResponse.json();
          setUser(userData);
        } else {
          setUser(null);
          navigate('/login');
          return;
        }

        // Fetch all projects
        const projectsResponse = await fetch(
          import.meta.env.VITE_SERVER_URL + '/project/list',
          {
            method: 'GET',
            credentials: 'include',
          }
        );

        if (!projectsResponse.ok) {
          throw new Error('Failed to fetch projects');
        }

        const projectsData: Project[] = await projectsResponse.json();
        console.log('Projects:', projectsData);
        setProjects(projectsData);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setError('An error occurred while loading projects');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return '#f44336';
      case 'high':
        return '#ff9800';
      case 'medium':
        return '#2196f3';
      case 'low':
        return '#4caf50';
      default:
        return '#757575';
    }
  };

  const getStatusColor = (dueDate?: string) => {
    if (!dueDate) return '#757575';

    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return '#f44336'; // Overdue
    if (diffDays <= 3) return '#ff9800'; // Due soon
    if (diffDays <= 7) return '#2196f3'; // Due this week
    return '#4caf50'; // On track
  };

  const getStatusText = (dueDate?: string) => {
    if (!dueDate) return 'No due date';

    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays <= 7) return `Due in ${diffDays} days`;
    return `Due in ${diffDays} days`;
  };

  if (loading) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <>
        <Navbar user={user} />
        <Container sx={{ pt: 3, pb: '80px' }}>
          <Alert severity="error">{error}</Alert>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar user={user} />
      <Container
        maxWidth={false}
        sx={{ pt: 3, pb: '80px', px: { xs: 2, sm: 3, md: 4 } }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 'bold' }}
          >
            My Projects
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and track all your projects
          </Typography>
        </Box>

        {projects.length === 0 ? (
          <Box
            sx={{
              p: 4,
              textAlign: 'center',
              backgroundColor: 'background.paper',
              borderRadius: 2,
              border: '1px dashed',
              borderColor: 'divider',
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No projects yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create your first project to get started
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {projects.map((project) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={project.id}>
                <Card
                  variant="outlined"
                  sx={{
                    p: 3,
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                  onClick={() => navigate(`/project/${project.id}`)}
                >
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="h6"
                      component="h2"
                      gutterBottom
                      sx={{ fontWeight: 'bold' }}
                    >
                      {project.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {project.description || 'No description'}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={project.category || 'Uncategorized'}
                      size="small"
                      sx={{
                        backgroundColor: 'primary.main',
                        color: 'white',
                        fontWeight: 'bold',
                      }}
                    />
                  </Box>

                  {project.dueDate && (
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={getStatusText(project.dueDate)}
                        size="small"
                        sx={{
                          backgroundColor: getStatusColor(project.dueDate),
                          color: 'white',
                          fontWeight: 'bold',
                        }}
                      />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mt: 1 }}
                      >
                        Due: {formatDate(project.dueDate)}
                      </Typography>
                    </Box>
                  )}

                  <Box
                    sx={{
                      mt: 'auto',
                      pt: 2,
                      borderTop: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Click to view details
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Floating Action Button for creating new project */}
        <Fab
          color="primary"
          aria-label="add project"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
          onClick={() => navigate('/project/create')}
        >
          <AddIcon />
        </Fab>
      </Container>
    </>
  );
};
