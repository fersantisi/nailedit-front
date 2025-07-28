import { ProjectInvitation, InvitationResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_SERVER_URL;

const defaultFetchOptions = {
  credentials: 'include' as RequestCredentials,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const invitationApi = {
  // Get all invitations received by the current user
  async getReceivedInvitations(): Promise<InvitationResponse> {
    const response = await fetch(`${API_BASE_URL}/community/invites`, {
      method: 'GET',
      ...defaultFetchOptions,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch invitations:', response.status, errorText);
      throw new Error(
        `Failed to fetch received invitations: ${response.status} ${errorText}`
      );
    }

    const data = await response.json();
    console.log('Raw invitation response:', data);
    return data;
  },

  // Get all invitations sent by the current user
  async getSentInvitations(): Promise<InvitationResponse> {
    const response = await fetch(`${API_BASE_URL}/community/sent-invites`, {
      method: 'GET',
      ...defaultFetchOptions,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        'Failed to fetch sent invitations:',
        response.status,
        errorText
      );
      throw new Error(
        `Failed to fetch sent invitations: ${response.status} ${errorText}`
      );
    }

    const data = await response.json();
    console.log('Raw sent invitations response:', data);
    return data;
  },

  // Send invitation to a user for a project
  async sendInvitation(
    projectId: number,
    username: string
  ): Promise<ProjectInvitation> {
    const response = await fetch(
      `${API_BASE_URL}/community/projects/${projectId}/invite`,
      {
        method: 'POST',
        ...defaultFetchOptions,
        body: JSON.stringify({ toUser: username }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send invitation');
    }

    return response.json();
  },

  // Accept an invitation
  async acceptInvitation(inviteId: number): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/community/invites/${inviteId}/accept`,
      {
        method: 'POST',
        ...defaultFetchOptions,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to accept invitation');
    }
  },

  // Reject an invitation
  async rejectInvitation(inviteId: number): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/community/invites/${inviteId}/reject`,
      {
        method: 'POST',
        ...defaultFetchOptions,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to reject invitation');
    }
  },

  // Delete an invitation
  async deleteInvitation(inviteId: number): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/community/invites/${inviteId}`,
      {
        method: 'DELETE',
        ...defaultFetchOptions,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete invitation');
    }
  },
};
