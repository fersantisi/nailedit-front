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
} from '@mui/material';
import {
  Person as PersonIcon,
  Delete as DeleteIcon,
  Group as GroupIcon,
  Star as StarIcon,
  PersonAdd as InviteIcon,
} from '@mui/icons-material';
import { Participant, User, Project, ProjectPermissions } from '../../types';
import { participantApi } from '../../utils/communityApi';

interface TeamMembersSectionProps {
  project: Project;
  currentUser: User;
  permissions: ProjectPermissions;
  onParticipantRemoved?: () => void;
  onInvite?: () => void;
}

export const TeamMembersSection: React.FC<TeamMembersSectionProps> = ({
  project,
  currentUser,
  permissions,
  onParticipantRemoved,
  onInvite,
}) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [participantToRemove, setParticipantToRemove] =
    useState<Participant | null>(null);
  const [removing, setRemoving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const isOwner = permissions.role === 'owner';

  useEffect(() => {
    fetchParticipants();
  }, [project.id]);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      setError(null);
      const participantsData = await participantApi.getProjectParticipants(
        project.id
      );

      // If user data is missing, fetch it separately
      const participantsWithUserData = await Promise.all(
        participantsData.map(async (participant) => {
          if (!participant.user || !participant.user.username) {
            try {
              // Try to fetch user data separately
              const userResponse = await fetch(
                `${import.meta.env.VITE_SERVER_URL}/users/profile/${participant.userId}`,
                {
                  method: 'GET',
                  credentials: 'include',
                }
              );

              if (userResponse.ok) {
                const userData = await userResponse.json();
                return { ...participant, user: userData };
              } else {
                console.warn(
                  `Failed to fetch user data for userId ${participant.userId}`
                );
                return {
                  ...participant,
                  user: { username: `User ${participant.userId}` },
                };
              }
            } catch (error) {
              console.error(
                `Error fetching user data for userId ${participant.userId}:`,
                error
              );
              return {
                ...participant,
                user: { username: `User ${participant.userId}` },
              };
            }
          }
          return participant;
        })
      );

      setParticipants(participantsWithUserData);
    } catch (error) {
      console.error('Error fetching participants:', error);
      setError('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  // Function to get owner name
  const getOwnerName = () => {
    if (isOwner) {
      return currentUser.username;
    }

    // Try to get owner name from various sources
    if (project.owner?.username) {
      return project.owner.username;
    }

    // Try to find owner in participants list
    const ownerParticipant = participants.find(
      (p) => p.userId === project.userId
    );
    if (ownerParticipant?.user?.username) {
      return ownerParticipant.user.username;
    }

    // Fallback to fetching owner data if we have project.userId
    if (project.userId && !isOwner) {
      // This will be handled by a useEffect
      return 'Loading...';
    }

    return 'Project Owner';
  };

  // State for owner info
  // TODO: Backend should provide owner info in the project data
  // The /project/${id} endpoint should return:
  // - userId: number (owner ID)
  // - owner: User (populated owner object with username, etc.)
  // This would eliminate the need for complex owner fetching logic

  // Get the display name for the owner
  const getOwnerDisplayName = () => {
    if (isOwner) {
      return currentUser.username;
    }

    if (project.owner?.username) {
      return project.owner.username;
    }

    // Try to find owner in participants list using project.userId
    const ownerParticipant = participants.find(
      (p) => p.userId === project.userId
    );
    if (ownerParticipant?.user?.username) {
      return ownerParticipant.user.username;
    }

    // Try to find owner in participants list by looking for owner role
    const ownerByRole = participants.find((p: any) => {
      return p.role === 'owner' || p.permissions?.role === 'owner';
    });
    if (ownerByRole?.user?.username) {
      return ownerByRole.user.username;
    }

    return 'Project Owner';
  };

  const handleRemoveClick = (participant: Participant) => {
    // Additional safety check before opening dialog
    if (!isOwner) {
      setError('Only project owners can remove participants');
      return;
    }

    if (!project.id) {
      setError('Invalid project - cannot remove participants');
      return;
    }

    setParticipantToRemove(participant);
    setRemoveDialogOpen(true);
  };

  const handleRemoveConfirm = async () => {
    if (!participantToRemove) return;

    // Check if user has permission to remove participants
    if (!isOwner) {
      setError('Only project owners can remove participants');
      return;
    }

    try {
      setRemoving(true);
      setError(null);

      try {
        // Try removing with participant ID first
        await participantApi.removeParticipant(
          project.id,
          participantToRemove.id
        );
      } catch (error) {
        console.log('Failed with participant ID, trying with user ID...');

        // If that fails, try with user ID (some APIs might expect this)
        await participantApi.removeParticipant(
          project.id,
          participantToRemove.userId
        );
      }

      setSuccess(
        `${participantToRemove.user?.username} has been removed from the project`
      );

      // Refresh participants list
      await fetchParticipants();
      onParticipantRemoved?.();
    } catch (error) {
      console.error('Error removing participant:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to remove participant'
      );
    } finally {
      setRemoving(false);
      setRemoveDialogOpen(false);
      setParticipantToRemove(null);
    }
  };

  const handleRemoveCancel = () => {
    setRemoveDialogOpen(false);
    setParticipantToRemove(null);
  };

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
          <GroupIcon sx={{ mr: 2, color: '#79799a' }} />
          <Typography
            variant="h6"
            sx={{ color: '#e2e2e2', fontWeight: 'bold', flex: 1 }}
          >
            Team Members
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={participants.length + 1}
              color="primary"
              size="small"
              sx={{ flexShrink: 0 }}
            />
            {permissions.role === 'owner' && onInvite && (
              <Button
                variant="outlined"
                startIcon={<InviteIcon />}
                onClick={onInvite}
                size="small"
                sx={{ 
                  color: '#e2e2e2', 
                  borderColor: '#79799a',
                  '&:hover': {
                    borderColor: '#e2e2e2',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)'
                  }
                }}
              >
                Invite
              </Button>
            )}
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <List sx={{ width: '100%' }}>
          {/* Project Owner - Always shown */}
          <ListItem
            sx={{
              backgroundColor: '#2e2e2e',
              borderRadius: 1,
              mb: 1,
              border: '1px solid #79799a',
              px: 2,
              py: 1,
            }}
          >
            <ListItemAvatar>
              <Avatar sx={{ backgroundColor: '#79799a' }}>
                <StarIcon />
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
                    {getOwnerDisplayName()}
                  </Typography>
                  <Chip
                    label="Owner"
                    color="primary"
                    size="small"
                    sx={{ backgroundColor: '#79799a', flexShrink: 0 }}
                  />
                </Box>
              }
            />
          </ListItem>

          {/* Team Members */}
          {participants.map((participant) => (
            <ListItem
              key={participant.id}
              sx={{
                backgroundColor: '#2e2e2e',
                borderRadius: 1,
                mb: 1,
                px: 2,
                py: 1,
              }}
              secondaryAction={
                isOwner ? (
                  <Tooltip title="Remove from project">
                    <IconButton
                      edge="end"
                      color="error"
                      onClick={() => handleRemoveClick(participant)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Tooltip title="Only project owners can remove participants">
                    <IconButton
                      edge="end"
                      color="default"
                      disabled
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                )
              }
            >
              <ListItemAvatar>
                <Avatar sx={{ backgroundColor: '#4c4a52' }}>
                  <PersonIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#e2e2e2',
                      minWidth: 0,
                      wordBreak: 'break-word',
                    }}
                  >
                    {participant.user?.username || 'Unknown User'}
                  </Typography>
                }
              />
            </ListItem>
          ))}

          {/* Show message when only owner (no participants) */}
          {participants.length === 0 && (
            <ListItem>
              <ListItemText
                primary={
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#b0b0b0',
                      textAlign: 'center',
                      fontStyle: 'italic',
                    }}
                  >
                    No team members yet. Share your project to get
                    collaborators!
                  </Typography>
                }
              />
            </ListItem>
          )}
        </List>
      </Paper>

      {/* Remove Participant Dialog */}
      <Dialog
        open={removeDialogOpen}
        onClose={handleRemoveCancel}
        PaperProps={{
          sx: { backgroundColor: '#3a3a3a', color: '#e2e2e2' },
        }}
      >
        <DialogTitle>Remove Team Member</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove{' '}
            <strong>{participantToRemove?.user?.username}</strong> from this
            project?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone. They will lose access to all project
            resources.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRemoveCancel} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleRemoveConfirm}
            color="error"
            variant="contained"
            disabled={removing}
          >
            {removing ? <CircularProgress size={20} /> : 'Remove'}
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
