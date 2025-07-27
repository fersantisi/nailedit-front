import { NotificationSettings } from '../types';

const API_BASE_URL = import.meta.env.VITE_SERVER_URL;

const defaultFetchOptions = {
  credentials: 'include' as RequestCredentials,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const notificationApi = {
  // Get user's notification settings
  async getNotificationSettings(): Promise<NotificationSettings> {
    const response = await fetch(
      `${API_BASE_URL}/users/notification-settings`,
      {
        method: 'GET',
        ...defaultFetchOptions,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch notification settings');
    }

    return response.json();
  },

  // Update user's notification settings
  async updateNotificationSettings(
    settings: NotificationSettings
  ): Promise<NotificationSettings> {
    const response = await fetch(
      `${API_BASE_URL}/users/notification-settings`,
      {
        method: 'PUT',
        ...defaultFetchOptions,
        body: JSON.stringify(settings),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || 'Failed to update notification settings'
      );
    }

    return response.json();
  },
};
