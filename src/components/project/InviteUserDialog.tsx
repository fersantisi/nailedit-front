import React, { useState } from 'react';
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
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
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
  const [username, setUsername] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Send invitation
  const handleSendInvitation = async () => {
    if (!username.trim()) return;

    try {
      setSending(true);
      setError(null);
      setSuccess(null);

      await invitationApi.sendInvitation(projectId, username.trim());

      setSuccess(`Invitation sent to ${username} successfully!`);
      setUsername('');

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
    setUsername('');
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

        {/* Username Input */}
        <TextField
          fullWidth
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          disabled={sending}
          sx={{ mb: 2 }}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={sending}>
          Cancel
        </Button>
        <Button
          onClick={handleSendInvitation}
          variant="contained"
          disabled={!username.trim() || sending}
          startIcon={sending ? <CircularProgress size={20} /> : <SendIcon />}
        >
          {sending ? 'Sending...' : 'Send Invitation'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
