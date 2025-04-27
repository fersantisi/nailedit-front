import { Box } from '@mui/material';
import { HomeTitle } from './HomeTitle';
import { HomeProjectCard } from './HomeProjectCard';
import { HomeMoreButton } from './HomeMoreButton';
import { useEffect, useState } from 'react';

interface Project {
  id: number;
  name: string;
  description: string;
}

export const HomeTopSection = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const mockProjects: Project[] = [
    {
      id: 1,
      name: 'Project Alpha',
      description: 'Description of Project Alpha',
    },
    { id: 2, name: 'Project Beta', description: 'Description of Project Beta' },
    {
      id: 3,
      name: 'Project Gamma',
      description: 'Description of Project Gamma',
    },
    {
      id: 4,
      name: 'Project Delta',
      description: 'Description of Project Delta',
    },
    {
      id: 5,
      name: 'Project Epsilon',
      description: 'Description of Project Epsilon',
    },
    { id: 6, name: 'Project Zeta', description: 'Description of Project Zeta' },
  ];

  /* useEffect(() => {
    async function fetchProjects() {
      try {
        const token = localStorage.getItem('token');

        const response = await fetch('/api/projects', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }

        const data: Project[] = await response.json();
        setProjects(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []); */

  useEffect(() => {
    async function fetchProjects() {
      try {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        setProjects(mockProjects);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  if (loading) return <div>Loading projects...</div>;

  return (
    <Box
      sx={{
        flex: 1,
        backgroundColor: 'secondary.main',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: '10px',
        flexWrap: 'wrap',
        minHeight: 0,
      }}
    >
      <HomeTitle title="Projects" fontSize="30px" />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          alignItems: 'space-evenly',
          flexWrap: 'wrap',
          width: '100%',
          gap: '20px',
          height: '80%',
          pb: '10px',
        }}
      >
        {projects.map(
          (project: Project, index: number) =>
            index < 5 && <HomeProjectCard project={project} />
        )}
        {projects.length > 5 ? (
          <HomeMoreButton edge="100px" fontSize="20px" iconSize="50px" />
        ) : null}
        {projects.length === 0 || error ? (
          <HomeTitle title="No projects available" fontSize="20px" />
        ) : null}
      </Box>
    </Box>
  );
};
