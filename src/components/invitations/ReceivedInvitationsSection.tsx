import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Check as AcceptIcon,
  Close as RejectIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Folder as ProjectIcon,
} from '@mui/icons-material';
import { ProjectInvitation } from '../../types';
import { invitationApi } from '../../utils/invitationApi';
import { formatDate } from '../../utils/dateUtils';
import { useNavigate } from 'react-router-dom';

export const ReceivedInvitationsSection: React.FC = () => {
  const [invitations, setInvitations] = useState<ProjectInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invitationToDelete, setInvitationToDelete] =
    useState<ProjectInvitation | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await invitationApi.getReceivedInvitations();
      setInvitations(response.invites);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      setError('Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async (invitation: ProjectInvitation) => {
    try {
      setProcessing(invitation.id);
      setError(null);

      await invitationApi.acceptInvitation(invitation.id);

      // Remove the invitation from the list
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitation.id));
    } catch (error) {
      console.error('Error accepting invitation:', error);
      setError('Failed to accept invitation');
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectInvitation = async (invitation: ProjectInvitation) => {
    try {
      setProcessing(invitation.id);
      setError(null);

      await invitationApi.rejectInvitation(invitation.id);

      // Remove the invitation from the list
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitation.id));
    } catch (error) {
      console.error('Error rejecting invitation:', error);
      setError('Failed to reject invitation');
    } finally {
      setProcessing(null);
    }
  };

  const handleDeleteInvitation = async () => {
    if (!invitationToDelete) return;

    try {
      setProcessing(invitationToDelete.id);
      setError(null);

      await invitationApi.deleteInvitation(invitationToDelete.id);

      // Remove the invitation from the list
      setInvitations((prev) =>
        prev.filter((inv) => inv.id !== invitationToDelete.id)
      );
      setDeleteDialogOpen(false);
      setInvitationToDelete(null);
    } catch (error) {
      console.error('Error deleting invitation:', error);
      setError('Failed to delete invitation');
    } finally {
      setProcessing(null);
    }
  };

  const openDeleteDialog = (invitation: ProjectInvitation) => {
    setInvitationToDelete(invitation);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setInvitationToDelete(null);
  };

  const handleViewProject = (projectId: number) => {
    navigate(`/project/${projectId}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (invitations.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Invitations
        </Typography>
        <Typography variant="body2" color="text.secondary">
          You haven't received any project invitations yet.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Received Invitations ({invitations.length})
      </Typography>

      <List>
        {invitations.map((invitation) => (
          <Paper key={invitation.id} sx={{ mb: 2, p: 2 }}>
            <ListItem disablePadding>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <PersonIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {invitation.fromUserData.username}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      invited you to join
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 'medium', mb: 1 }}
                    >
                      {invitation.project.name}
                    </Typography>
                    {invitation.project.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        {invitation.project.description}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      Sent on {formatDate(invitation.created_at)}
                    </Typography>
                  </Box>
                }
              />
              <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                <Tooltip title="View Project">
                  <IconButton
                    size="small"
                    onClick={() => handleViewProject(invitation.projectId)}
                  >
                    <ProjectIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Accept Invitation">
                  <IconButton
                    size="small"
                    color="success"
                    onClick={() => handleAcceptInvitation(invitation)}
                    disabled={processing === invitation.id}
                  >
                    <AcceptIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Reject Invitation">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleRejectInvitation(invitation)}
                    disabled={processing === invitation.id}
                  >
                    <RejectIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Invitation">
                  <IconButton
                    size="small"
                    onClick={() => openDeleteDialog(invitation)}
                    disabled={processing === invitation.id}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </ListItem>
          </Paper>
        ))}
      </List>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Delete Invitation</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this invitation? This action cannot
            be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} disabled={processing !== null}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteInvitation}
            color="error"
            disabled={processing !== null}
          >
            {processing === invitationToDelete?.id ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
