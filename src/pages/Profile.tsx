import {
  Box,
  Card,
  Typography,
  CircularProgress,
  Alert,
  Avatar,
  Divider,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { Navbar } from '../components/ui/navbar';
import { NotificationSettings } from '../components/profile/NotificationSettings';
import { notificationApi } from '../utils/notificationApi';
import { useEffect, useState } from 'react';
import {
  User,
  NotificationSettings as NotificationSettingsType,
} from '../types';
import { useNavigate } from 'react-router-dom';

interface ProfileData {
  id: number;
  username: string;
  email: string;
  notificationSettings?: NotificationSettingsType;
}

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettingsType>({
      emailNotificationsEnabled: false,
      dueDateThreshold: 3,
    });
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationError, setNotificationError] = useState<string | null>(
    null
  );
  const [notificationSuccess, setNotificationSuccess] = useState<string | null>(
    null
  );
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch current user session
        const meResponse = await fetch(
          import.meta.env.VITE_SERVER_URL + '/users/me',
          {
            method: 'GET',
            credentials: 'include',
          }
        );

        if (!meResponse.ok) {
          setUser(null);
          navigate('/login');
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
          setProfileData(userData);

          // Set notification settings from user data or use defaults
          if (userData.notificationSettings) {
            setNotificationSettings(userData.notificationSettings);
          }
        } else {
          setUser(null);
          navigate('/login');
          return;
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('An error occurred while loading profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handlePasswordChange = async () => {
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    try {
      setPasswordLoading(true);
      setPasswordError(null);
      setPasswordSuccess(null);

      const response = await fetch(
        import.meta.env.VITE_SERVER_URL + '/users/password',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
          }),
        }
      );

      if (response.ok) {
        setPasswordSuccess('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setTimeout(() => {
          setPasswordDialogOpen(false);
          setPasswordSuccess(null);
        }, 2000);
      } else {
        const errorData = await response.json();
        setPasswordError(errorData.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError('An error occurred while changing password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleClosePasswordDialog = () => {
    setPasswordDialogOpen(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setPasswordError(null);
    setPasswordSuccess(null);
  };

  const handleNotificationSettingsUpdate = async () => {
    try {
      setNotificationLoading(true);
      setNotificationError(null);
      setNotificationSuccess(null);

      const updatedSettings =
        await notificationApi.updateNotificationSettings(notificationSettings);

      setNotificationSuccess('Notification settings updated successfully!');
      setNotificationSettings(updatedSettings);

      // Update the profile data with new settings
      if (profileData) {
        setProfileData({
          ...profileData,
          notificationSettings: updatedSettings,
        });
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
      setNotificationError(
        error instanceof Error
          ? error.message
          : 'An error occurred while updating notification settings'
      );
    } finally {
      setNotificationLoading(false);
    }
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
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <>
        <Navbar user={user} />
        <Box
          sx={{
            minHeight: 'calc(100vh - 70px)',
            display: 'flex',
            flexDirection: 'column',
            pt: 4,
            px: '15px',
            width: '100%',
            gap: '20px',
            overflow: 'hidden',
            overflowX: 'hidden',
          }}
        >
          <Alert severity="error">{error}</Alert>
        </Box>
      </>
    );
  }

  return (
    <>
      <Navbar user={user} />
      <Box
        sx={{
          minHeight: 'calc(100vh - 70px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          px: '15px',
          width: '100%',
          overflow: 'hidden',
          overflowX: 'hidden',
        }}
      >
        <Card
          variant="outlined"
          sx={{
            maxWidth: '600px',
            padding: '30px',
            backgroundColor: 'secondary.main',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              mb: 3,
            }}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'primary.main',
                fontSize: '2rem',
                fontWeight: 'bold',
              }}
            >
              {profileData?.username?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                Profile
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage your account information
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Profile Information */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Username */}
            <Box>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Username
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                {profileData?.username || 'N/A'}
              </Typography>
            </Box>

            {/* Email */}
            <Box>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Email
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                {profileData?.email || 'N/A'}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Notification Settings */}
          <NotificationSettings
            settings={notificationSettings}
            onSettingsChange={setNotificationSettings}
            onSave={handleNotificationSettingsUpdate}
            loading={notificationLoading}
            error={notificationError}
            success={notificationSuccess}
          />

          <Divider sx={{ my: 3 }} />

          {/* Actions */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Button
              variant="outlined"
              startIcon={<LockIcon />}
              onClick={() => setPasswordDialogOpen(true)}
            >
              Change Password
            </Button>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
            <Button
              variant="contained"
              startIcon={<PersonIcon />}
              onClick={() => navigate('/logout')}
            >
              Logout
            </Button>
          </Box>
        </Card>

        {/* Password Change Dialog */}
        <Dialog
          open={passwordDialogOpen}
          onClose={handleClosePasswordDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Change Password</DialogTitle>
          <DialogContent>
            <Box
              sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}
            >
              {passwordError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {passwordError}
                </Alert>
              )}
              {passwordSuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {passwordSuccess}
                </Alert>
              )}

              <TextField
                label="Current Password"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
                fullWidth
                required
              />

              <TextField
                label="New Password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                fullWidth
                required
                helperText="Password must be at least 6 characters long"
              />

              <TextField
                label="Confirm New Password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
                fullWidth
                required
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleClosePasswordDialog}
              disabled={passwordLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePasswordChange}
              variant="contained"
              disabled={
                passwordLoading ||
                !passwordData.currentPassword ||
                !passwordData.newPassword ||
                !passwordData.confirmPassword
              }
            >
              {passwordLoading ? (
                <CircularProgress size={20} />
              ) : (
                'Change Password'
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};
