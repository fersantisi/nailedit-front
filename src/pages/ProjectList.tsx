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
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Folder as ProjectIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
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
          overflow: 'hidden',
          overflowX: 'hidden',
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
        <Container
          sx={{ pt: 3, pb: '80px', overflow: 'hidden', overflowX: 'hidden' }}
        >
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
        sx={{
          pt: 3,
          pb: '80px',
          px: { xs: 2, sm: 3, md: 4 },
          minHeight: 'calc(100vh - 70px)',
          overflow: 'hidden',
          overflowX: 'hidden',
        }}
      >
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box
              sx={{
                backgroundColor: 'primary.main',
                borderRadius: '50%',
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ProjectIcon sx={{ color: 'white', fontSize: '1.5rem' }} />
            </Box>
            <Box>
              <Typography
                variant="h4"
                component="h1"
                sx={{ fontWeight: 'bold' }}
              >
                My Projects
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {projects.length} total projects
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Content Section */}
        {projects.length === 0 ? (
          <Card
            variant="outlined"
            sx={{
              p: 6,
              textAlign: 'center',
              backgroundColor: 'background.paper',
              borderRadius: 3,
              border: '2px dashed',
              borderColor: 'divider',
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            <Box
              sx={{
                backgroundColor: 'grey.100',
                borderRadius: '50%',
                width: 80,
                height: 80,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <ProjectIcon sx={{ fontSize: 40, color: 'grey.500' }} />
            </Box>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              No projects yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Create your first project to get started with project management
            </Typography>
            <Fab
              color="primary"
              variant="extended"
              onClick={() => navigate('/project/create')}
              sx={{ px: 3 }}
            >
              <AddIcon sx={{ mr: 1 }} />
              Create Project
            </Fab>
          </Card>
        ) : (
          <Card
            variant="outlined"
            sx={{
              p: 3,
              backgroundColor: 'secondary.main',
              maxHeight: '80vh',
              overflow: 'auto',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 3,
              }}
            >
              <ProjectIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              <Box>
                <Typography variant="h5" component="h2" gutterBottom>
                  Project Overview
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {projects.length} total projects
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={3}>
              {projects.map((project) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={project.id}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6,
                        borderColor: 'primary.main',
                      },
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    onClick={() => navigate(`/project/${project.id}`)}
                  >
                    {/* Header with Icon and Title */}
                    <Box sx={{ p: 2.5, pb: 2 }}>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', mb: 2 }}
                      >
                        <Box
                          sx={{
                            backgroundColor: 'primary.main',
                            borderRadius: '50%',
                            p: 1,
                            mr: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <ProjectIcon
                            sx={{ color: 'white', fontSize: '1.2rem' }}
                          />
                        </Box>
                        <Typography
                          variant="h6"
                          component="h3"
                          sx={{
                            fontWeight: 'bold',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: 'text.primary',
                            fontSize: '1.1rem',
                          }}
                        >
                          {project.name}
                        </Typography>
                      </Box>

                      {/* Description */}
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: 1.5,
                          fontSize: '0.875rem',
                          mb: 2,
                        }}
                      >
                        {project.description || 'No description'}
                      </Typography>
                    </Box>

                    {/* Chips Section */}
                    <Box sx={{ p: 2.5, pt: 0, mt: 'auto' }}>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1,
                        }}
                      >
                        <Chip
                          label={project.category || 'Uncategorized'}
                          size="small"
                          color="success"
                          variant="filled"
                          sx={{
                            fontWeight: 'bold',
                            fontSize: '0.75rem',
                            height: '24px',
                            alignSelf: 'flex-start',
                          }}
                        />
                        {project.dueDate && (
                          <Chip
                            icon={<CalendarIcon />}
                            label={formatDate(project.dueDate)}
                            size="small"
                            color="warning"
                            variant="filled"
                            sx={{
                              pl: 1,
                              fontWeight: 'bold',
                              fontSize: '0.75rem',
                              height: '24px',
                              alignSelf: 'flex-start',
                              '& .MuiChip-icon': {
                                ml: 0.5,
                                fontSize: '0.9rem',
                              },
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Card>
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
