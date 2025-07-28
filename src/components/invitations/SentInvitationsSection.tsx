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
  Send as SendIcon,
} from '@mui/icons-material';
import { ProjectInvitation } from '../../types';
import { invitationApi } from '../../utils/invitationApi';
import { formatInvitationDate } from '../../utils/dateUtils';
import { useNavigate } from 'react-router-dom';

export const SentInvitationsSection: React.FC = () => {
  const [invitations, setInvitations] = useState<ProjectInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invitationToDelete, setInvitationToDelete] =
    useState<ProjectInvitation | null>(null);
  const [componentError, setComponentError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      fetchInvitations();
    } catch (err) {
      console.error('Component error:', err);
      setComponentError('Failed to initialize sent invitations component');
      setLoading(false);
    }
  }, []);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await invitationApi.getSentInvitations();
      console.log('Sent invitations response:', response);

      // Handle different response structures
      if (response && response.invites) {
        setInvitations(response.invites);
      } else if (Array.isArray(response)) {
        setInvitations(response);
      } else {
        console.warn('Unexpected response structure:', response);
        setInvitations([]);
      }
    } catch (error) {
      console.error('Error fetching sent invitations:', error);
      setError('Failed to load sent invitations');
      setInvitations([]);
    } finally {
      setLoading(false);
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

  if (componentError) {
    return (
      <Paper sx={{ p: 3, backgroundColor: '#3a3a3a', borderRadius: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {componentError}
        </Alert>
        <Button
          variant="outlined"
          onClick={() => {
            setComponentError(null);
            setLoading(true);
            fetchInvitations();
          }}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Paper>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3, backgroundColor: '#3a3a3a', borderRadius: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="outlined" onClick={fetchInvitations} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Paper>
    );
  }

  if (invitations.length === 0) {
    return (
      <Paper
        sx={{
          p: 3,
          textAlign: 'center',
          backgroundColor: '#3a3a3a',
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Sent Invitations
        </Typography>
        <Typography variant="body2" color="text.secondary">
          You haven't sent any project invitations yet.
        </Typography>
      </Paper>
    );
  }

  console.log('Rendering sent invitations:', invitations);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Sent Invitations ({invitations.length})
      </Typography>

      <List>
        {invitations.map((invitation) => {
          try {
            return (
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
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 'medium' }}
                        >
                          You invited
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 'medium' }}
                        >
                          {invitation.toUserData?.username || 'Unknown User'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          to join
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
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          <Chip
                            label={invitation.status}
                            color={
                              invitation.status === 'accepted'
                                ? 'success'
                                : invitation.status === 'rejected'
                                  ? 'error'
                                  : 'warning'
                            }
                            size="small"
                          />
                          <Typography variant="caption" color="text.secondary">
                            Sent on {formatInvitationDate(invitation.created_at)}
                          </Typography>
                        </Box>
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
            );
          } catch (err) {
            console.error('Error rendering sent invitation:', invitation, err);
            return (
              <Paper
                key={invitation.id}
                sx={{ mb: 2, p: 2, backgroundColor: '#ffebee' }}
              >
                <Typography color="error">
                  Error rendering sent invitation {invitation.id}
                </Typography>
              </Paper>
            );
          }
        })}
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
