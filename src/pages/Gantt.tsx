import {
  Box,
  Card,
  Typography,
  CircularProgress,
  Alert,
  Container,
  Chip,
  Paper,
} from '@mui/material';
import { Timeline as TimelineIcon } from '@mui/icons-material';
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

        console.log('All accessible projects for Gantt:', allProjects);

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

        console.log('All Gantt items from accessible projects:', allItems);

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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (calendarItems.length === 0)
      return { startDate: new Date(today), endDate: new Date(today) };

    const dates = calendarItems.map((item) => new Date(item.dueDate));
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

    // Add some padding
    minDate.setDate(minDate.getDate() - 7);
    maxDate.setDate(maxDate.getDate() + 7);

    // Ensure today is always included in the range
    const startDate = new Date(
      Math.min(minDate.getTime(), today.getTime() - 7 * 24 * 60 * 60 * 1000)
    );
    const endDate = new Date(
      Math.max(maxDate.getTime(), today.getTime() + 7 * 24 * 60 * 60 * 1000)
    );

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
          <TimelineIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Gantt Chart
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Timeline view of all your project deadlines
            </Typography>
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
                position: 'relative',
                height: '40px',
                backgroundColor: 'grey.900',
                borderRadius: '8px',
                mb: 3,
                overflow: 'hidden',
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'white',
                  fontWeight: 'bold',
                }}
              >
                {formatDate(startDate.toISOString())}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'white',
                  fontWeight: 'bold',
                }}
              >
                {formatDate(endDate.toISOString())}
              </Typography>
              {/* Today marker */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '0',
                  left: `${getTimelinePosition(new Date().toISOString())}%`,
                  width: '2px',
                  height: '100%',
                  backgroundColor: 'text.primary',
                  zIndex: 1,
                }}
              />
            </Box>

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
                            top: `${(index % 3) * 20}px`,
                            width: '12px',
                            height: '12px',
                            backgroundColor: getTypeColor(item.type),
                            borderRadius: '50%',
                            cursor: 'pointer',
                            transform: 'translateX(-50%)',
                            '&:hover': {
                              transform: 'translateX(-50%) scale(1.2)',
                              boxShadow: 2,
                            },
                          }}
                          onClick={() => handleItemClick(item)}
                        />
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
    </Box>
  );
};
