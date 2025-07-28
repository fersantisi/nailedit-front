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
  Person as PersonIcon,
} from '@mui/icons-material';
import { ProjectInvitation } from '../../types';
import { invitationApi } from '../../utils/invitationApi';
import { formatInvitationDate } from '../../utils/dateUtils';
import { useNavigate } from 'react-router-dom';

export const ReceivedInvitationsSection: React.FC = () => {
  const [invitations, setInvitations] = useState<ProjectInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<number | null>(null);
  const [componentError, setComponentError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      fetchInvitations();
    } catch (err) {
      console.error('Component error:', err);
      setComponentError('Failed to initialize invitations component');
      setLoading(false);
    }
  }, []);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await invitationApi.getReceivedInvitations();
      console.log('Received invitations response:', response);

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
      console.error('Error fetching invitations:', error);
      setError('Failed to load invitations');
      setInvitations([]);
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
          No Invitations
        </Typography>
        <Typography variant="body2" color="text.secondary">
          You haven't received any project invitations yet.
        </Typography>
      </Paper>
    );
  }

  console.log('Rendering invitations:', invitations);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Received Invitations ({invitations.length})
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
                      Sent on {formatInvitationDate(invitation.created_at)}
                    </Typography>
                      </Box>
                    }
                  />
                                <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
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
              </Box>
                </ListItem>
              </Paper>
            );
          } catch (err) {
            console.error('Error rendering invitation:', invitation, err);
            return (
              <Paper
                key={invitation.id}
                sx={{ mb: 2, p: 2, backgroundColor: '#ffebee' }}
              >
                <Typography color="error">
                  Error rendering invitation {invitation.id}
                </Typography>
              </Paper>
            );
          }
        })}
      </List>


    </Box>
  );
};
