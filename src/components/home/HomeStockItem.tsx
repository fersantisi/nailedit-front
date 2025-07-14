import { Box, Typography, Chip, Card, CardContent } from '@mui/material';
import { WarningAmber } from '@mui/icons-material';

interface HomeStockItemProps {
  title: string;
  quantity: number;
  reserved: number;
  available: number;
  unit: string;
}

export const HomeStockItem = ({
  title,
  quantity,
  reserved,
  available,
  unit,
}: HomeStockItemProps) => {
  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        border: '1px solid',
        borderColor: 'rgba(244, 67, 54, 0.3)',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: 'rgba(244, 67, 54, 0.5)',
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(244, 67, 54, 0.2)',
        },
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent
        sx={{
          p: 2.5,
          '&:last-child': { pb: 2.5 },
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          height: '100%',
        }}
      >
        {/* Header with title */}
        <Box
          sx={{
            textAlign: 'center',
            mb: 1,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              fontSize: '16px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              mb: 1,
            }}
          >
            {title}
          </Typography>

          <Chip
            icon={<WarningAmber sx={{ fontSize: '14px' }} />}
            label="Out of Stock"
            size="small"
            sx={{
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
              color: '#f44336',
              borderColor: '#f44336',
              border: '1px solid',
              fontWeight: 500,
              fontSize: '11px',
              '& .MuiChip-icon': {
                color: '#f44336',
              },
            }}
          />
        </Box>

        {/* Stock information - vertical stack */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            flex: 1,
          }}
        >
          <Box
            sx={{
              textAlign: 'center',
              p: 1.5,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '6px',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: '11px',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                mb: 0.5,
              }}
            >
              Total Stock
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'text.primary',
                fontWeight: 600,
                fontSize: '18px',
              }}
            >
              {quantity}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '10px',
              }}
            >
              {unit}
            </Typography>
          </Box>

          <Box
            sx={{
              textAlign: 'center',
              p: 1.5,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '6px',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: '11px',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                mb: 0.5,
              }}
            >
              Reserved
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: '#ff9800',
                fontWeight: 600,
                fontSize: '18px',
              }}
            >
              {reserved}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '10px',
              }}
            >
              {unit}
            </Typography>
          </Box>

          <Box
            sx={{
              textAlign: 'center',
              p: 1.5,
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
              borderRadius: '6px',
              border: '1px solid rgba(244, 67, 54, 0.2)',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: '11px',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                mb: 0.5,
              }}
            >
              Available
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: '#f44336',
                fontWeight: 700,
                fontSize: '18px',
              }}
            >
              {available}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '10px',
              }}
            >
              {unit}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
