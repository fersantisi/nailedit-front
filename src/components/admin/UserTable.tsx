import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Box,
  Chip,
  Alert,
  Snackbar,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { User } from '../../types';

interface UserTableProps {
  onUserUpdate?: () => void;
}

export const UserTable: React.FC<UserTableProps> = ({ onUserUpdate }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'info' });

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    userId: number | null;
  }>({ open: false, userId: null });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/admin/users`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUsers(
          data.map((user: any) => ({
            ...user,
            createdAt: user.createdAt || user.created_at || undefined,
          }))
        );
      } else {
        setError('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenDialog = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email || '',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveUser = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/admin/users/${editingUser?.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
          }),
        }
      );

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'User updated successfully',
          severity: 'success',
        });
        handleCloseDialog();
        fetchUsers();
        onUserUpdate?.();
      } else {
        const errorData = await response.json();
        setSnackbar({
          open: true,
          message: errorData.message || 'Failed to update user',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setSnackbar({
        open: true,
        message: 'Error updating user',
        severity: 'error',
      });
    }
  };

  const handleDeleteUser = (userId: number) => {
    setDeleteDialog({ open: true, userId });
  };

  const confirmDeleteUser = async () => {
    if (!deleteDialog.userId) return;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/admin/users/${deleteDialog.userId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'User deleted successfully',
          severity: 'success',
        });
        fetchUsers();
        onUserUpdate?.();
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to delete user',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setSnackbar({
        open: true,
        message: 'Error deleting user',
        severity: 'error',
      });
    } finally {
      setDeleteDialog({ open: false, userId: null });
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({ open: false, userId: null });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '1036.8px', maxWidth: '100%', mx: 'auto' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          User Management
        </Typography>
      </Box>

      <TableContainer component={Paper} elevation={2}>
        <Table sx={{ minWidth: 400 }} aria-label="user management table">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell
                align="center"
                sx={{ color: 'white', fontWeight: 'bold' }}
              >
                ID
              </TableCell>
              <TableCell
                align="center"
                sx={{ color: 'white', fontWeight: 'bold' }}
              >
                Username
              </TableCell>
              <TableCell
                align="center"
                sx={{ color: 'white', fontWeight: 'bold' }}
              >
                Email
              </TableCell>
              <TableCell
                align="center"
                sx={{ color: 'white', fontWeight: 'bold' }}
              >
                Created
              </TableCell>
              <TableCell
                align="center"
                sx={{ color: 'white', fontWeight: 'bold' }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...users]
              .sort((a, b) => a.id - b.id)
              .map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell align="center">{user.id}</TableCell>
                  <TableCell align="center">{user.username}</TableCell>
                  <TableCell align="center">{user.email || 'N/A'}</TableCell>
                  <TableCell align="center">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </TableCell>
                  <TableCell align="center">
                    {user.username !== 'admin' ? (
                      <>
                        <Tooltip title="Edit">
                          <IconButton
                            onClick={() => handleOpenDialog(user)}
                            size="small"
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            onClick={() => handleDeleteUser(user.id)}
                            size="small"
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    ) : (
                      <Box sx={{ height: 40 }} />
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit User Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Username"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} startIcon={<CancelIcon />}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveUser}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={!formData.username}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this user?</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDeleteDialog}
            color="primary"
            variant="outlined"
          >
            Cancel
          </Button>
          <Button onClick={confirmDeleteUser} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
