import {
  Box,
  Card,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Chip,
  Paper,
  Container,
} from '@mui/material';
import { CalendarMonth as CalendarIcon } from '@mui/icons-material';
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

export const Calendar = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [calendarItems, setCalendarItems] = useState<CalendarItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'project' | 'goal' | 'task'
  >('all');
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
      weekday: 'short',
      year: 'numeric',
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

  const groupItemsByDate = () => {
    const grouped: { [key: string]: CalendarItem[] } = {};

    // Filter items based on active filter
    const filteredItems =
      activeFilter === 'all'
        ? calendarItems
        : calendarItems.filter((item) => item.type === activeFilter);

    filteredItems.forEach((item) => {
      const dateKey = item.dueDate.split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(item);
    });

    return grouped;
  };

  const handleFilterClick = (filter: 'all' | 'project' | 'goal' | 'task') => {
    setActiveFilter(filter);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  // Scroll to top when filter changes
  useEffect(() => {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }, 0);
  }, [activeFilter]);

  const handleItemClick = (item: CalendarItem) => {
    if (item.type === 'project') {
      navigate(`/project/${item.projectId}`);
    } else if (item.type === 'goal') {
      navigate(`/project/${item.projectId}`);
    } else if (item.type === 'task') {
      navigate(`/project/${item.projectId}`);
    }
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

  const groupedItems = groupItemsByDate();
  const sortedDates = Object.keys(groupedItems).sort();

  // Check if current filter has no results
  const hasFilteredResults = sortedDates.length > 0;

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
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 'bold' }}
          >
            Calendar
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View all upcoming deadlines
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
              the calendar
            </Typography>
          </Box>
        ) : (
          <Card
            variant="outlined"
            sx={{
              p: 3,
              backgroundColor: 'secondary.main',
              height: 'calc(100vh - 200px)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Fixed Header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 3,
                flexShrink: 0,
              }}
            >
              <CalendarIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              <Box>
                <Typography variant="h5" component="h2" gutterBottom>
                  Deadline Calendar
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {calendarItems.length} total deadlines
                </Typography>
              </Box>
            </Box>

            {/* Fixed Filter Chips */}
            {calendarItems.length > 0 && (
              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  backgroundColor: 'background.paper',
                  borderRadius: 1,
                  display: 'flex',
                  gap: 3,
                  flexWrap: 'wrap',
                  flexShrink: 0,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={`${calendarItems.filter((item) => item.type === 'project').length} Projects`}
                    size="small"
                    clickable
                    onClick={() => handleFilterClick('project')}
                    sx={{
                      backgroundColor:
                        activeFilter === 'project'
                          ? getTypeColor('project')
                          : 'transparent',
                      color:
                        activeFilter === 'project'
                          ? 'white'
                          : getTypeColor('project'),
                      fontWeight: 'bold',
                      border: `2px solid ${getTypeColor('project')}`,
                      '&:hover': {
                        backgroundColor: getTypeColor('project'),
                        color: 'white',
                      },
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={`${calendarItems.filter((item) => item.type === 'goal').length} Goals`}
                    size="small"
                    clickable
                    onClick={() => handleFilterClick('goal')}
                    sx={{
                      backgroundColor:
                        activeFilter === 'goal'
                          ? getTypeColor('goal')
                          : 'transparent',
                      color:
                        activeFilter === 'goal'
                          ? 'white'
                          : getTypeColor('goal'),
                      fontWeight: 'bold',
                      border: `2px solid ${getTypeColor('goal')}`,
                      '&:hover': {
                        backgroundColor: getTypeColor('goal'),
                        color: 'white',
                      },
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={`${calendarItems.filter((item) => item.type === 'task').length} Tasks`}
                    size="small"
                    clickable
                    onClick={() => handleFilterClick('task')}
                    sx={{
                      backgroundColor:
                        activeFilter === 'task'
                          ? getTypeColor('task')
                          : 'transparent',
                      color:
                        activeFilter === 'task'
                          ? 'white'
                          : getTypeColor('task'),
                      fontWeight: 'bold',
                      border: `2px solid ${getTypeColor('task')}`,
                      '&:hover': {
                        backgroundColor: getTypeColor('task'),
                        color: 'white',
                      },
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={`Total: ${calendarItems.length} deadlines`}
                    size="small"
                    clickable
                    onClick={() => handleFilterClick('all')}
                    sx={{
                      backgroundColor:
                        activeFilter === 'all' ? 'primary.main' : 'transparent',
                      color: activeFilter === 'all' ? 'white' : 'primary.main',
                      fontWeight: 'bold',
                      border: `2px solid ${getTypeColor('all')}`,
                      '&:hover': {
                        backgroundColor: getTypeColor('all'),
                        color: 'white',
                      },
                    }}
                  />
                </Box>
              </Box>
            )}

            {/* Scrollable Calendar Items */}
            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
              {hasFilteredResults ? (
                <Box>
                  {sortedDates.map((date) => (
                    <Paper
                      key={date}
                      elevation={2}
                      sx={{
                        p: 3,
                        backgroundColor: 'background.paper',
                        borderRadius: 2,
                        mb: 3,
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
                        {formatDate(date)}
                      </Typography>
                      <Grid container spacing={2}>
                        {groupedItems[date].map((item) => (
                          <Grid item xs={12} sm={6} md={4} key={item.id}>
                            <Card
                              variant="outlined"
                              sx={{
                                p: 2,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                  boxShadow: 3,
                                  borderColor: 'primary.main',
                                },
                              }}
                              onClick={() => handleItemClick(item)}
                            >
                              <Box
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'flex-start',
                                  mb: 1,
                                }}
                              >
                                <Chip
                                  label={item.type.toUpperCase()}
                                  size="small"
                                  sx={{
                                    backgroundColor: getTypeColor(item.type),
                                    color: 'white',
                                    fontWeight: 'bold',
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
                                    }}
                                  />
                                )}
                              </Box>
                              <Typography
                                variant="h6"
                                sx={{ mb: 1, fontWeight: 'medium' }}
                              >
                                {item.title}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 1 }}
                              >
                                {item.projectName}
                              </Typography>
                              {item.goalName && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ mb: 1 }}
                                >
                                  Goal: {item.goalName}
                                </Typography>
                              )}
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Paper>
                  ))}
                </Box>
              ) : (
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
                    No items match the current filter
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try changing the filter or create new items with due dates
                  </Typography>
                </Box>
              )}
            </Box>
          </Card>
        )}
      </Container>
    </>
  );
};
