import { Box, CircularProgress, Alert, Typography } from '@mui/material';
import { HomeTitle } from './HomeTitle';
import { HomeTaskCard } from './HomeTaskCard';
import { useEffect, useState } from 'react';
import { Task } from '../../types';

interface TaskWithProject extends Task {
  projectName?: string;
  goalName?: string;
}

interface Project {
  id: number;
  name: string;
  userRole?: 'owner' | 'participant';
}

interface Goal {
  id: number;
  name: string;
  projectId: number;
}

export const HomeScheduleSection = () => {
  const [tasks, setTasks] = useState<TaskWithProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTasksFromAllProjects() {
      try {
        setLoading(true);
        setError(null);

        // Step 1: Fetch all accessible projects (owned + participated)
        const ownedProjectsResponse = await fetch(
          import.meta.env.VITE_SERVER_URL + '/project/list',
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          }
        );

        let allProjects: Project[] = [];

        // Add owned projects
        if (ownedProjectsResponse.ok) {
          const ownedProjects = await ownedProjectsResponse.json();
          allProjects = ownedProjects.map((project: any) => ({
            id: project.id,
            name: project.name,
            userRole: 'owner' as const,
          }));
        }

        // Add participated projects (with error handling)
        try {
          const participatedProjectsResponse = await fetch(
            import.meta.env.VITE_SERVER_URL + '/users/me/participated-projects',
            {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
            }
          );

          if (participatedProjectsResponse.ok) {
            const participatedProjects =
              await participatedProjectsResponse.json();
            const participatedProjectsWithRole = participatedProjects.map(
              (project: any) => ({
                id: project.id,
                name: project.name,
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

        console.log('All accessible projects for tasks:', allProjects);

        if (allProjects.length === 0) {
          setTasks([]);
          return;
        }

        // Step 2: Fetch goals and tasks from all accessible projects
        const allTasksPromises = allProjects.map(async (project) => {
          try {
            // Fetch goals for this project
            const goalsResponse = await fetch(
              `${import.meta.env.VITE_SERVER_URL}/project/${project.id}/goals`,
              {
                method: 'GET',
                credentials: 'include',
              }
            );

            let goals: Goal[] = [];
            if (goalsResponse.ok) {
              goals = await goalsResponse.json();
            }

            // Create goal name map for this project
            const goalMap = new Map<number, string>();
            goals.forEach((goal) => {
              goalMap.set(goal.id, goal.name);
            });

            // Fetch tasks for each goal
            const projectTasksPromises = goals.map(async (goal) => {
              try {
                const tasksResponse = await fetch(
                  `${import.meta.env.VITE_SERVER_URL}/project/${project.id}/goal/${goal.id}/tasks`,
                  {
                    method: 'GET',
                    credentials: 'include',
                  }
                );

                if (tasksResponse.ok) {
                  const goalTasks = await tasksResponse.json();
                  return goalTasks.map((task: Task) => ({
                    ...task,
                    projectName: project.name,
                    goalName: goal.name,
                  }));
                }
                return [];
              } catch (error) {
                console.error(
                  `Error fetching tasks for goal ${goal.id}:`,
                  error
                );
                return [];
              }
            });

            const projectTasks = await Promise.all(projectTasksPromises);
            return projectTasks.flat();
          } catch (error) {
            console.error(
              `Error fetching data for project ${project.id}:`,
              error
            );
            return [];
          }
        });

        // Step 3: Combine all tasks from all projects
        const allTasksArrays = await Promise.all(allTasksPromises);
        const allTasks = allTasksArrays.flat();

        console.log('All tasks from accessible projects:', allTasks);
        setTasks(allTasks);
      } catch (err) {
        console.error('Error in fetchTasksFromAllProjects:', err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchTasksFromAllProjects();
  }, []);

  // Filter tasks for upcoming and overdue
  const now = new Date();
  const incompleteTasks = tasks.filter((task) => !task.completed);
  const upcomingTasks = incompleteTasks
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
    .slice(0, 3);

  const overdueTasks = incompleteTasks
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
    .slice(0, 3);

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
                display: 'flex',
                gap: 1.5,
                maxWidth: '800px',
                overflow: 'hidden',
              }}
            >
              {overdueTasks.map((task, index) => (
                <Box
                  key={index}
                  sx={{ flex: 1, minHeight: '120px', minWidth: '150px' }}
                >
                  <HomeTaskCard task={task} />
                </Box>
              ))}
              {/* Add empty space to maintain 3-card width */}
              {Array.from({ length: Math.max(0, 3 - overdueTasks.length) }, (_, index) => (
                <Box
                  key={`empty-${index}`}
                  sx={{ flex: 1, minHeight: '120px', minWidth: '150px' }}
                />
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
                display: 'flex',
                gap: 1.5,
                maxWidth: '800px',
                overflow: 'hidden',
              }}
            >
              {upcomingTasks.map((task, index) => (
                <Box
                  key={index}
                  sx={{ flex: 1, minHeight: '120px', minWidth: '150px' }}
                >
                  <HomeTaskCard task={task} />
                </Box>
              ))}
              {/* Add empty space to maintain 3-card width */}
              {Array.from({ length: Math.max(0, 3 - upcomingTasks.length) }, (_, index) => (
                <Box
                  key={`empty-${index}`}
                  sx={{ flex: 1, minHeight: '120px', minWidth: '150px' }}
                />
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};
