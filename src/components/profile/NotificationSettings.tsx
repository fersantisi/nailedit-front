import React, { useState } from 'react';
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Slider,
  Chip,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import { NotificationSettings as NotificationSettingsType } from '../../types';

interface NotificationSettingsProps {
  settings: NotificationSettingsType;
  onSettingsChange: (settings: NotificationSettingsType) => void;
  onSave: () => Promise<void>;
  loading: boolean;
  error: string | null;
  success: string | null;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  settings,
  onSettingsChange,
  onSave,
  loading,
  error,
  success,
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <NotificationsIcon color="primary" />
        <Typography variant="h6" component="h2">
          Email Notifications
        </Typography>
      </Box>

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

      {/* Email Notifications Toggle */}
      <Box>
        <FormControlLabel
          control={
            <Switch
              checked={settings.emailNotificationsEnabled}
              onChange={(e) =>
                onSettingsChange({
                  ...settings,
                  emailNotificationsEnabled: e.target.checked,
                })
              }
              disabled={loading}
            />
          }
          label={
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                Enable Email Notifications
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Receive email notifications for upcoming due dates
              </Typography>
            </Box>
          }
        />
      </Box>

      {/* Due Date Threshold */}
      {settings.emailNotificationsEnabled && (
        <Box>
          <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 1 }}>
            Notification Threshold
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Get notified when items are due within:
          </Typography>

          <Box sx={{ px: 2, mb: 2 }}>
            <Slider
              value={settings.dueDateThreshold}
              onChange={(_, value) =>
                onSettingsChange({
                  ...settings,
                  dueDateThreshold: value as number,
                })
              }
              min={1}
              max={14}
              step={1}
              marks={[
                { value: 1, label: '1 day' },
                { value: 3, label: '3 days' },
                { value: 7, label: '1 week' },
                { value: 14, label: '2 weeks' },
              ]}
              valueLabelDisplay="auto"
              disabled={loading}
            />
          </Box>

          <Chip
            label={`${settings.dueDateThreshold} day${settings.dueDateThreshold > 1 ? 's' : ''} before due date`}
            color="primary"
            variant="outlined"
            size="small"
          />
        </Box>
      )}

      {/* Save Button */}
      <Button
        variant="contained"
        onClick={onSave}
        disabled={loading}
        startIcon={
          loading ? <CircularProgress size={20} /> : <NotificationsIcon />
        }
        sx={{ alignSelf: 'flex-start', mt: 1 }}
      >
        {loading ? 'Saving...' : 'Save Notification Settings'}
      </Button>
    </Box>
  );
};
