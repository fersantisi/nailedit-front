import { Box, CircularProgress, Alert } from '@mui/material';
import { HomeTitle } from './HomeTitle';
import { HomeResourceList } from './HomeResourceList';
import { useEffect, useState } from 'react';
import { Resource } from '../../types';

export const HomeResourcesSection = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResources() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          import.meta.env.VITE_SERVER_URL + '/resources/list',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch resources');
        }

        const data: Resource[] = await response.json();
        setResources(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchResources();
  }, []);

  // Filter resources for wishlist (low stock) and nearly out of stock
  const wishlistResources = resources
    .filter((resource) => resource.stock < resource.amount * 0.5)
    .slice(0, 5);

  const lowStockResources = resources
    .filter((resource) => resource.stock < resource.amount * 0.2)
    .slice(0, 5);

  if (loading) {
    return (
      <Box
        sx={{
          width: { xs: '100%', md: '50%' },
          backgroundColor: 'secondary.main',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
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
        width: { xs: '100%', md: '50%' },
        backgroundColor: 'secondary.main',
        borderRadius: '10px',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <HomeTitle title="Resources" fontSize="30px" />

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box>
          <HomeTitle title="Wishlist" fontSize="20px" />
          <HomeResourceList
            resources={wishlistResources}
            emptyMessage="No items in wishlist"
          />
        </Box>

        <Box>
          <HomeTitle title="Nearly Out Of Stock" fontSize="20px" />
          <HomeResourceList
            resources={lowStockResources}
            emptyMessage="No low stock items"
          />
        </Box>
      </Box>
    </Box>
  );
};
