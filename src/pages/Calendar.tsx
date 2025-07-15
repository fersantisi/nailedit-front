import {
  Box,
  Card,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Paper,
  Container,
  Grid,
} from '@mui/material';
import { CalendarMonth as CalendarIcon } from '@mui/icons-material';
import { Navbar } from '../components/ui/navbar';
import { useEffect, useState } from 'react';
import { User, Goal, Task } from '../types';
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

interface Project {
  id: number;
  name: string;
  dueDate?: string;
  userRole?: 'owner' | 'participant';
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

        // Step 1: Fetch all accessible projects (owned + participated)
        const ownedProjectsResponse = await fetch(
          import.meta.env.VITE_SERVER_URL + '/project/list',
          {
            method: 'GET',
            credentials: 'include',
          }
        );

        let allProjects: Project[] = [];

        // Add owned projects
        if (ownedProjectsResponse.ok) {
          const ownedProjects = await ownedProjectsResponse.json();
          console.log('Owned projects:', ownedProjects);
          allProjects = ownedProjects.map((project: any) => ({
            id: project.id,
            name: project.name,
            dueDate: project.dueDate,
            userRole: 'owner' as const,
          }));
        }

        // Add participated projects (with error handling)
        try {
          const participatedProjectsResponse = await fetch(
            import.meta.env.VITE_SERVER_URL + '/users/me/participated-projects',
            {
              method: 'GET',
              credentials: 'include',
            }
          );

          if (participatedProjectsResponse.ok) {
            const participatedProjects =
              await participatedProjectsResponse.json();
            console.log('Participated projects:', participatedProjects);
            const participatedProjectsWithRole = participatedProjects.map(
              (project: any) => ({
                id: project.id,
                name: project.name,
                dueDate: project.dueDate,
                userRole: 'participant' as const,
              })
            );

            // Merge projects, avoiding duplicates
            participatedProjectsWithRole.forEach((project: Project) => {
              if (!allProjects.find((p) => p.id === project.id)) {
                allProjects.push(project);
              }
            });
          }
        } catch (error) {
          console.error('Failed to fetch participated projects:', error);
          // Continue with only owned projects
        }

        console.log('All accessible projects for calendar:', allProjects);

        // Step 2: Fetch goals and tasks from all accessible projects
        const allCalendarItemsPromises = allProjects.map(async (project) => {
          const projectItems: CalendarItem[] = [];

          // Add project to calendar if it has a due date
          if (project.dueDate) {
            projectItems.push({
              id: `project-${project.id}`,
              title: project.name,
              dueDate: project.dueDate,
              type: 'project',
              projectName: project.name,
              projectId: project.id,
            });
          }

          try {
            // Fetch goals for this project
            const goalsResponse = await fetch(
              `${import.meta.env.VITE_SERVER_URL}/project/${project.id}/goals`,
              {
                method: 'GET',
                credentials: 'include',
              }
            );

            if (goalsResponse.ok) {
              const goals: Goal[] = await goalsResponse.json();
              console.log(`Goals for project ${project.id}:`, goals);

              // Process each goal
              for (const goal of goals) {
                // Add goal to calendar if it has a due date
                if (goal.dueDate) {
                  projectItems.push({
                    id: `goal-${goal.id}`,
                    title: goal.name,
                    dueDate: goal.dueDate,
                    type: 'goal',
                    projectName: project.name,
                    goalName: goal.name,
                    projectId: project.id,
                    goalId: goal.id,
                  });
                }

                // Fetch tasks for this goal
                try {
                  const tasksResponse = await fetch(
                    `${import.meta.env.VITE_SERVER_URL}/project/${project.id}/goal/${goal.id}/tasks`,
                    {
                      method: 'GET',
                      credentials: 'include',
                    }
                  );

                  if (tasksResponse.ok) {
                    const tasks: Task[] = await tasksResponse.json();
                    console.log(`Tasks for goal ${goal.id}:`, tasks);

                    // Add tasks with due dates to calendar
                    tasks.forEach((task) => {
                      if (task.dueDate) {
                        projectItems.push({
                          id: `task-${task.id}`,
                          title: task.name,
                          dueDate: task.dueDate,
                          type: 'task',
                          priority: task.label,
                          projectName: project.name,
                          goalName: goal.name,
                          projectId: project.id,
                          goalId: goal.id,
                        });
                      }
                    });
                  }
                } catch (error) {
                  console.error(
                    `Error fetching tasks for goal ${goal.id}:`,
                    error
                  );
                }
              }
            }
          } catch (error) {
            console.error(
              `Error fetching goals for project ${project.id}:`,
              error
            );
          }

          return projectItems;
        });

        // Step 3: Combine all calendar items from all projects
        const allItemsArrays = await Promise.all(allCalendarItemsPromises);
        const allItems = allItemsArrays.flat();

        console.log('All calendar items from accessible projects:', allItems);

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

  const getTypeColor = (type: 'project' | 'goal' | 'task' | 'all') => {
    switch (type) {
      case 'project':
        return '#9c27b0';
      case 'goal':
        return '#3f51b5';
      case 'task':
        return '#009688';
      case 'all':
        return '#1976d2';
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
  const dateKeys = Object.keys(groupedItems).sort();

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#2e2e2e' }}>
      <Navbar user={user} />
      <Container
        maxWidth="lg"
        sx={{
          py: 4,
          overflow: 'hidden',
          overflowX: 'hidden',
          minHeight: 'calc(100vh - 70px)',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            mb: 4,
            p: 3,
            backgroundColor: 'background.paper',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flexShrink: 0,
          }}
        >
          <CalendarIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Calendar
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View all your project deadlines, goals, and tasks in one place
            </Typography>
          </Box>
        </Box>

        {/* Filter Chips */}
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
                    activeFilter === 'goal' ? 'white' : getTypeColor('goal'),
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
                    activeFilter === 'task' ? 'white' : getTypeColor('task'),
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
                label={`${calendarItems.length} Total`}
                size="small"
                clickable
                onClick={() => handleFilterClick('all')}
                sx={{
                  backgroundColor:
                    activeFilter === 'all'
                      ? getTypeColor('all')
                      : 'transparent',
                  color: activeFilter === 'all' ? 'white' : getTypeColor('all'),
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

        {/* Calendar Items */}
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
              Create projects, goals, and tasks with due dates to see them here
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {dateKeys.map((dateKey) => (
              <Paper
                key={dateKey}
                elevation={2}
                sx={{
                  p: 3,
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
                    borderBottom: '2px solid',
                    borderColor: 'primary.main',
                    pb: 1,
                  }}
                >
                  {formatDate(dateKey)}
                </Typography>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, 1fr)',
                      md: 'repeat(3, 1fr)',
                    },
                    gap: 2,
                  }}
                >
                  {groupedItems[dateKey].map((item) => (
                    <Card
                      key={item.id}
                      variant="outlined"
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 3,
                          borderColor: getTypeColor(item.type),
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
                            fontSize: '0.7rem',
                          }}
                        />
                        {item.priority && (
                          <Chip
                            label={item.priority}
                            size="small"
                            sx={{
                              backgroundColor: getPriorityColor(item.priority),
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: '0.7rem',
                            }}
                          />
                        )}
                      </Box>

                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 'bold', mb: 1 }}
                      >
                        {item.title}
                      </Typography>

                      {item.projectName && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 0.5 }}
                        >
                          📁 {item.projectName}
                        </Typography>
                      )}

                      {item.goalName && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 0.5 }}
                        >
                          🎯 {item.goalName}
                        </Typography>
                      )}
                    </Card>
                  ))}
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
};
