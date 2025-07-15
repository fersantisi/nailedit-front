import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Grid,
  CircularProgress,
  Alert,
  InputAdornment,
  Paper,
  Pagination,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Group as CommunityIcon,
} from '@mui/icons-material';
import { Navbar } from '../components/ui/navbar';
import { ProjectCard } from '../components/community/ProjectCard';
import { User, Project } from '../types';
import { communityApi } from '../utils/communityApi';
import { useNavigate } from 'react-router-dom';

export const Community: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserAndProjects();

    // Cleanup
    return () => {};
  }, []);

  const fetchUserAndProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch current user
      const meResponse = await fetch(
        import.meta.env.VITE_SERVER_URL + '/users/me',
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (!meResponse.ok) {
        navigate('/login');
        return;
      }

      const meData = await meResponse.json();
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
        navigate('/login');
        return;
      }

      // Fetch community projects
      await loadProjects();
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load community data');
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const projectsData = await communityApi.browseProjects();
      setProjects(projectsData);
      setIsSearchMode(false);
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error('Error loading projects:', error);

      // Provide specific error message based on the error type
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch community projects')) {
          setError(
            'Community projects are currently unavailable. The community endpoint may not be implemented on the backend.'
          );
        } else {
          setError(`Failed to load community projects: ${error.message}`);
        }
      } else {
        setError('Failed to load community projects. Please try again.');
      }

      // Don't clear projects array on error - keep showing previous data if available
      // setProjects([]);
    }
  };

  const handleSearch = async (query: string, page: number = 1) => {
    if (!query.trim()) {
      await loadProjects();
      return;
    }

    try {
      setSearchLoading(true);
      setError(null);

      console.log('Searching with query:', query, 'page:', page);
      const searchResult = await communityApi.searchProjects(query, page);
      console.log('Search result:', searchResult);

      setProjects(searchResult.projects);
      setTotalPages(searchResult.totalPages);
      setCurrentPage(page);
      setIsSearchMode(true);
    } catch (error) {
      console.error('Error searching projects:', error);

      // Check if the error is due to missing endpoint
      if (
        error instanceof Error &&
        error.message.includes('Failed to search projects')
      ) {
        setError(
          'Search functionality is currently unavailable. The search endpoint may not be implemented on the backend.'
        );
      } else {
        setError('Failed to search projects. Please try again.');
      }

      // Reset to browse mode if search fails
      setIsSearchMode(false);
      try {
        await loadProjects();
      } catch (browseError) {
        console.error(
          'Error loading projects after search failure:',
          browseError
        );
        setError('Failed to load projects. Please refresh the page.');
      }
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      handleSearch(searchQuery, 1);
    } catch (error) {
      console.error('Error in search submit:', error);
      setError('Failed to initiate search. Please try again.');
    }
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setCurrentPage(value);
    if (isSearchMode) {
      handleSearch(searchQuery, value);
    }
  };

  const handleRefresh = () => {
    setSearchQuery('');
    setCurrentPage(1);
    setTotalPages(1);
    loadProjects();
  };

  const handleRequestSent = () => {
    // Refresh the projects to update the status
    if (isSearchMode) {
      handleSearch(searchQuery, currentPage);
    } else {
      loadProjects();
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#2e2e2e' }}>
        <Navbar user={user} />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '50vh',
            }}
          >
            <CircularProgress />
          </Box>
        </Container>
      </Box>
    );
  }

  // Handle case where user failed to load but we're not loading anymore
  if (!user && !loading) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#2e2e2e' }}>
        <Navbar user={null} />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            Failed to load user information. Please try refreshing the page or
            log in again.
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#2e2e2e' }}>
      <Navbar user={user} />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CommunityIcon sx={{ mr: 2, color: '#79799a', fontSize: 40 }} />
            <Typography
              variant="h4"
              component="h1"
              sx={{ color: '#e2e2e2', fontWeight: 'bold' }}
            >
              Community Projects
            </Typography>
          </Box>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Discover and join exciting projects from the community
          </Typography>
        </Box>

        {/* Search and Filters */}
        <Paper
          sx={{
            p: 3,
            mb: 4,
            backgroundColor: '#3a3a3a',
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              mb: 2,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Box
              component="form"
              onSubmit={handleSearchSubmit}
              sx={{ flexGrow: 1, minWidth: 300 }}
            >
              <TextField
                fullWidth
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#79799a' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#2e2e2e',
                    '&:hover fieldset': { borderColor: '#79799a' },
                    '&.Mui-focused fieldset': { borderColor: '#79799a' },
                  },
                }}
              />
            </Box>

            <Tooltip title="Refresh">
              <IconButton onClick={handleRefresh} sx={{ color: '#79799a' }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Active filters */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {isSearchMode && searchQuery && (
              <Chip
                label={`Search: "${searchQuery}"`}
                onDelete={() => handleRefresh()}
                sx={{ backgroundColor: '#79799a', color: 'white' }}
              />
            )}
          </Box>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Backend Issue Alert */}
        {projects.length > 0 && !projects[0].id && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
              ⚠️ Backend Configuration Issue
            </Typography>
            <Typography variant="body2">
              The community API endpoints are missing project IDs in their
              response. Project viewing and participation requests are
              temporarily disabled. Please update the backend to include the{' '}
              <code>id</code> field in:
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              • <code>GET /community/browse</code>
              <br />• <code>GET /community/search</code>
            </Typography>
          </Alert>
        )}

        {/* Results Count */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" color="text.secondary">
            {searchLoading
              ? 'Searching...'
              : `Found ${projects.length} project${projects.length !== 1 ? 's' : ''}`}
          </Typography>
        </Box>

        {/* Projects Grid */}
        {searchLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : projects.length === 0 ? (
          <Paper
            sx={{
              p: 8,
              textAlign: 'center',
              backgroundColor: '#3a3a3a',
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              No projects found
            </Typography>
            <Typography color="text.secondary">
              {isSearchMode
                ? 'Try adjusting your search'
                : 'Be the first to share a project with the community!'}
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {projects.map((project, index) => {
              try {
                return (
                  <Grid item xs={12} sm={6} md={4} key={project.id || index}>
                    <ProjectCard
                      project={project}
                      currentUser={user!}
                      onRequestSent={handleRequestSent}
                    />
                  </Grid>
                );
              } catch (renderError) {
                console.error(
                  'Error rendering project card:',
                  renderError,
                  project
                );
                return (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Paper
                      sx={{ p: 2, backgroundColor: '#3a3a3a', borderRadius: 2 }}
                    >
                      <Alert severity="warning">
                        Failed to render project: {project.name || 'Unknown'}
                      </Alert>
                    </Paper>
                  </Grid>
                );
              }
            })}
          </Grid>
        )}

        {/* Pagination */}
        {isSearchMode && totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size="large"
            />
          </Box>
        )}
      </Container>
    </Box>
  );
};
