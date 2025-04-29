import { Box, Link } from '@mui/material';
import { Navbar } from '../components/ui/navbar';
import { useEffect, useState } from 'react';
import { Goal, User } from '../types';
import { useParams } from 'react-router-dom';
import { HomeTitle } from '../components/home/HomeTitle';

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
          import.meta.env.VITE_SERVER_URL + '/project/' + id + '/goal/list',
          {
            method: 'GET',
            credentials: 'include',
          }
        );

        if (goalsResponse.ok) {
          const goals = await goalsResponse.json();
          console.log('goals', goals);
          setGoals(goals);
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
      <Link href={`/project/${id}/goal/create`} sx={{ textDecoration: 'none' }}>
        <HomeTitle title="New goal" fontSize="30px" />
      </Link>
      {goals ? (
        <Box
          sx={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            pt: '170px',
            px: '15px',
            width: '100%',
            gap: '20px',
            overflow: 'hidden',
          }}
        >
          {goals.map((goal) => (
            <Box key={goal.id}>
              <h2>{goal.name}</h2>
              <p>{goal.description}</p>
            </Box>
          ))}
        </Box>
      ) : (
        <HomeTitle title="No goals set" fontSize="30px" />
      )}
      <Navbar user={user} />
    </>
  );
};
