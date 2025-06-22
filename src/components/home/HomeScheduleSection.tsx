import {
  Box,
  CircularProgress,
  Alert,
  Typography,
  Button,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

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

  // Filter tasks by priority and upcoming deadlines
  const upcomingTasks = tasks
    .filter((task) => task.dueDate && new Date(task.dueDate) > new Date())
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    )
    .slice(0, 4);

  const highPriorityTasks = tasks
    .filter((task) => task.label === 'high' || task.label === 'urgent')
    .slice(0, 6);

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
              {tasks.length > 6 && (
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

        {/* High Priority Tasks Section */}
        <Box>
          <Typography
            variant="h6"
            sx={{ mb: { xs: 1, sm: 2 }, fontWeight: 'bold' }}
          >
            High Priority Tasks
          </Typography>

          {highPriorityTasks.length === 0 ? (
            <Box
              sx={{
                p: { xs: 2, sm: 3 },
                textAlign: 'center',
                backgroundColor: 'background.paper',
                borderRadius: 1,
                border: '1px dashed',
                borderColor: 'divider',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No high-priority tasks
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
                gap: { xs: 1, sm: 1.5 },
              }}
            >
              {highPriorityTasks.map((task) => (
                <Box key={task.id} sx={{ minHeight: '120px' }}>
                  <HomeTaskCard task={task} />
                </Box>
              ))}
              {highPriorityTasks.length > 6 && (
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
