import { Box, Typography } from '@mui/material';
import { HomeStockItem } from './HomeStockItem';
import { Stock } from '../../types';

interface HomeStockListProps {
  stockItems: Stock[];
  emptyMessage: string;
}

export const HomeStockList = ({
  stockItems,
  emptyMessage,
}: HomeStockListProps) => {
  if (stockItems.length === 0) {
    return (
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
          No items are currently out of stock
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)',
        },
        gap: 2,
        maxHeight: '600px',
        overflow: 'auto',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: 'rgba(255, 255, 255, 0.3)',
        },
      }}
    >
      {stockItems.map((stock) => {
        const available = stock.quantity - stock.reserved;

        return (
          <HomeStockItem
            key={stock.id}
            title={stock.itemName}
            quantity={stock.quantity}
            reserved={stock.reserved}
            available={available}
            unit={stock.unit}
          />
        );
      })}
    </Box>
  );
};
