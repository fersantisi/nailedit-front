import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Container,
  Fab,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon,
  Check as CheckIcon,
  GetApp as DownloadIcon,
  Inventory as InventoryIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { Navbar } from '../components/ui/navbar';
import { User, Stock, ShoppingListItem } from '../types';
import { shoppingListApi } from '../utils/shoppingListApi';

export const ShoppingListPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Separate states for raw data
  const [rawShoppingListItems, setRawShoppingListItems] = useState<any[]>([]);
  const [shoppingListItems, setShoppingListItems] = useState<
    ShoppingListItem[]
  >([]);
  const [availableStock, setAvailableStock] = useState<Stock[]>([]);

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [confirmBoughtDialogOpen, setConfirmBoughtDialogOpen] = useState(false);
  const [selectedStockId, setSelectedStockId] = useState<number>(0);
  const [newQuantity, setNewQuantity] = useState<number>(1);
  const [editingItem, setEditingItem] = useState<ShoppingListItem | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(1);
  const [itemToMarkAsBought, setItemToMarkAsBought] =
    useState<ShoppingListItem | null>(null);
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ShoppingListItem | null>(
    null
  );

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchShoppingList();
      fetchAvailableStock();
    }
  }, [user]);

  // Effect to combine shopping list and stock data
  useEffect(() => {
    console.log('Processing shopping list data:', {
      rawShoppingListItems: rawShoppingListItems.length,
      availableStock: availableStock.length,
    });

    if (rawShoppingListItems.length > 0 && availableStock.length > 0) {
      const combinedItems = rawShoppingListItems.map((item) => {
        const matchingStock = availableStock.find(
          (s) => s.id === item.stockId || s.id === item.itemId
        );
        return {
          ...item,
          status: item.status || 'pending',
          stockItem: matchingStock || {
            id: item.stockId || item.itemId || 0,
            itemName: item.itemName || 'Unknown Item',
            unit: item.unit || 'units',
            quantity: 0,
            reserved: 0,
            userid: 0,
          },
        };
      });
      console.log('Setting combined items:', combinedItems.length);
      setShoppingListItems(combinedItems);
    } else if (rawShoppingListItems.length > 0) {
      // If we have shopping list but no stock data, still normalize
      const normalizedItems = rawShoppingListItems.map((item) => ({
        ...item,
        status: item.status || 'pending',
        stockItem: {
          id: item.stockId || item.itemId || 0,
          itemName: item.itemName || 'Unknown Item',
          unit: item.unit || 'units',
          quantity: 0,
          reserved: 0,
          userid: 0,
        },
      }));
      console.log('Setting normalized items:', normalizedItems.length);
      setShoppingListItems(normalizedItems);
    } else {
      // If rawShoppingListItems is empty, update shoppingListItems to empty as well
      console.log('Setting empty shopping list items');
      setShoppingListItems([]);
    }
  }, [rawShoppingListItems, availableStock]);

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
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(null);
      setError('Failed to authenticate user');
    } finally {
      setLoading(false);
    }
  };

  const fetchShoppingList = async () => {
    try {
      setError(null);
      const items = await shoppingListApi.getShoppingList();
      console.log('Fetched shopping list items:', items);
      setRawShoppingListItems(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error('Error fetching shopping list:', error);
      setError(
        'Failed to load shopping list. The shopping list endpoint may not be available.'
      );
      showSnackbar('Error fetching shopping list', 'error');
      setRawShoppingListItems([]);
    }
  };

  const fetchAvailableStock = async () => {
    try {
      const stock = await shoppingListApi.getAvailableStock();
      setAvailableStock(Array.isArray(stock) ? stock : []);
    } catch (error) {
      console.error('Error fetching available stock:', error);
      showSnackbar('Error fetching available stock', 'error');
      setAvailableStock([]);
    }
  };

  const handleAddToShoppingList = async () => {
    if (selectedStockId === 0 || newQuantity <= 0) return;

    try {
      const selectedStock = availableStock.find(
        (stock) => stock.id === selectedStockId
      );
      if (!selectedStock) {
        showSnackbar('Selected stock item not found', 'error');
        return;
      }

      await shoppingListApi.addItemToShoppingList(
        selectedStockId,
        newQuantity,
        selectedStock
      );
      await fetchShoppingList();
      setAddDialogOpen(false);
      setSelectedStockId(0);
      setNewQuantity(1);
      showSnackbar('Item added to shopping list successfully', 'success');
    } catch (error) {
      console.error('Error adding item to shopping list:', error);
      showSnackbar('Error adding item to shopping list', 'error');
    }
  };

  const handleUpdateQuantity = async () => {
    if (!editingItem || editQuantity <= 0) return;

    try {
      const stockItem = editingItem.stockItem;
      if (!stockItem) {
        showSnackbar('Stock item information not available', 'error');
        return;
      }

      await shoppingListApi.updateShoppingListItem(
        editingItem.id,
        editQuantity,
        stockItem
      );
      await fetchShoppingList();
      setEditDialogOpen(false);
      setEditingItem(null);
      setEditQuantity(1);
      showSnackbar('Quantity updated successfully', 'success');
    } catch (error) {
      console.error('Error updating quantity:', error);
      showSnackbar('Error updating quantity', 'error');
    }
  };

  const handleRemoveItem = async (id: number) => {
    try {
      console.log('Removing item:', id);

      // Remove item from shopping list
      await shoppingListApi.removeShoppingListItem(id);

      // Close dialog first for immediate feedback
      setConfirmDeleteDialogOpen(false);
      setItemToDelete(null);

      // Show immediate feedback
      showSnackbar('Item removed from shopping list', 'success');

      console.log('Refreshing data after removing item...');

      // Refresh all data to ensure consistency
      await Promise.all([fetchShoppingList(), fetchAvailableStock()]);

      console.log('Data refresh completed');
    } catch (error) {
      console.error('Error removing item:', error);
      showSnackbar('Error removing item', 'error');
      // Keep dialog open on error
    }
  };

  const handleMarkAsBought = async (id: number) => {
    try {
      console.log('Marking item as bought:', id);

      // Mark item as bought and add to stock
      await shoppingListApi.addShoppingListItemToStock(id);

      // Close dialog first for immediate feedback
      setConfirmBoughtDialogOpen(false);
      setItemToMarkAsBought(null);

      // Show immediate feedback
      showSnackbar('Item marked as bought and added to stock!', 'success');

      console.log('Refreshing data after marking as bought...');

      // Refresh all data to ensure consistency
      await Promise.all([fetchShoppingList(), fetchAvailableStock()]);

      console.log('Data refresh completed');
    } catch (error) {
      console.error('Error marking item as bought:', error);
      showSnackbar('Error marking item as bought', 'error');
      // Keep dialog open on error
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const blob = await shoppingListApi.downloadShoppingListPDF();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `shopping-list-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showSnackbar('Shopping list PDF downloaded successfully', 'success');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      showSnackbar('Error downloading PDF', 'error');
    }
  };

  const openAddDialog = () => {
    setSelectedStockId(0);
    setNewQuantity(1);
    setAddDialogOpen(true);
  };

  const openEditDialog = (item: ShoppingListItem) => {
    setEditingItem(item);
    setEditQuantity(item.quantity);
    setEditDialogOpen(true);
  };

  const openConfirmBoughtDialog = (item: ShoppingListItem) => {
    setItemToMarkAsBought(item);
    setConfirmBoughtDialogOpen(true);
  };

  const closeConfirmBoughtDialog = () => {
    setConfirmBoughtDialogOpen(false);
    setItemToMarkAsBought(null);
  };

  const openConfirmDeleteDialog = (item: ShoppingListItem) => {
    setItemToDelete(item);
    setConfirmDeleteDialogOpen(true);
  };

  const closeConfirmDeleteDialog = () => {
    setConfirmDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const showSnackbar = (
    message: string,
    severity: 'success' | 'error' | 'info'
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const getAvailableStockItems = () => {
    const shoppingListStockIds = shoppingListItems.map((item) => item.stockId);
    return availableStock.filter(
      (stock) => !shoppingListStockIds.includes(stock.id)
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error && !user) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#2e2e2e' }}>
        <Navbar user={user} />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        </Container>
      </Box>
    );
  }

  const pendingItems = shoppingListItems.filter(
    (item) => item.status === 'pending'
  );
  const boughtItems = shoppingListItems.filter(
    (item) => item.status === 'bought'
  );

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#2e2e2e' }}>
      <Navbar user={user} />
      <Container
        maxWidth="lg"
        sx={{
          py: 4,
          overflow: 'hidden',
          minHeight: 'calc(100vh - 70px)',
        }}
      >
        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Header */}
        <Box
          sx={{
            mb: 4,
            p: 3,
            backgroundColor: 'background.paper',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ShoppingCartIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                Shopping List
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage your shopping list and add purchased items to your stock
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={openAddDialog}
              disabled={getAvailableStockItems().length === 0}
            >
              Add Item
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadPDF}
              disabled={pendingItems.length === 0}
              sx={{ color: '#e2e2e2', borderColor: '#79799a' }}
            >
              Download PDF
            </Button>
          </Box>
        </Box>

        {/* Pending Items */}
        <Card sx={{ mb: 3, backgroundColor: '#4c4a52' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <ShoppingCartIcon sx={{ color: '#79799a' }} />
              <Typography variant="h6" sx={{ color: '#e2e2e2' }}>
                Shopping List ({pendingItems.length} items)
              </Typography>
            </Box>

            {pendingItems.length === 0 ? (
              <Typography
                variant="body1"
                sx={{ color: '#b0b0b0', textAlign: 'center', py: 3 }}
              >
                Your shopping list is empty. Click "Add Item" to add items from
                your stock.
              </Typography>
            ) : (
              <TableContainer
                component={Paper}
                sx={{ backgroundColor: '#2e2e2e' }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#e2e2e2', fontWeight: 'bold' }}>
                        Item Name
                      </TableCell>
                      <TableCell sx={{ color: '#e2e2e2', fontWeight: 'bold' }}>
                        Quantity
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
                    {pendingItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell sx={{ color: '#e2e2e2' }}>
                          {item.stockItem?.itemName || 'Unknown Item'}
                        </TableCell>
                        <TableCell sx={{ color: '#e2e2e2' }}>
                          {item.quantity}
                        </TableCell>
                        <TableCell sx={{ color: '#e2e2e2' }}>
                          {item.stockItem?.unit || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Edit Quantity">
                            <IconButton
                              onClick={() => openEditDialog(item)}
                              sx={{ color: '#79799a' }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Mark as Bought">
                            <IconButton
                              onClick={() => openConfirmBoughtDialog(item)}
                              sx={{ color: '#4caf50' }}
                            >
                              <CheckIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Remove from List">
                            <IconButton
                              onClick={() => openConfirmDeleteDialog(item)}
                              sx={{ color: '#f44336' }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Recently Bought Items */}
        {boughtItems.length > 0 && (
          <Card sx={{ backgroundColor: '#4c4a52' }}>
            <CardContent>
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}
              >
                <InventoryIcon sx={{ color: '#4caf50' }} />
                <Typography variant="h6" sx={{ color: '#e2e2e2' }}>
                  Recently Bought ({boughtItems.length} items)
                </Typography>
              </Box>

              <TableContainer
                component={Paper}
                sx={{ backgroundColor: '#2e2e2e' }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#e2e2e2', fontWeight: 'bold' }}>
                        Item Name
                      </TableCell>
                      <TableCell sx={{ color: '#e2e2e2', fontWeight: 'bold' }}>
                        Quantity
                      </TableCell>
                      <TableCell sx={{ color: '#e2e2e2', fontWeight: 'bold' }}>
                        Unit
                      </TableCell>
                      <TableCell sx={{ color: '#e2e2e2', fontWeight: 'bold' }}>
                        Bought Date
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {boughtItems.slice(0, 10).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell sx={{ color: '#e2e2e2' }}>
                          {item.stockItem?.itemName || 'Unknown Item'}
                        </TableCell>
                        <TableCell sx={{ color: '#e2e2e2' }}>
                          {item.quantity}
                        </TableCell>
                        <TableCell sx={{ color: '#e2e2e2' }}>
                          {item.stockItem?.unit || 'N/A'}
                        </TableCell>
                        <TableCell sx={{ color: '#e2e2e2' }}>
                          {new Date(item.updatedAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        {/* Add Item Dialog */}
        <Dialog
          open={addDialogOpen}
          onClose={() => setAddDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ backgroundColor: '#4c4a52', color: '#e2e2e2' }}>
            Add Item to Shopping List
          </DialogTitle>
          <DialogContent sx={{ backgroundColor: '#4c4a52', pt: 2 }}>
            {getAvailableStockItems().length === 0 ? (
              <Typography
                variant="body1"
                sx={{ color: '#b0b0b0', textAlign: 'center', py: 3 }}
              >
                No stock items available to add to shopping list. All items are
                already in your shopping list.
              </Typography>
            ) : (
              <>
                <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 2 }}>
                  Select a stock item to add to your shopping list:
                </Typography>

                <TableContainer
                  component={Paper}
                  sx={{
                    backgroundColor: '#2e2e2e',
                    mb: 3,
                    maxHeight: 400,
                    overflow: 'auto',
                  }}
                >
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{ color: '#e2e2e2', fontWeight: 'bold' }}
                        >
                          Select
                        </TableCell>
                        <TableCell
                          sx={{ color: '#e2e2e2', fontWeight: 'bold' }}
                        >
                          Item Name
                        </TableCell>
                        <TableCell
                          sx={{ color: '#e2e2e2', fontWeight: 'bold' }}
                        >
                          Current Stock
                        </TableCell>
                        <TableCell
                          sx={{ color: '#e2e2e2', fontWeight: 'bold' }}
                        >
                          Unit
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getAvailableStockItems().map((stock) => {
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
                              {stock.quantity - stock.reserved}
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
                  label="Quantity to Add"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={newQuantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    setNewQuantity(Math.max(1, value));
                  }}
                  inputProps={{ min: 1 }}
                  disabled={selectedStockId === 0}
                  helperText={
                    selectedStockId > 0
                      ? `Adding to shopping list`
                      : 'Please select a stock item first'
                  }
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
              onClick={handleAddToShoppingList}
              variant="contained"
              color="primary"
              disabled={selectedStockId === 0 || newQuantity <= 0}
            >
              Add to Shopping List
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Quantity Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ backgroundColor: '#4c4a52', color: '#e2e2e2' }}>
            Update Quantity
          </DialogTitle>
          <DialogContent sx={{ backgroundColor: '#4c4a52', pt: 2 }}>
            {editingItem && (
              <>
                <Typography variant="body1" sx={{ color: '#e2e2e2', mb: 2 }}>
                  <strong>Item:</strong>{' '}
                  {editingItem.stockItem?.itemName || 'Unknown Item'}
                </Typography>

                <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 2 }}>
                  Current quantity: {editingItem.quantity}{' '}
                  {editingItem.stockItem?.unit || 'units'}
                </Typography>

                <TextField
                  autoFocus
                  margin="dense"
                  label="New Quantity"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={editQuantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    setEditQuantity(Math.max(1, value));
                  }}
                  inputProps={{ min: 1 }}
                />
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ backgroundColor: '#4c4a52', p: 2 }}>
            <Button
              onClick={() => setEditDialogOpen(false)}
              sx={{ color: '#e2e2e2' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateQuantity}
              variant="contained"
              color="primary"
              disabled={editQuantity <= 0}
            >
              Update Quantity
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirm Mark as Bought Dialog */}
        <Dialog
          open={confirmBoughtDialogOpen}
          onClose={closeConfirmBoughtDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle
            sx={{
              backgroundColor: '#4c4a52',
              color: '#e2e2e2',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <CheckIcon sx={{ color: '#4caf50' }} />
            Confirm Mark as Bought
          </DialogTitle>
          <DialogContent sx={{ backgroundColor: '#4c4a52', pt: 2 }}>
            {itemToMarkAsBought && (
              <>
                <Typography variant="h6" sx={{ color: '#e2e2e2', mb: 2 }}>
                  Are you sure you want to mark this item as bought?
                </Typography>

                <Box
                  sx={{
                    backgroundColor: '#2e2e2e',
                    p: 2,
                    borderRadius: 1,
                    mb: 2,
                    border: '1px solid #79799a',
                  }}
                >
                  <Typography variant="body1" sx={{ color: '#e2e2e2', mb: 1 }}>
                    <strong>Item:</strong>{' '}
                    {itemToMarkAsBought.stockItem?.itemName || 'Unknown Item'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 1 }}>
                    <strong>Quantity:</strong> {itemToMarkAsBought.quantity}{' '}
                    {itemToMarkAsBought.stockItem?.unit || 'units'}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    backgroundColor: '#4caf5020',
                    border: '1px solid #4caf50',
                    borderRadius: 1,
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <InventoryIcon sx={{ color: '#4caf50' }} />
                  <Typography variant="body2" sx={{ color: '#e2e2e2' }}>
                    This item will be added to your stock inventory and removed
                    from your shopping list.
                  </Typography>
                </Box>
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ backgroundColor: '#4c4a52', p: 2, gap: 1 }}>
            <Button
              onClick={closeConfirmBoughtDialog}
              variant="outlined"
              sx={{
                color: '#e2e2e2',
                borderColor: '#79799a',
                '&:hover': {
                  borderColor: '#e2e2e2',
                  backgroundColor: '#79799a20',
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (itemToMarkAsBought) {
                  handleMarkAsBought(itemToMarkAsBought.id);
                }
              }}
              variant="contained"
              startIcon={<CheckIcon />}
              sx={{
                backgroundColor: '#4caf50',
                '&:hover': {
                  backgroundColor: '#45a049',
                },
              }}
              disabled={!itemToMarkAsBought}
            >
              Mark as Bought
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirm Delete Dialog */}
        <Dialog
          open={confirmDeleteDialogOpen}
          onClose={closeConfirmDeleteDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle
            sx={{
              backgroundColor: '#4c4a52',
              color: '#e2e2e2',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <DeleteIcon sx={{ color: '#f44336' }} />
            Confirm Delete Item
          </DialogTitle>
          <DialogContent sx={{ backgroundColor: '#4c4a52', pt: 2 }}>
            {itemToDelete && (
              <>
                <Typography variant="h6" sx={{ color: '#e2e2e2', mb: 2 }}>
                  Are you sure you want to remove this item from your shopping
                  list?
                </Typography>

                <Box
                  sx={{
                    backgroundColor: '#2e2e2e',
                    p: 2,
                    borderRadius: 1,
                    mb: 2,
                    border: '1px solid #79799a',
                  }}
                >
                  <Typography variant="body1" sx={{ color: '#e2e2e2', mb: 1 }}>
                    <strong>Item:</strong>{' '}
                    {itemToDelete.stockItem?.itemName || 'Unknown Item'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 1 }}>
                    <strong>Quantity:</strong> {itemToDelete.quantity}{' '}
                    {itemToDelete.stockItem?.unit || 'units'}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    backgroundColor: '#f4433620',
                    border: '1px solid #f44336',
                    borderRadius: 1,
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <DeleteIcon sx={{ color: '#f44336' }} />
                  <Typography variant="body2" sx={{ color: '#e2e2e2' }}>
                    This item will be permanently removed from your shopping
                    list. This action cannot be undone.
                  </Typography>
                </Box>
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ backgroundColor: '#4c4a52', p: 2, gap: 1 }}>
            <Button
              onClick={closeConfirmDeleteDialog}
              variant="outlined"
              sx={{
                color: '#e2e2e2',
                borderColor: '#79799a',
                '&:hover': {
                  borderColor: '#e2e2e2',
                  backgroundColor: '#79799a20',
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (itemToDelete) {
                  handleRemoveItem(itemToDelete.id);
                }
              }}
              variant="contained"
              startIcon={<DeleteIcon />}
              sx={{
                backgroundColor: '#f44336',
                '&:hover': {
                  backgroundColor: '#d32f2f',
                },
              }}
              disabled={!itemToDelete}
            >
              Delete Item
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
      </Container>
    </Box>
  );
};
