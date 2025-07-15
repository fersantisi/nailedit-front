import {
  Project,
  ParticipationRequest,
  Participant,
  CommunitySearchResponse,
  ProjectPermissions,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_SERVER_URL;

const defaultFetchOptions = {
  credentials: 'include' as RequestCredentials,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Community Discovery Endpoints
export const communityApi = {
  // Browse all projects in the community with pagination
  async browseProjects(
    page: number = 1,
    limit: number = 3
  ): Promise<CommunitySearchResponse> {
    const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    try {
      const response = await fetch(
        `${API_BASE_URL}/community/browse?${searchParams}`,
        {
          method: 'GET',
          ...defaultFetchOptions,
        }
      );

      if (!response.ok) {
        let errorMessage = 'Failed to fetch community projects';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // If we can't parse the error response, use the status text
          errorMessage = `${errorMessage} (${response.status}: ${response.statusText})`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Validate the new paginated response structure
      if (!data || typeof data !== 'object' || !Array.isArray(data.results)) {
        console.warn(
          'Browse response is not in expected paginated format:',
          data
        );
        // Fallback for old format compatibility
        if (Array.isArray(data)) {
          return {
            projects: data,
            total: data.length,
            page: 1,
            limit: data.length,
            totalPages: 1,
          };
        }
        throw new Error('Invalid browse response format');
      }

      // ENHANCEMENT: Enrich browse results with participant data if missing
      // This ensures member counts display correctly in ProjectCard components
      const projectsArray = data.results;
      const hasParticipantData =
        projectsArray.length > 0 && projectsArray[0].participants !== undefined;

      if (!hasParticipantData && projectsArray.length > 0) {
        const enrichedProjects = await Promise.all(
          projectsArray.map(async (project: any) => {
            try {
              const response = await fetch(
                `${API_BASE_URL}/project/${project.id}/participants`,
                {
                  method: 'GET',
                  ...defaultFetchOptions,
                }
              );

              const participants = response.ok ? await response.json() : [];
              return {
                ...project,
                participants: participants,
              };
            } catch (error) {
              console.warn(
                `Failed to fetch participants for browse project ${project.id}:`,
                error
              );
              return {
                ...project,
                participants: [],
              };
            }
          })
        );

        return {
          projects: enrichedProjects,
          total: data.total || enrichedProjects.length,
          page: data.page || page,
          limit: data.limit || limit,
          totalPages:
            data.totalPages ||
            Math.ceil((data.total || enrichedProjects.length) / limit),
        };
      }

      // Return the paginated response in the expected format
      return {
        projects: projectsArray,
        total: data.total || projectsArray.length,
        page: data.page || page,
        limit: data.limit || limit,
        totalPages:
          data.totalPages ||
          Math.ceil((data.total || projectsArray.length) / limit),
      };
    } catch (error) {
      console.error('Error in browseProjects:', error);
      throw error;
    }
  },

  // Search projects by name/keywords
  async searchProjects(
    query: string,
    page: number = 1,
    limit: number = 3
  ): Promise<CommunitySearchResponse> {
    const searchParams = new URLSearchParams({
      q: query, // Backend uses 'q' parameter for search query
      page: page.toString(),
      limit: limit.toString(),
    });

    try {
      const response = await fetch(
        `${API_BASE_URL}/community/search?${searchParams}`,
        {
          method: 'GET',
          ...defaultFetchOptions,
        }
      );

      if (!response.ok) {
        let errorMessage = 'Failed to search projects';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // If we can't parse the error response, use the status text
          errorMessage = `${errorMessage} (${response.status}: ${response.statusText})`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Validate the response structure
      if (!data || typeof data !== 'object' || !Array.isArray(data.results)) {
        console.warn(
          'Search response is not in expected paginated format:',
          data
        );
        throw new Error('Invalid search response format');
      }

      // Backend now properly filters results, so no client-side filtering needed
      const projectsArray = data.results;

      // ENHANCEMENT: Enrich search results with participant data if missing
      // This ensures member counts display correctly in ProjectCard components
      const enrichedProjects = await Promise.all(
        projectsArray.map(async (project: any) => {
          // If project already has participants data, use it
          if (project.participants && Array.isArray(project.participants)) {
            return project;
          }

          // Otherwise, fetch participant data
          try {
            const response = await fetch(
              `${API_BASE_URL}/project/${project.id}/participants`,
              {
                method: 'GET',
                ...defaultFetchOptions,
              }
            );

            const participants = response.ok ? await response.json() : [];
            return {
              ...project,
              participants: participants,
            };
          } catch (error) {
            console.warn(
              `Failed to fetch participants for project ${project.id}:`,
              error
            );
            // Return project with empty participants array as fallback
            return {
              ...project,
              participants: [],
            };
          }
        })
      );

      // Return the paginated response in the expected format
      return {
        projects: enrichedProjects,
        total: data.total || enrichedProjects.length,
        page: data.page || page,
        limit: data.limit || limit,
        totalPages:
          data.totalPages ||
          Math.ceil((data.total || enrichedProjects.length) / limit),
      };
    } catch (error) {
      console.error('Error in searchProjects:', error);
      throw error;
    }
  },

  // Request to join a project
  async requestParticipation(
    projectId: number,
    userId: number
  ): Promise<{ message: string }> {
    const response = await fetch(
      `${API_BASE_URL}/community/projects/${projectId}/request`,
      {
        method: 'POST',
        ...defaultFetchOptions,
        body: JSON.stringify({ userId }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send participation request');
    }

    return response.json();
  },

  // Check project permissions for current user
  async checkProjectPermissions(
    projectId: number
  ): Promise<ProjectPermissions> {
    const response = await fetch(
      `${API_BASE_URL}/project/${projectId}/permissions`,
      {
        method: 'GET',
        ...defaultFetchOptions,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to check project permissions');
    }

    return response.json();
  },
};

// Project Participant Management Endpoints
export const participantApi = {
  // Get all participants for a project
  async getProjectParticipants(projectId: number): Promise<Participant[]> {
    const response = await fetch(
      `${API_BASE_URL}/project/${projectId}/participants`,
      {
        method: 'GET',
        ...defaultFetchOptions,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch project participants');
    }

    return response.json();
  },

  // Get all participation requests for a project
  async getParticipationRequests(
    projectId: number
  ): Promise<ParticipationRequest[]> {
    const response = await fetch(
      `${API_BASE_URL}/project/${projectId}/participationRequests`,
      {
        method: 'GET',
        ...defaultFetchOptions,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch participation requests');
    }

    return response.json();
  },

  // Accept a participation request
  async acceptParticipationRequest(
    projectId: number,
    requestId: number
  ): Promise<{ message: string }> {
    const response = await fetch(
      `${API_BASE_URL}/project/${projectId}/participationRequest/${requestId}/accept`,
      {
        method: 'POST',
        ...defaultFetchOptions,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || 'Failed to accept participation request'
      );
    }

    return response.json();
  },

  // Reject a participation request
  async rejectParticipationRequest(
    projectId: number,
    requestId: number
  ): Promise<{ message: string }> {
    const response = await fetch(
      `${API_BASE_URL}/project/${projectId}/participationRequest/${requestId}/reject`,
      {
        method: 'POST',
        ...defaultFetchOptions,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || 'Failed to reject participation request'
      );
    }

    return response.json();
  },

  // Remove a participant from a project
  async removeParticipant(
    projectId: number,
    participantId: number
  ): Promise<{ message: string }> {
    const response = await fetch(
      `${API_BASE_URL}/project/${projectId}/participants/${participantId}/remove`,
      {
        method: 'DELETE',
        ...defaultFetchOptions,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to remove participant');
    }

    return response.json();
  },
};

// Utility functions for checking user status
export const communityUtils = {
  // Check if user is already a participant in a project
  isParticipant(userId: number, participants: Participant[] = []): boolean {
    return participants.some((p) => p.userId === userId);
  },

  // Check if user has a pending request for a project
  hasPendingRequest(
    userId: number,
    requests: ParticipationRequest[] = []
  ): boolean {
    return requests.some((r) => r.userId === userId);
  },

  // Check if user is the owner of a project
  isOwner(userId: number, project: Project): boolean {
    return project.userId === userId;
  },

  // Get user's request status for a project
  getUserRequestStatus(
    userId: number,
    project: Project
  ): 'owner' | 'member' | 'pending' | 'none' {
    if (this.isOwner(userId, project)) return 'owner';
    if (this.isParticipant(userId, project.participants)) return 'member';
    if (this.hasPendingRequest(userId, project.participationRequests))
      return 'pending';
    return 'none';
  },

  // Safe version for community browsing (limited project data)
  getCommunityUserStatus(
    userId: number,
    project: Project
  ): 'owner' | 'unknown' {
    // For community browsing, we only have basic project info
    // We can only determine ownership, not participation status
    if (this.isOwner(userId, project)) return 'owner';
    return 'unknown'; // Could be member, pending, or none - we don't know without full data
  },

  // Get accurate project permissions using the new backend endpoint
  async getProjectPermissions(projectId: number): Promise<ProjectPermissions> {
    try {
      return await communityApi.checkProjectPermissions(projectId);
    } catch (error) {
      console.error('Failed to check project permissions:', error);
      return {
        projectId,
        userId: 0,
        hasAccess: false,
        role: 'none',
      };
    }
  },

  // Check if current user has a pending request for a project
  async checkPendingRequest(projectId: number): Promise<boolean> {
    try {
      // First, let's try to get the current user's ID from a /users/me call
      const meResponse = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!meResponse.ok) {
        return false;
      }

      const meData = await meResponse.json();
      const currentUserId = meData.userId;

      // Method 1: Try to get participation requests for the project
      // This works if current user is the project owner
      try {
        const requests =
          await participantApi.getParticipationRequests(projectId);
        // Check if current user has a pending request
        return requests.some((request) => request.userId === currentUserId);
      } catch (error) {
        // If we can't get requests (not owner), we can't reliably check for pending requests
        // The backend would need to provide an endpoint like GET /users/me/participation-requests
        // or include pending request status in the permissions endpoint
        console.warn(
          'Cannot check pending requests for non-owner user. Consider enhancing the permissions endpoint.'
        );
        return false;
      }
    } catch (error) {
      console.error('Failed to check pending requests:', error);
      return false;
    }
  },

  // Get comprehensive project status including pending requests
  async getProjectStatus(projectId: number): Promise<{
    permissions: ProjectPermissions;
    hasPendingRequest: boolean;
    uiStatus: 'owner' | 'member' | 'pending' | 'none';
  }> {
    try {
      const permissions = await this.getProjectPermissions(projectId);

      // If user has access, they're either owner or member
      if (permissions.hasAccess) {
        return {
          permissions,
          hasPendingRequest: false,
          uiStatus: permissions.role === 'owner' ? 'owner' : 'member',
        };
      }

      // If no access, check for pending requests
      const hasPendingRequest = await this.checkPendingRequest(projectId);

      return {
        permissions,
        hasPendingRequest,
        uiStatus: hasPendingRequest ? 'pending' : 'none',
      };
    } catch (error) {
      console.error('Failed to get project status:', error);
      return {
        permissions: {
          projectId,
          userId: 0,
          hasAccess: false,
          role: 'none',
        },
        hasPendingRequest: false,
        uiStatus: 'none',
      };
    }
  },

  // Convert backend permissions to UI status
  getUIStatusFromPermissions(
    permissions: ProjectPermissions
  ): 'owner' | 'member' | 'none' {
    if (!permissions.hasAccess) return 'none';
    if (permissions.role === 'owner') return 'owner';
    if (permissions.role === 'participant') return 'member';
    return 'none';
  },
};
