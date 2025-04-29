import { Box, Link } from '@mui/material';
import { Navbar } from '../components/ui/navbar';
import { useEffect, useState } from 'react';
import { Goal, User } from '../types';
import { useParams } from 'react-router-dom';
import { HomeTitle } from '../components/home/HomeTitle';
import { Card } from '../components/ui/card';
import DeleteGoal from '../components/project/DeleteGoal';
import DeleteTask from '../components/project/DeleteTask';
import DeleteProject from '../components/project/DeleteProject';

export const Project = () => {
  const { id } = useParams<{ id: string }>();
  const [goals, setGoals] = useState<Goal[] | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!id) {
      console.error('Project ID is not defined');
      return;
    }
    const fetchUser = async () => {
      try {
        const meResponse = await fetch(
          import.meta.env.VITE_SERVER_URL + '/users/me',
          {
            method: 'GET',
            credentials: 'include',
          }
        );

        if (!meResponse.ok) {
          setUser(null);
          return;
        }

        const meData = await meResponse.json();
        console.log('meData', meData);

        setUser(meData);

        console.log('ProjectId: ', id);

        const goalsResponse = await fetch(
          import.meta.env.VITE_SERVER_URL + '/project/' + id + '/goals',
          {
            method: 'GET',
            credentials: 'include',
          }
        );

        if (goalsResponse.ok) {
          const goalsData = await goalsResponse.json();
          const goalsWithTasks = await Promise.all(
            goalsData.map(async (goal: Goal) => {
              const tasksResponse = await fetch(
                import.meta.env.VITE_SERVER_URL +
                  '/project/' +
                  id +
                  '/goal/' +
                  goal.id +
                  '/tasks',
                {
                  method: 'GET',
                  credentials: 'include',
                }
              );

              if (tasksResponse.ok) {
                const tasks = await tasksResponse.json();
                return { ...goal, tasks };
              }
              console.log('Error fetching tasks for goal:', goal);

              return { ...goal, tasks: [] };
            })
          );
          setGoals(goalsWithTasks);
        } else {
          setGoals(null);
        }
      } catch (error) {
        console.error('Error fetching user or goals:', error);
        setUser(null);
        setGoals(null);
      }
    };

    fetchUser();
  }, [id]);

  return (
    <>
      <Link
        href={`/project/${id}/edit`}
        style={{ textDecoration: 'none' }}
      >
        <HomeTitle title="Edit project" fontSize="30px" />
      </Link>
      <Link
        href={`/project/${id}/goal/create`}
        style={{ textDecoration: 'none' }}
      >
        <HomeTitle title="New goal" fontSize="30px" />
      </Link>
      <DeleteProject projectId={id} />

      {goals?.length ? (
        <Box
          sx={{
            pt: '170px',
            px: '15px',
            gap: '20px',
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          {goals.map((goal) => (
            <Card>
              <Box key={goal.id}>
                <h2>Goal: {goal.name}</h2>
                <p>Description: {goal.description}</p>
                <DeleteGoal goalId={goal.id} projectId={id} />
                <ul>
                  {goal.tasks?.map((task) => (
                    <li key={task.id}>
                      Task: {task.name}
                      <DeleteTask goalId={goal.id} projectId={id} taskId={task.id} />
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/project/${id}/goal/${goal.id}/task/create`}
                  style={{ textDecoration: 'none' }}
                >
                  <HomeTitle title="New task" fontSize="30px" />
                </Link>
              </Box>
            </Card>
          ))}
        </Box>
      ) : (
        <HomeTitle title="No goals set" fontSize="30px" />
      )}

      <Navbar user={user} />
    </>
  );
};
