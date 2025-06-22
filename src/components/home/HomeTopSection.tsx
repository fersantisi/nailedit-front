import {
  Box,
  CircularProgress,
  Alert,
  Typography,
  Button,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { HomeTitle } from './HomeTitle';
import { HomeProjectCard } from './HomeProjectCard';
import { HomeMoreButton } from './HomeMoreButton';
import { useEffect, useState } from 'react';

interface Project {
  id: number;
  name: string;
  description: string;
  category?: string;
  dueDate?: string;
}

export const HomeTopSection = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          import.meta.env.VITE_SERVER_URL + '/project/list',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          }
        );

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
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          flex: 1,
          backgroundColor: 'secondary.main',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '300px',
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
          flex: 1,
          backgroundColor: 'secondary.main',
          borderRadius: '10px',
          p: 2,
        }}
      >
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        backgroundColor: 'secondary.main',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '10px',
        p: 3,
        minHeight: '300px',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <HomeTitle title="Projects" fontSize="30px" />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/project/create')}
          sx={{ minWidth: 'fit-content' }}
        >
          New Project
        </Button>
      </Box>

      {projects.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            textAlign: 'center',
            gap: 2,
          }}
        >
          <Typography variant="h6" color="text.secondary">
            No projects yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create your first project to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/project/create')}
          >
            Create First Project
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 3,
            flex: 1,
          }}
        >
          {projects.slice(0, 8).map((project: Project) => (
            <Box key={project.id} sx={{ minHeight: '200px' }}>
              <HomeProjectCard project={project} />
            </Box>
          ))}
          {projects.length > 8 && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <HomeMoreButton edge="100px" fontSize="20px" iconSize="50px" />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};
