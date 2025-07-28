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
      throw new Error('Failed to fetch received invitations');
    }

    return response.json();
  },

  // Get all invitations sent by the current user
  async getSentInvitations(): Promise<InvitationResponse> {
    const response = await fetch(`${API_BASE_URL}/community/sent-invites`, {
      method: 'GET',
      ...defaultFetchOptions,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch sent invitations');
    }

    return response.json();
  },

  // Send invitation to a user for a project
  async sendInvitation(
    projectId: number,
    toUserId: number
  ): Promise<ProjectInvitation> {
    const response = await fetch(
      `${API_BASE_URL}/community/projects/${projectId}/invite`,
      {
        method: 'POST',
        ...defaultFetchOptions,
        body: JSON.stringify({ toUser: toUserId }),
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
        method: 'PUT',
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
        method: 'PUT',
        ...defaultFetchOptions,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to reject invitation');
    }
  },

  // Delete an invitation
  async deleteInvitation(inviteId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/community/invites`, {
      method: 'DELETE',
      ...defaultFetchOptions,
      body: JSON.stringify({ inviteID: inviteId }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete invitation');
    }
  },
};
