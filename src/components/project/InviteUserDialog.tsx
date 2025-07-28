import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Person as PersonIcon,
  Search as SearchIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { User } from '../../types';
import { invitationApi } from '../../utils/invitationApi';

interface InviteUserDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: number;
  projectName: string;
  onInvitationSent?: () => void;
}

export const InviteUserDialog: React.FC<InviteUserDialogProps> = ({
  open,
  onClose,
  projectId,
  projectName,
  onInvitationSent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Search for users
  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      setError(null);

      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/users/search?q=${encodeURIComponent(query)}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      } else {
        setError('Failed to search for users');
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setError('Failed to search for users');
    } finally {
      setSearching(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    searchUsers(query);
  };

  // Send invitation
  const handleSendInvitation = async () => {
    if (!selectedUser) return;

    try {
      setSending(true);
      setError(null);
      setSuccess(null);

      await invitationApi.sendInvitation(projectId, selectedUser.id);

      setSuccess(`Invitation sent to ${selectedUser.username} successfully!`);
      setSelectedUser(null);
      setSearchQuery('');
      setSearchResults([]);

      // Call callback to refresh project data
      onInvitationSent?.();

      // Close dialog after a short delay
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 2000);
    } catch (error) {
      console.error('Error sending invitation:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to send invitation'
      );
    } finally {
      setSending(false);
    }
  };

  // Reset state when dialog closes
  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUser(null);
    setError(null);
    setSuccess(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SendIcon color="primary" />
          <Typography variant="h6">Invite User to Project</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Invite a user to join "{projectName}"
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* Search Input */}
        <TextField
          fullWidth
          label="Search for users"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Enter username or email"
          InputProps={{
            startAdornment: (
              <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            ),
            endAdornment: searching && <CircularProgress size={20} />,
          }}
          sx={{ mb: 2 }}
        />

        {/* Search Results */}
        {searchResults.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Select a user to invite:
            </Typography>
            <List sx={{ maxHeight: 200, overflow: 'auto' }}>
              {searchResults.map((user) => (
                <ListItem
                  key={user.id}
                  button
                  selected={selectedUser?.id === user.id}
                  onClick={() => setSelectedUser(user)}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {user.username.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.username}
                    secondary={user.email}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Selected User Display */}
        {selectedUser && (
          <Box
            sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}
          >
            <Typography variant="subtitle2" gutterBottom>
              Selected User:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                {selectedUser.username.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  {selectedUser.username}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedUser.email}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={sending}>
          Cancel
        </Button>
        <Button
          onClick={handleSendInvitation}
          variant="contained"
          disabled={!selectedUser || sending}
          startIcon={sending ? <CircularProgress size={20} /> : <SendIcon />}
        >
          {sending ? 'Sending...' : 'Send Invitation'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
