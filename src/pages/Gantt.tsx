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

  // Calculate timeline dimensions
  const getTimelineDimensions = () => {
    if (calendarItems.length === 0)
      return { startDate: new Date(), endDate: new Date() };

    const dates = calendarItems.map((item) => new Date(item.dueDate));
    const startDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const endDate = new Date(Math.max(...dates.map((d) => d.getTime())));

    // Add some padding
    startDate.setDate(startDate.getDate() - 7);
    endDate.setDate(endDate.getDate() + 7);

    return { startDate, endDate };
  };

  // Calculate position on timeline
  const getTimelinePosition = (dateString: string) => {
    const { startDate, endDate } = getTimelineDimensions();
    const itemDate = new Date(dateString);
    const totalDays =
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const daysFromStart =
      (itemDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    return (daysFromStart / totalDays) * 100;
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

  const groupedItems = groupItemsByProject();
  const projectNames = Object.keys(groupedItems);
  const { startDate, endDate } = getTimelineDimensions();

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
              <TimelineIcon sx={{ color: 'white', fontSize: '1.5rem' }} />
            </Box>
            <Box>
              <Typography
                variant="h4"
                component="h1"
                sx={{ fontWeight: 'bold' }}
              >
                Gantt Chart
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Timeline view of all project deadlines
              </Typography>
            </Box>
          </Box>
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

            {/* Timeline Header */}
            <Box
              sx={{
                mb: 3,
                p: 2,
                backgroundColor: 'background.paper',
                borderRadius: 1,
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Timeline: {startDate.toLocaleDateString()} -{' '}
                {endDate.toLocaleDateString()}
              </Typography>
              <Box
                sx={{
                  height: '20px',
                  backgroundColor: 'grey.700',
                  borderRadius: '10px',
                  position: 'relative',
                  mb: 1,
                }}
              >
                {/* Today marker */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '-5px',
                    left: `${getTimelinePosition(new Date().toISOString())}%`,
                    width: '2px',
                    height: '30px',
                    backgroundColor: 'text.primary',
                    zIndex: 2,
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    position: 'absolute',
                    top: '25px',
                    left: `${getTimelinePosition(new Date().toISOString())}%`,
                    transform: 'translateX(-50%)',
                    color: 'text.primary',
                    fontWeight: 'bold',
                  }}
                >
                  Today
                </Typography>
              </Box>
            </Box>

            {/* Gantt Chart */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {projectNames.map((projectName) => (
                <Paper
                  key={projectName}
                  elevation={2}
                  sx={{
                    p: 2,
                    backgroundColor: 'background.paper',
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      fontWeight: 'bold',
                      color: 'primary.main',
                    }}
                  >
                    {projectName}
                  </Typography>

                  <Box
                    sx={{
                      position: 'relative',
                      height: '60px',
                      backgroundColor: 'grey.800',
                      borderRadius: '8px',
                      mb: 1,
                    }}
                  >
                    {/* Today marker for each project */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '0',
                        left: `${getTimelinePosition(new Date().toISOString())}%`,
                        width: '2px',
                        height: '100%',
                        backgroundColor: 'text.primary',
                        zIndex: 1,
                        opacity: 0.5,
                      }}
                    />

                    {/* Timeline items */}
                    {groupedItems[projectName].map((item, index) => {
                      const position = getTimelinePosition(item.dueDate);
                      return (
                        <Box
                          key={item.id}
                          sx={{
                            position: 'absolute',
                            left: `${position}%`,
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            cursor: 'pointer',
                            zIndex: 3,
                          }}
                          onClick={() => handleItemClick(item)}
                        >
                          <Box
                            sx={{
                              width: '12px',
                              height: '12px',
                              borderRadius: '50%',
                              backgroundColor: getTypeColor(item.type),
                              border: '2px solid white',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                              '&:hover': {
                                transform: 'scale(1.2)',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                              },
                              transition: 'all 0.2s ease-in-out',
                            }}
                          />
                          <Typography
                            variant="caption"
                            sx={{
                              position: 'absolute',
                              top: '20px',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              whiteSpace: 'nowrap',
                              fontSize: '0.7rem',
                              fontWeight: 'bold',
                              color: getTypeColor(item.type),
                            }}
                          >
                            {formatDate(item.dueDate)}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>

                  {/* Legend for this project */}
                  <Box
                    sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}
                  >
                    {groupedItems[projectName].map((item) => (
                      <Chip
                        key={item.id}
                        label={`${item.type.toUpperCase()}: ${item.title}`}
                        size="small"
                        sx={{
                          backgroundColor: getTypeColor(item.type),
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '0.7rem',
                          cursor: 'pointer',
                          '&:hover': {
                            opacity: 0.8,
                          },
                        }}
                        onClick={() => handleItemClick(item)}
                      />
                    ))}
                  </Box>
                </Paper>
              ))}
            </Box>
          </Card>
        )}
      </Container>
    </>
  );
};
