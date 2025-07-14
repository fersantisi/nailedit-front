import { Box, CircularProgress, Alert } from '@mui/material';
import { HomeTitle } from './HomeTitle';
import { HomeStockList } from './HomeStockList';
import { useEffect, useState } from 'react';
import { Stock } from '../../types';

export const HomeResourcesSection = () => {
  const [stockItems, setStockItems] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStock() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          import.meta.env.VITE_SERVER_URL + '/stock',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch stock data');
        }

        const data: Stock[] = await response.json();
        setStockItems(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchStock();
  }, []);

  // Filter stock items for out of stock only
  const outOfStockItems = stockItems
    .filter((stock) => {
      const available = stock.quantity - stock.reserved;
      return available <= 0;
    })
    .slice(0, 6); // Show up to 6 items

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
      <HomeTitle title="Out of Stock Items" fontSize="30px" />

      <HomeStockList
        stockItems={outOfStockItems}
        emptyMessage="Great! No items are currently out of stock"
      />
    </Box>
  );
};
