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
  Fab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import { Navbar } from '../components/ui/navbar';
import { User, Stock } from '../types';

export const StockPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stockItems, setStockItems] = useState<Stock[]>([]);
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Stock | null>(null);
  const [formData, setFormData] = useState({
    itemName: '',
    quantity: 0,
    unit: '',
  });
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

  useEffect(() => {
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
        console.log('meData', meData);

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
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchStockItems();
    }
  }, [user]);

  const fetchStockItems = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stock`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setStockItems(data);
      }
    } catch (error) {
      console.error('Error fetching stock items:', error);
      showSnackbar('Error fetching stock items', 'error');
    }
  };

  const handleSubmit = async () => {
    try {
      const url = editingItem
        ? `${API_BASE_URL}/stock/${editingItem.id}`
        : `${API_BASE_URL}/stock`;

      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchStockItems();
        handleClose();
        showSnackbar(
          editingItem
            ? 'Stock item updated successfully'
            : 'Stock item created successfully',
          'success'
        );
      } else {
        // Handle specific validation errors from backend
        if (response.status === 400) {
          try {
            const errorData = await response.json();
            if (
              errorData.message &&
              errorData.message.includes(
                'Cannot reduce quantity below currently reserved'
              )
            ) {
              showSnackbar(
                'Cannot reduce stock below reserved amount. Please unreserve items first or increase the quantity.',
                'error'
              );
            } else {
              showSnackbar(
                errorData.message || 'Error saving stock item',
                'error'
              );
            }
          } catch {
            showSnackbar('Error saving stock item', 'error');
          }
        } else {
          showSnackbar('Error saving stock item', 'error');
        }
      }
    } catch (error) {
      console.error('Error saving stock item:', error);
      showSnackbar('Error saving stock item', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this stock item?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/stock/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (response.ok) {
          await fetchStockItems();
          showSnackbar('Stock item deleted successfully', 'success');
        } else {
          showSnackbar('Error deleting stock item', 'error');
        }
      } catch (error) {
        console.error('Error deleting stock item:', error);
        showSnackbar('Error deleting stock item', 'error');
      }
    }
  };

  const handleEdit = (item: Stock) => {
    setEditingItem(item);
    setFormData({
      itemName: item.itemName,
      quantity: item.quantity,
      unit: item.unit,
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingItem(null);
    setFormData({
      itemName: '',
      quantity: 0,
      unit: '',
    });
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
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
          overflowX: 'hidden',
        }}
      >
        Loading...
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#2e2e2e' }}>
      <Navbar user={user} />
      <Box sx={{ padding: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <InventoryIcon sx={{ color: '#79799a', fontSize: 40 }} />
          <Typography variant="h4" sx={{ color: '#e2e2e2' }}>
            Stock Management
          </Typography>
        </Box>

        <TableContainer component={Paper} sx={{ backgroundColor: '#4c4a52' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#e2e2e2', fontWeight: 'bold' }}>
                  Item Name
                </TableCell>
                <TableCell sx={{ color: '#e2e2e2', fontWeight: 'bold' }}>
                  Total Quantity
                </TableCell>
                <TableCell sx={{ color: '#e2e2e2', fontWeight: 'bold' }}>
                  Unit
                </TableCell>
                <TableCell sx={{ color: '#e2e2e2', fontWeight: 'bold' }}>
                  Available Stock
                </TableCell>
                <TableCell sx={{ color: '#e2e2e2', fontWeight: 'bold' }}>
                  Reserved
                </TableCell>
                <TableCell sx={{ color: '#e2e2e2', fontWeight: 'bold' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stockItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell sx={{ color: '#e2e2e2' }}>
                    {item.itemName}
                  </TableCell>
                  <TableCell sx={{ color: '#e2e2e2' }}>
                    {item.quantity}
                  </TableCell>
                  <TableCell sx={{ color: '#e2e2e2' }}>{item.unit}</TableCell>
                  <TableCell sx={{ color: '#e2e2e2' }}>
                    {item.quantity - item.reserved}
                  </TableCell>
                  <TableCell sx={{ color: '#e2e2e2' }}>
                    {item.reserved}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleEdit(item)}
                      sx={{ color: '#79799a' }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(item.id)}
                      sx={{ color: '#f44336' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Fab
          color="primary"
          aria-label="add"
          onClick={() => setOpen(true)}
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
        >
          <AddIcon />
        </Fab>

        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ backgroundColor: '#4c4a52', color: '#e2e2e2' }}>
            {editingItem ? 'Edit Stock Item' : 'Add New Stock Item'}
          </DialogTitle>
          <DialogContent sx={{ backgroundColor: '#4c4a52', pt: 2 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Item Name"
              fullWidth
              variant="outlined"
              value={formData.itemName}
              onChange={(e) =>
                setFormData({ ...formData, itemName: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Quantity"
              type="number"
              fullWidth
              variant="outlined"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  quantity: parseInt(e.target.value) || 0,
                })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Unit"
              fullWidth
              variant="outlined"
              value={formData.unit}
              onChange={(e) =>
                setFormData({ ...formData, unit: e.target.value })
              }
            />
          </DialogContent>
          <DialogActions sx={{ backgroundColor: '#4c4a52', p: 2 }}>
            <Button onClick={handleClose} sx={{ color: '#e2e2e2' }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {editingItem ? 'Update' : 'Create'}
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
      </Box>
    </Box>
  );
};
