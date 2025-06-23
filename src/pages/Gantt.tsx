import {
  Box,
  Card,
  Typography,
  CircularProgress,
  Alert,
  Container,
  Chip,
  Paper,
  Grid,
} from '@mui/material';
import { Timeline as TimelineIcon } from '@mui/icons-material';
import { Navbar } from '../components/ui/navbar';
import { useEffect, useState } from 'react';
import { User, Project, Goal, Task } from '../types';
import { useNavigate } from 'react-router-dom';

interface CalendarItem {
  id: string;
  title: string;
  dueDate: string;
  type: 'project' | 'goal' | 'task';
  priority?: string;
  projectName?: string;
  goalName?: string;
  projectId?: number;
  goalId?: number;
}

export const Gantt = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [calendarItems, setCalendarItems] = useState<CalendarItem[]>([]);
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
        setUser(meData);

        // Fetch all data in parallel
        const [projectsResponse, goalsResponse, tasksResponse] =
          await Promise.all([
            fetch(import.meta.env.VITE_SERVER_URL + '/project/list', {
              method: 'GET',
              credentials: 'include',
            }),
            fetch(import.meta.env.VITE_SERVER_URL + '/project/goals/list', {
              method: 'GET',
              credentials: 'include',
            }),
            fetch(import.meta.env.VITE_SERVER_URL + '/project/tasks/list', {
              method: 'GET',
              credentials: 'include',
            }),
          ]);

        if (!projectsResponse.ok || !goalsResponse.ok || !tasksResponse.ok) {
          throw new Error('Failed to fetch calendar data');
        }

        const projects: Project[] = await projectsResponse.json();
        const goals: Goal[] = await goalsResponse.json();
        const tasks: Task[] = await tasksResponse.json();

        console.log('Projects:', projects);
        console.log('Goals:', goals);
        console.log('Tasks:', tasks);

        // Create a map of project names for quick lookup
        const projectMap = new Map();
        projects.forEach((project) => {
          projectMap.set(project.id, project.name);
        });

        // Create a map of goal names for quick lookup
        const goalMap = new Map();
        goals.forEach((goal) => {
          goalMap.set(goal.id, goal.name);
        });

        const allItems: CalendarItem[] = [];

        // Process projects with due dates
        projects.forEach((project) => {
          if (project.dueDate) {
            allItems.push({
              id: `project-${project.id}`,
              title: project.name,
              dueDate: project.dueDate,
              type: 'project',
              projectName: project.name,
              projectId: project.id,
            });
          }
        });

        // Process goals with due dates
        goals.forEach((goal) => {
          if (goal.dueDate) {
            const projectName = projectMap.get(goal.projectId);
            allItems.push({
              id: `goal-${goal.id}`,
              title: goal.name,
              dueDate: goal.dueDate,
              type: 'goal',
              projectName: projectName,
              goalName: goal.name,
              projectId: goal.projectId,
              goalId: goal.id,
            });
          }
        });

        // Process tasks with due dates
        tasks.forEach((task) => {
          if (task.dueDate) {
            const projectName = projectMap.get(task.projectId);
            const goalName = goalMap.get(task.goalId);
            allItems.push({
              id: `task-${task.id}`,
              title: task.name,
              dueDate: task.dueDate,
              type: 'task',
              priority: task.label,
              projectName: projectName,
              goalName: goalName,
              projectId: task.projectId,
              goalId: task.goalId,
            });
          }
        });

        console.log('All calendar items:', allItems);

        // Sort items by due date
        allItems.sort(
          (a, b) =>
            new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        );
        setCalendarItems(allItems);
      } catch (error) {
        console.error('Error fetching calendar data:', error);
        setError('An error occurred while loading calendar data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

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

  const getTypeColor = (type: 'project' | 'goal' | 'task') => {
    switch (type) {
      case 'project':
        return '#9c27b0';
      case 'goal':
        return '#3f51b5';
      case 'task':
        return '#009688';
      default:
        return '#757575';
    }
  };

  const handleItemClick = (item: CalendarItem) => {
    if (item.type === 'project') {
      navigate(`/project/${item.projectId}`);
    } else if (item.type === 'goal') {
      navigate(`/project/${item.projectId}`);
    } else if (item.type === 'task') {
      navigate(`/project/${item.projectId}`);
    }
  };

  // Group items by project for Gantt view
  const groupItemsByProject = () => {
    const grouped: { [key: string]: CalendarItem[] } = {};

    calendarItems.forEach((item) => {
      const projectName = item.projectName || 'Unknown Project';
      if (!grouped[projectName]) {
        grouped[projectName] = [];
      }
      grouped[projectName].push(item);
    });

    return grouped;
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

  const groupedItems = groupItemsByProject();
  const projectNames = Object.keys(groupedItems);

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
            Gantt Chart
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Timeline view of all project deadlines
          </Typography>
        </Box>

        {calendarItems.length === 0 ? (
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
              No deadlines to display
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create projects, goals, and tasks with due dates to see them in
              the Gantt chart
            </Typography>
          </Box>
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
              <TimelineIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              <Box>
                <Typography variant="h5" component="h2" gutterBottom>
                  Project Timeline
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {calendarItems.length} total deadlines across{' '}
                  {projectNames.length} projects
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {projectNames.map((projectName) => (
                <Paper
                  key={projectName}
                  elevation={2}
                  sx={{
                    p: 3,
                    backgroundColor: 'background.paper',
                    borderRadius: 2,
                    maxHeight: '400px',
                    overflow: 'auto',
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      fontWeight: 'bold',
                      color: 'primary.main',
                      borderBottom: '2px solid',
                      borderColor: 'primary.main',
                      pb: 1,
                    }}
                  >
                    {projectName}
                  </Typography>

                  <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
                    {groupedItems[projectName].map((item) => (
                      <Grid item xs={12} sm={6} md={4} key={item.id}>
                        <Card
                          variant="outlined"
                          sx={{
                            height: '140px',
                            display: 'flex',
                            flexDirection: 'column',
                            p: 1.5,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: 3,
                            },
                            borderLeft: `4px solid ${getTypeColor(item.type)}`,
                            overflow: 'hidden',
                          }}
                          onClick={() => handleItemClick(item)}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              mb: 0.5,
                            }}
                          >
                            <Chip
                              label={item.type.toUpperCase()}
                              size="small"
                              sx={{
                                backgroundColor: getTypeColor(item.type),
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '0.6rem',
                                height: '18px',
                              }}
                            />
                            {item.priority && (
                              <Chip
                                label={item.priority}
                                size="small"
                                sx={{
                                  backgroundColor: getPriorityColor(
                                    item.priority
                                  ),
                                  color: 'white',
                                  fontWeight: 'bold',
                                  fontSize: '0.6rem',
                                  height: '18px',
                                }}
                              />
                            )}
                          </Box>

                          <Typography
                            variant="body1"
                            sx={{
                              mb: 0.5,
                              fontWeight: 'medium',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontSize: '0.875rem',
                            }}
                          >
                            {item.title}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ mb: 0.5, fontSize: '0.7rem' }}
                          >
                            Due: {formatDate(item.dueDate)}
                          </Typography>

                          <Box sx={{ mt: 'auto', overflow: 'hidden' }}>
                            {item.goalName && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  fontSize: '0.7rem',
                                }}
                              >
                                Goal: {item.goalName}
                              </Typography>
                            )}
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              ))}
            </Box>
          </Card>
        )}
      </Container>
    </>
  );
};
