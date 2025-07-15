import {
  Box,
  CircularProgress,
  Alert,
  Typography,
  Button,
  Chip,
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
  userRole?: 'owner' | 'participant';
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

        // Fetch owned projects
        const ownedProjectsResponse = await fetch(
          import.meta.env.VITE_SERVER_URL + '/project/list',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          }
        );

        let allProjects: Project[] = [];

        if (ownedProjectsResponse.ok) {
          const ownedProjects = await ownedProjectsResponse.json();
          console.log('Owned projects:', ownedProjects);
          // Add role property to distinguish ownership
          allProjects = ownedProjects.map((project: any) => ({
            ...project,
            userRole: 'owner' as const,
          }));
        }

        // Fetch projects where user is a participant
        try {
          const participantProjectsResponse = await fetch(
            import.meta.env.VITE_SERVER_URL + '/users/me/participated-projects',
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
            }
          );

          if (participantProjectsResponse.ok) {
            const participantProjects =
              await participantProjectsResponse.json();
            console.log('Participated projects:', participantProjects);
            // Add role property and merge with owned projects
            const participantProjectsWithRole = participantProjects.map(
              (project: any) => ({
                ...project,
                userRole: 'participant' as const,
              })
            );

            // Merge projects, avoiding duplicates
            participantProjectsWithRole.forEach((project: any) => {
              if (!allProjects.find((p) => p.id === project.id)) {
                allProjects.push(project);
              }
            });
          } else {
            console.error('Failed to fetch participated projects');
          }
        } catch (error) {
          console.error('Error fetching participated projects:', error);
        }

        console.log('All projects (owned + participated):', allProjects);
        setProjects(allProjects);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  // Calculate project counts
  const ownedCount = projects.filter((p) => p.userRole === 'owner').length;
  const participantCount = projects.filter(
    (p) => p.userRole === 'participant'
  ).length;

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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <HomeTitle title="Projects" fontSize="30px" />
          {projects.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="body2" color="text.secondary">
                {projects.length} total project
                {projects.length !== 1 ? 's' : ''}
              </Typography>
              {ownedCount > 0 && participantCount > 0 && (
                <Typography variant="body2" color="text.secondary">
                  ({ownedCount} owned, {participantCount} as member)
                </Typography>
              )}
            </Box>
          )}
        </Box>
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
        </Box>
      ) : (
        <>
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
            {[...projects]
              .sort((a, b) => a.name.localeCompare(b.name))
              .slice(0, 4)
              .map((project: Project) => (
                <Box key={project.id} sx={{ minHeight: '200px' }}>
                  <HomeProjectCard project={project} />
                </Box>
              ))}
          </Box>
          {projects.length > 4 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => navigate('/project/list')}
              >
                View All Projects ({projects.length})
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};
