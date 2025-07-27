import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Fab,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Inventory as InventoryIcon,
  PlayArrow as UseIcon,
} from '@mui/icons-material';
import { Stock, ProjectPermissions } from '../../types';

interface ProjectStockSectionProps {
  projectId: string;
  permissions: ProjectPermissions;
}

interface ProjectReservedStock {
  id: number;
  stockId: number;
  projectId: number;
  quantity: number;
  stockItem: Stock;
}

export const ProjectStockSection: React.FC<ProjectStockSectionProps> = ({
  projectId,
  permissions,
}) => {
  const [allStockItems, setAllStockItems] = useState<Stock[]>([]);
  const [projectReservedStock, setProjectReservedStock] = useState<
    ProjectReservedStock[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Add new reservation dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedStockId, setSelectedStockId] = useState<number>(0);
  const [newQuantity, setNewQuantity] = useState<number>(1);

  // Update quantity dialog
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] =
    useState<ProjectReservedStock | null>(null);
  const [updateQuantity, setUpdateQuantity] = useState<number>(1);

  // Use reserved stock dialog
  const [useDialogOpen, setUseDialogOpen] = useState(false);
  const [selectedReservationForUse, setSelectedReservationForUse] =
    useState<ProjectReservedStock | null>(null);
  const [useQuantity, setUseQuantity] = useState<number>(1);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const API_BASE_URL = import.meta.env.VITE_SERVER_URL;

  // Check if current user is the project owner
  const isOwner = permissions.role === 'owner';
  const isViewer = permissions.role === 'viewer';

  useEffect(() => {
    fetchAllStockItems();
    fetchProjectReservedStock();
  }, []);

  // Refresh data when component becomes visible (e.g., after navigating back from stock page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchAllStockItems();
        fetchProjectReservedStock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const fetchAllStockItems = async () => {
    try {
      setLoading(true);
      // Add cache busting to ensure fresh data
      const response = await fetch(`${API_BASE_URL}/stock?t=${Date.now()}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(
          'Stock items fetched:',
          data.map((item: Stock) => ({
            id: item.id,
            itemName: item.itemName,
            quantity: item.quantity,
            reserved: item.reserved,
          }))
        );
        setAllStockItems(data);
        return data; // Return the new data
      } else {
        showSnackbar('Error fetching stock items', 'error');
        return null;
      }
    } catch (error) {
      console.error('Error fetching stock items:', error);
      showSnackbar('Error fetching stock items', 'error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectReservedStock = async () => {
    try {
      // Add cache busting to ensure fresh data
      const response = await fetch(
        `${API_BASE_URL}/stock/projects/${projectId}/reserved?t=${Date.now()}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Project reservations fetched:', data);

        setProjectReservedStock(data);
        return data; // Return the new data
      } else {
        console.error('Error fetching project reserved stock');
        return null;
      }
    } catch (error) {
      console.error('Error fetching project reserved stock:', error);
      return null;
    }
  };

  const handleAddNewReservation = async () => {
    if (selectedStockId === 0) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/stock/${selectedStockId}/reserve/${projectId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ quantity: newQuantity }),
        }
      );

      if (response.ok) {
        await fetchProjectReservedStock();
        await fetchAllStockItems();
        setAddDialogOpen(false);
        setSelectedStockId(0);
        setNewQuantity(1);
        showSnackbar('Stock reserved successfully', 'success');
      } else {
        const errorData = await response.json();
        showSnackbar(errorData.message || 'Error reserving stock', 'error');
      }
    } catch (error) {
      console.error('Error reserving stock:', error);
      showSnackbar('Error reserving stock', 'error');
    }
  };

  const handleUpdateQuantity = async () => {
    if (!selectedReservation) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/stock/reserved/${selectedReservation.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ quantity: updateQuantity }),
        }
      );

      if (response.ok) {
        await fetchProjectReservedStock();
        await fetchAllStockItems();
        setUpdateDialogOpen(false);
        setSelectedReservation(null);
        setUpdateQuantity(1);
        showSnackbar('Reservation updated successfully', 'success');
      } else {
        const errorData = await response.json();
        showSnackbar(
          errorData.message || 'Error updating reservation',
          'error'
        );
      }
    } catch (error) {
      console.error('Error updating reservation:', error);
      showSnackbar('Error updating reservation', 'error');
    }
  };

  const handleUseReservedStock = async () => {
    if (!selectedReservationForUse) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/stock/reserved/${selectedReservationForUse.id}/use`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ quantity: useQuantity }),
        }
      );

      if (response.ok) {
        // Wait for data refresh to complete before showing success
        try {
          console.log(
            'Use stock API call successful, waiting before refresh...'
          );
          console.log(
            'Before refresh - Current reservations:',
            projectReservedStock.map((r) => ({
              id: r.id,
              stockId: r.stockId,
              quantity: r.quantity,
              itemName: r.stockItem?.itemName,
            }))
          );
          console.log(
            'Before refresh - Current stock items:',
            allStockItems.map((item) => ({
              id: item.id,
              itemName: item.itemName,
              quantity: item.quantity,
              reserved: item.reserved,
            }))
          );

          // Add delay to ensure backend has processed the change
          await new Promise((resolve) => setTimeout(resolve, 500));

          console.log('Starting data refresh...');
          const newReservations = await fetchProjectReservedStock();
          console.log('Project reservations refreshed');
          console.log(
            'After refresh - New reservations:',
            newReservations?.map((r: any) => ({
              id: r.id,
              stockId: r.stockId,
              quantity: r.quantity,
              itemName: r.stockItem?.itemName,
            })) || []
          );

          const newStockItems = await fetchAllStockItems();
          console.log('Stock items refreshed');
          console.log(
            'After refresh - New stock items:',
            newStockItems?.map((item: any) => ({
              id: item.id,
              itemName: item.itemName,
              quantity: item.quantity,
              reserved: item.reserved,
            })) || []
          );

          // Force component re-render with fresh data
          if (newReservations) setProjectReservedStock([...newReservations]);
          if (newStockItems) setAllStockItems([...newStockItems]);

          setUseDialogOpen(false);
          setSelectedReservationForUse(null);
          setUseQuantity(1);
          showSnackbar('Reserved stock used successfully', 'success');
        } catch (error) {
          console.error('Error refreshing data after using stock:', error);
          // Still close dialog and show success, but data might be stale
          setUseDialogOpen(false);
          setSelectedReservationForUse(null);
          setUseQuantity(1);
          showSnackbar(
            'Stock used successfully, but display may need manual refresh',
            'success'
          );
        }
      } else {
        const errorData = await response.json();
        showSnackbar(
          errorData.message || 'Error using reserved stock',
          'error'
        );
      }
    } catch (error) {
      console.error('Error using reserved stock:', error);
      showSnackbar('Error using reserved stock', 'error');
    }
  };

  const handleDeleteReservation = async (reservationId: number) => {
    if (
      window.confirm('Are you sure you want to remove this stock reservation?')
    ) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/stock/reserved/${reservationId}`,
          {
            method: 'DELETE',
            credentials: 'include',
          }
        );

        if (response.ok) {
          await fetchProjectReservedStock();
          await fetchAllStockItems();
          showSnackbar('Reservation removed successfully', 'success');
        } else {
          const errorData = await response.json();
          showSnackbar(
            errorData.message || 'Error removing reservation',
            'error'
          );
        }
      } catch (error) {
        console.error('Error removing reservation:', error);
        showSnackbar('Error removing reservation', 'error');
      }
    }
  };

  const openAddDialog = () => {
    setSelectedStockId(0);
    setNewQuantity(1);
    setAddDialogOpen(true);
  };

  const openUpdateDialog = (reservation: ProjectReservedStock) => {
    setSelectedReservation(reservation);
    setUpdateQuantity(reservation.quantity);
    setUpdateDialogOpen(true);
  };

  const openUseDialog = (reservation: ProjectReservedStock) => {
    setSelectedReservationForUse(reservation);
    setUseQuantity(1);
    setUseDialogOpen(true);
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const getAvailableStockItems = () => {
    return allStockItems.filter((stock) => {
      const isAlreadyReserved = projectReservedStock.some(
        (r) => r.stockId === stock.id
      );
      const hasAvailableQuantity = stock.quantity - stock.reserved > 0;
      return !isAlreadyReserved && hasAvailableQuantity;
    });
  };

  const getMaxQuantityForStock = (stockId: number) => {
    const stock = allStockItems.find((s) => s.id === stockId);
    return stock ? stock.quantity - stock.reserved : 0;
  };

  const getMaxQuantityForUpdate = (reservation: ProjectReservedStock) => {
    const stock = allStockItems.find((s) => s.id === reservation.stockId);
    if (!stock) return 0;
    // Current reserved quantity + available quantity = max we can update to
    return stock.quantity - stock.reserved + reservation.quantity;
  };

  if (loading) {
    return (
      <Card
        sx={{
          backgroundColor: '#4c4a52',
          mb: 3,
          width: '100%',
          maxWidth: '1200px',
          mx: 'auto',
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Typography variant="h6" sx={{ color: '#e2e2e2' }}>
            Loading stock reservations...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card
        sx={{
          backgroundColor: '#4c4a52',
          mb: 3,
          width: '100%',
          maxWidth: '1200px',
          mx: 'auto',
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <InventoryIcon sx={{ color: '#79799a' }} />
              <Box>
                <Typography variant="h6" sx={{ color: '#e2e2e2' }}>
                  Project Stock Reservations
                </Typography>
                {!isOwner && (
                  <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                    You can use reserved stock. Only the project owner can
                    add/edit reservations.
                  </Typography>
                )}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {isOwner && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={openAddDialog}
                  disabled={getAvailableStockItems().length === 0}
                >
                  Add Reservation
                </Button>
              )}
              {!isViewer && (
                <Button
                  variant="outlined"
                  onClick={async () => {
                    console.log('Manual refresh triggered');
                    await fetchProjectReservedStock();
                    await fetchAllStockItems();
                    showSnackbar('Data refreshed', 'success');
                  }}
                  sx={{ color: '#e2e2e2', borderColor: '#79799a' }}
                >
                  Refresh
                </Button>
              )}
            </Box>
          </Box>

          {projectReservedStock.length === 0 ? (
            <Typography
              variant="body1"
              sx={{ color: '#b0b0b0', textAlign: 'center', py: 3 }}
            >
              {isOwner
                ? 'No stock reserved for this project yet. Click "Add Reservation" to reserve stock.'
                : 'No stock has been reserved for this project by the owner yet.'}
            </Typography>
          ) : (
            <TableContainer
              component={Paper}
              sx={{
                backgroundColor: '#2e2e2e',
                width: '100%',
                overflowX: 'auto',
              }}
            >
              <Table size="small" sx={{ width: '100%', minWidth: 500 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#e2e2e2', fontWeight: 'bold' }}>
                      Item Name
                    </TableCell>
                    <TableCell sx={{ color: '#e2e2e2', fontWeight: 'bold' }}>
                      Reserved Quantity
                    </TableCell>
                    <TableCell sx={{ color: '#e2e2e2', fontWeight: 'bold' }}>
                      Unit
                    </TableCell>
                    <TableCell sx={{ color: '#e2e2e2', fontWeight: 'bold' }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projectReservedStock.map((reservation) => {
                    // Use stockItem from the reservation data (populated by backend)
                    const stockItem = reservation.stockItem;

                    return (
                      <TableRow key={reservation.id}>
                        <TableCell sx={{ color: '#e2e2e2' }}>
                          {stockItem?.itemName || 'Unknown Item'}
                        </TableCell>
                        <TableCell sx={{ color: '#e2e2e2' }}>
                          {reservation.quantity}
                        </TableCell>
                        <TableCell sx={{ color: '#e2e2e2' }}>
                          {stockItem?.unit || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {isOwner && (
                            <IconButton
                              onClick={() => openUpdateDialog(reservation)}
                              sx={{ color: '#79799a' }}
                              title="Update Quantity"
                            >
                              <EditIcon />
                            </IconButton>
                          )}
                          {!isViewer && (
                            <IconButton
                              onClick={() => openUseDialog(reservation)}
                              sx={{ color: '#4caf50' }}
                              title="Use Reserved Stock"
                            >
                              <UseIcon />
                            </IconButton>
                          )}
                          {isOwner && (
                            <IconButton
                              onClick={() =>
                                handleDeleteReservation(reservation.id)
                              }
                              sx={{ color: '#f44336' }}
                              title="Remove Reservation"
                            >
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Add New Reservation Dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: '#4c4a52', color: '#e2e2e2' }}>
          Add New Stock Reservation
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: '#4c4a52', pt: 2 }}>
          {getAvailableStockItems().length === 0 ? (
            <Typography
              variant="body1"
              sx={{ color: '#b0b0b0', textAlign: 'center', py: 3 }}
            >
              No stock items available for reservation.
            </Typography>
          ) : (
            <>
              <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 2 }}>
                Select from available stock items (excluding items already
                reserved for this project):
              </Typography>

              <TableContainer
                component={Paper}
                sx={{
                  backgroundColor: '#2e2e2e',
                  mb: 3,
                  width: '100%',
                  overflowX: 'auto',
                }}
              >
                <Table size="small" sx={{ width: '100%', minWidth: 500 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#e2e2e2', fontWeight: 'bold' }}>
                        Select
                      </TableCell>
                      <TableCell sx={{ color: '#e2e2e2', fontWeight: 'bold' }}>
                        Item Name
                      </TableCell>
                      <TableCell sx={{ color: '#e2e2e2', fontWeight: 'bold' }}>
                        Total Quantity
                      </TableCell>
                      <TableCell sx={{ color: '#e2e2e2', fontWeight: 'bold' }}>
                        Reserved (All Projects)
                      </TableCell>
                      <TableCell sx={{ color: '#e2e2e2', fontWeight: 'bold' }}>
                        Available to Reserve
                      </TableCell>
                      <TableCell sx={{ color: '#e2e2e2', fontWeight: 'bold' }}>
                        Unit
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getAvailableStockItems().map((stock) => {
                      const availableQty = stock.quantity - stock.reserved;
                      const isSelected = selectedStockId === stock.id;

                      return (
                        <TableRow
                          key={stock.id}
                          onClick={() => setSelectedStockId(stock.id)}
                          sx={{
                            cursor: 'pointer',
                            backgroundColor: isSelected
                              ? '#79799a30'
                              : 'transparent',
                            '&:hover': {
                              backgroundColor: isSelected
                                ? '#79799a40'
                                : '#79799a20',
                            },
                          }}
                        >
                          <TableCell sx={{ color: '#e2e2e2' }}>
                            <input
                              type="radio"
                              checked={isSelected}
                              onChange={() => setSelectedStockId(stock.id)}
                              style={{ marginRight: 8 }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: '#e2e2e2' }}>
                            {stock.itemName}
                          </TableCell>
                          <TableCell sx={{ color: '#e2e2e2' }}>
                            {stock.quantity}
                          </TableCell>
                          <TableCell sx={{ color: '#e2e2e2' }}>
                            {stock.reserved}
                          </TableCell>
                          <TableCell
                            sx={{
                              color: availableQty > 0 ? '#4caf50' : '#f44336',
                              fontWeight: 'bold',
                            }}
                          >
                            {availableQty}
                          </TableCell>
                          <TableCell sx={{ color: '#e2e2e2' }}>
                            {stock.unit}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              <TextField
                margin="dense"
                label="Quantity to Reserve"
                type="number"
                fullWidth
                variant="outlined"
                value={newQuantity}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  const maxQty = getMaxQuantityForStock(selectedStockId);
                  setNewQuantity(Math.min(Math.max(1, value), maxQty));
                }}
                inputProps={{
                  min: 1,
                  max: getMaxQuantityForStock(selectedStockId),
                }}
                helperText={
                  selectedStockId > 0
                    ? `Maximum available: ${getMaxQuantityForStock(selectedStockId)} ${allStockItems.find((s) => s.id === selectedStockId)?.unit || ''}`
                    : 'Please select a stock item first'
                }
                disabled={selectedStockId === 0}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ backgroundColor: '#4c4a52', p: 2 }}>
          <Button
            onClick={() => setAddDialogOpen(false)}
            sx={{ color: '#e2e2e2' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddNewReservation}
            variant="contained"
            color="primary"
            disabled={selectedStockId === 0 || newQuantity <= 0}
          >
            Reserve Stock
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Quantity Dialog */}
      <Dialog
        open={updateDialogOpen}
        onClose={() => setUpdateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: '#4c4a52', color: '#e2e2e2' }}>
          Update Reservation Quantity
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: '#4c4a52', pt: 2 }}>
          {selectedReservation && (
            <>
              <Typography variant="body1" sx={{ color: '#e2e2e2', mb: 2 }}>
                <strong>Item:</strong>{' '}
                {selectedReservation.stockItem?.itemName || 'Unknown Item'}
              </Typography>

              <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 2 }}>
                Current reservation: {selectedReservation.quantity}{' '}
                {selectedReservation.stockItem?.unit || 'units'}
              </Typography>

              <TextField
                autoFocus
                margin="dense"
                label="New Quantity"
                type="number"
                fullWidth
                variant="outlined"
                value={updateQuantity}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  const maxQty = getMaxQuantityForUpdate(selectedReservation);
                  setUpdateQuantity(Math.min(Math.max(1, value), maxQty));
                }}
                inputProps={{
                  min: 1,
                  max: getMaxQuantityForUpdate(selectedReservation),
                }}
                helperText={`Maximum available: ${getMaxQuantityForUpdate(selectedReservation)} ${selectedReservation.stockItem?.unit || ''}`}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ backgroundColor: '#4c4a52', p: 2 }}>
          <Button
            onClick={() => setUpdateDialogOpen(false)}
            sx={{ color: '#e2e2e2' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateQuantity}
            variant="contained"
            color="primary"
            disabled={updateQuantity <= 0}
          >
            Update Quantity
          </Button>
        </DialogActions>
      </Dialog>

      {/* Use Reserved Stock Dialog */}
      <Dialog
        open={useDialogOpen}
        onClose={() => setUseDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: '#4c4a52', color: '#e2e2e2' }}>
          Use Reserved Stock
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: '#4c4a52', pt: 2 }}>
          {selectedReservationForUse && (
            <>
              <Typography variant="body1" sx={{ color: '#e2e2e2', mb: 2 }}>
                <strong>Item:</strong>{' '}
                {selectedReservationForUse.stockItem?.itemName ||
                  'Unknown Item'}
              </Typography>

              <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 2 }}>
                Reserved quantity: {selectedReservationForUse.quantity}{' '}
                {selectedReservationForUse.stockItem?.unit || 'units'}
              </Typography>

              <Typography variant="body2" sx={{ color: '#ff9800', mb: 3 }}>
                <strong>Note:</strong> Using reserved stock will consume it from
                both your reservation and the total stock quantity.
              </Typography>

              <TextField
                autoFocus
                margin="dense"
                label="Quantity to Use"
                type="number"
                fullWidth
                variant="outlined"
                value={useQuantity}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  setUseQuantity(
                    Math.min(
                      Math.max(1, value),
                      selectedReservationForUse.quantity
                    )
                  );
                }}
                inputProps={{
                  min: 1,
                  max: selectedReservationForUse.quantity,
                }}
                helperText={`Maximum available: ${selectedReservationForUse.quantity} ${selectedReservationForUse.stockItem?.unit || ''}`}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ backgroundColor: '#4c4a52', p: 2 }}>
          <Button
            onClick={() => setUseDialogOpen(false)}
            sx={{ color: '#e2e2e2' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUseReservedStock}
            variant="contained"
            color="primary"
            disabled={
              useQuantity <= 0 ||
              useQuantity > (selectedReservationForUse?.quantity || 0)
            }
          >
            Use Stock
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};
