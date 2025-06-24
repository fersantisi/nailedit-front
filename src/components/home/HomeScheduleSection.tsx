import { Box, CircularProgress, Alert, Typography } from '@mui/material';
import { HomeMoreButton } from './HomeMoreButton';
import { HomeTitle } from './HomeTitle';
import { HomeTaskCard } from './HomeTaskCard';
import { useEffect, useState } from 'react';
import { Task } from '../../types';

interface TaskWithProject extends Task {
  projectName?: string;
}

export const HomeScheduleSection = () => {
  const [tasks, setTasks] = useState<TaskWithProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTasks() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          import.meta.env.VITE_SERVER_URL + '/project/tasks/list',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }

        const data: Task[] = await response.json();

        // Fetch project information for each task
        const tasksWithProjects = await Promise.all(
          data.map(async (task) => {
            try {
              // The task already has projectId, we just need to fetch the project name
              if (task.projectId) {
                const projectResponse = await fetch(
                  `${import.meta.env.VITE_SERVER_URL}/project/${task.projectId}`,
                  {
                    method: 'GET',
                    credentials: 'include',
                  }
                );

                if (projectResponse.ok) {
                  const projectData = await projectResponse.json();
                  return {
                    ...task,
                    projectName: projectData.name,
                  };
                }
              }

              // Fallback if project fetch fails
              return {
                ...task,
                projectName: `Project ${task.projectId}`,
              };
            } catch (error) {
              console.error('Error fetching project info for task:', error);
              return {
                ...task,
                projectName: `Project ${task.projectId}`,
              };
            }
          })
        );

        setTasks(tasksWithProjects);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, []);

  // Filter tasks for upcoming and overdue
  const now = new Date();
  const upcomingTasks = tasks
    .filter((task) => {
      if (!task.dueDate) return false;
      const due = new Date(task.dueDate);
      return due > now;
    })
    .sort((a, b) => {
      const aDue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
      const bDue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
      return aDue - bDue;
    })
    .slice(0, 4);

  const overdueTasks = tasks
    .filter((task) => {
      if (!task.dueDate) return false;
      const due = new Date(task.dueDate);
      return due < now;
    })
    .sort((a, b) => {
      const aDue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
      const bDue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
      return bDue - aDue;
    })
    .slice(0, 4);

  if (loading) {
    return (
      <Box
        sx={{
          width: { xs: '100%', md: '50%' },
          backgroundColor: 'secondary.main',
          borderRadius: '10px',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          width: { xs: '100%', md: '50%' },
          backgroundColor: 'secondary.main',
          borderRadius: '10px',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: { xs: '100%', md: '50%' },
        backgroundColor: 'secondary.main',
        borderRadius: '10px',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <HomeTitle title="Schedule" fontSize="30px" />
      </Box>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Overdue Tasks Section */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Overdue Tasks
          </Typography>
          {overdueTasks.length === 0 ? (
            <Box
              sx={{
                p: 3,
                textAlign: 'center',
                backgroundColor: 'background.paper',
                borderRadius: 1,
                border: '1px dashed',
                borderColor: 'divider',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No overdue tasks
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(2, 1fr)',
                  sm: 'repeat(3, 1fr)',
                  md: 'repeat(4, 1fr)',
                },
                gap: 1.5,
              }}
            >
              {overdueTasks.map((task) => (
                <Box key={task.id} sx={{ minHeight: '120px' }}>
                  <HomeTaskCard task={task} />
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Upcoming Deadlines Section */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Upcoming Deadlines
          </Typography>

          {upcomingTasks.length === 0 ? (
            <Box
              sx={{
                p: 3,
                textAlign: 'center',
                backgroundColor: 'background.paper',
                borderRadius: 1,
                border: '1px dashed',
                borderColor: 'divider',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No upcoming tasks
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(2, 1fr)',
                  sm: 'repeat(3, 1fr)',
                  md: 'repeat(4, 1fr)',
                },
                gap: 1.5,
              }}
            >
              {upcomingTasks.map((task) => (
                <Box key={task.id} sx={{ minHeight: '120px' }}>
                  <HomeTaskCard task={task} />
                </Box>
              ))}
              {tasks.length > 8 && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <HomeMoreButton edge="50px" fontSize="15px" iconSize="30px" />
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};
