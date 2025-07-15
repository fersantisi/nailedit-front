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
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Person as PersonIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  HourglassEmpty as PendingIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import {
  ParticipationRequest,
  User,
  Project,
  ProjectPermissions,
} from '../../types';
import { participantApi } from '../../utils/communityApi';

interface PendingRequestsSectionProps {
  project: Project;
  currentUser: User;
  permissions: ProjectPermissions;
  onRequestProcessed?: () => void;
}

export const PendingRequestsSection: React.FC<PendingRequestsSectionProps> = ({
  project,
  currentUser,
  permissions,
  onRequestProcessed,
}) => {
  const [requests, setRequests] = useState<ParticipationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [requestToProcess, setRequestToProcess] =
    useState<ParticipationRequest | null>(null);
  const [actionType, setActionType] = useState<'accept' | 'reject'>('accept');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const isOwner = permissions.role === 'owner';

  useEffect(() => {
    if (isOwner) {
      fetchRequests();
    }
  }, [project.id, isOwner]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const requestsData = await participantApi.getParticipationRequests(
        project.id
      );

      // If user data is missing, fetch it separately
      const requestsWithUserData = await Promise.all(
        requestsData.map(async (request) => {
          if (!request.user || !request.user.username) {
            try {
              // Try to fetch user data separately
              const userResponse = await fetch(
                `${import.meta.env.VITE_SERVER_URL}/users/profile/${request.userId}`,
                {
                  method: 'GET',
                  credentials: 'include',
                }
              );

              if (userResponse.ok) {
                const userData = await userResponse.json();
                return { ...request, user: userData };
              } else {
                console.warn(
                  `Failed to fetch user data for userId ${request.userId}`
                );
                return {
                  ...request,
                  user: { username: `User ${request.userId}` },
                };
              }
            } catch (error) {
              console.error(
                `Error fetching user data for userId ${request.userId}:`,
                error
              );
              return {
                ...request,
                user: { username: `User ${request.userId}` },
              };
            }
          }
          return request;
        })
      );

      setRequests(requestsWithUserData);
    } catch (error) {
      console.error('Error fetching participation requests:', error);
      setError('Failed to load participation requests');
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (
    request: ParticipationRequest,
    action: 'accept' | 'reject'
  ) => {
    setRequestToProcess(request);
    setActionType(action);
    setActionDialogOpen(true);
  };

  const handleActionConfirm = async () => {
    if (!requestToProcess) return;

    try {
      setProcessing(true);
      setError(null);

      if (actionType === 'accept') {
        await participantApi.acceptParticipationRequest(
          project.id,
          requestToProcess.id
        );
        setSuccess(
          `${requestToProcess.user?.username} has been added to the project`
        );
      } else {
        await participantApi.rejectParticipationRequest(
          project.id,
          requestToProcess.id
        );
        setSuccess(
          `${requestToProcess.user?.username}'s request has been rejected`
        );
      }

      // Refresh requests list
      await fetchRequests();
      onRequestProcessed?.();
    } catch (error) {
      console.error('Error processing request:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to process request'
      );
    } finally {
      setProcessing(false);
      setActionDialogOpen(false);
      setRequestToProcess(null);
    }
  };

  const handleActionCancel = () => {
    setActionDialogOpen(false);
    setRequestToProcess(null);
  };

  // Don't render if user is not the owner
  if (!isOwner) {
    return null;
  }

  if (loading) {
    return (
      <Paper sx={{ p: 3, backgroundColor: '#3a3a3a', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  return (
    <>
      <Paper sx={{ p: 3, backgroundColor: '#3a3a3a', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <NotificationsIcon sx={{ mr: 2, color: '#79799a' }} />
          <Typography
            variant="h6"
            sx={{ color: '#e2e2e2', fontWeight: 'bold', flex: 1 }}
          >
            Pending Requests
          </Typography>
          <Chip
            label={requests.length}
            color={requests.length > 0 ? 'warning' : 'default'}
            size="small"
            sx={{ flexShrink: 0 }}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {requests.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <PendingIcon sx={{ fontSize: 48, color: '#79799a', mb: 2 }} />
            <Typography color="text.secondary">
              No pending requests at the moment
            </Typography>
          </Box>
        ) : (
          <List sx={{ width: '100%' }}>
            {requests.map((request, index) => (
              <React.Fragment key={request.id}>
                <ListItem
                  sx={{
                    backgroundColor: '#2e2e2e',
                    borderRadius: 1,
                    mb: 1,
                    border: '1px solid #f57c00',
                    px: 2,
                    py: 1,
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ backgroundColor: '#f57c00' }}>
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
                          flexWrap: 'wrap',
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            color: '#e2e2e2',
                            minWidth: 0,
                            wordBreak: 'break-word',
                          }}
                        >
                          {request.user?.username || 'Unknown User'}
                        </Typography>
                        <Chip
                          label="Pending"
                          color="warning"
                          size="small"
                          sx={{ backgroundColor: '#f57c00', flexShrink: 0 }}
                        />
                      </Box>
                    }
                  />
                  <Box sx={{ display: 'flex', gap: 1, ml: 1 }}>
                    <Tooltip title="Accept Request">
                      <IconButton
                        color="success"
                        onClick={() => handleActionClick(request, 'accept')}
                        size="small"
                        sx={{
                          backgroundColor: '#4caf50',
                          color: 'white',
                          '&:hover': { backgroundColor: '#45a049' },
                        }}
                      >
                        <CheckIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reject Request">
                      <IconButton
                        color="error"
                        onClick={() => handleActionClick(request, 'reject')}
                        size="small"
                        sx={{
                          backgroundColor: '#f44336',
                          color: 'white',
                          '&:hover': { backgroundColor: '#da190b' },
                        }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItem>
                {index < requests.length - 1 && <Divider sx={{ my: 1 }} />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      {/* Action Confirmation Dialog */}
      <Dialog
        open={actionDialogOpen}
        onClose={handleActionCancel}
        PaperProps={{
          sx: { backgroundColor: '#3a3a3a', color: '#e2e2e2' },
        }}
      >
        <DialogTitle>
          {actionType === 'accept' ? 'Accept' : 'Reject'} Participation Request
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {actionType}{' '}
            <strong>{requestToProcess?.user?.username}</strong>'s request to
            join this project?
          </Typography>
          {actionType === 'accept' && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              They will gain access to all project resources and be able to
              collaborate with the team.
            </Typography>
          )}
          {actionType === 'reject' && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              They will be notified that their request was declined and can
              request again later.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleActionCancel} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleActionConfirm}
            color={actionType === 'accept' ? 'success' : 'error'}
            variant="contained"
            disabled={processing}
          >
            {processing ? (
              <CircularProgress size={20} />
            ) : actionType === 'accept' ? (
              'Accept'
            ) : (
              'Reject'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
    </>
  );
};
