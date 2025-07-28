import {
  Box,
  Alert,
  Container,
  CircularProgress,
  Button,
  Typography,
} from '@mui/material';
import { Navbar } from '../components/ui/navbar';
import { useEffect, useState } from 'react';
import {
  Goal,
  User,
  Project as ProjectType,
  ProjectPermissions,
} from '../types';
import { useParams, useNavigate } from 'react-router-dom';
import NotesModal from '../components/project/NotesModal';
import { ProjectHeader } from '../components/project/ProjectHeader';
import { GoalsSection } from '../components/project/GoalsSection';
import { ProjectStockSection } from '../components/project/ProjectStockSection';
import { ProjectFilesSection } from '../components/project/ProjectFilesSection';
import { TeamMembersSection } from '../components/community/TeamMembersSection';
import { PendingRequestsSection } from '../components/community/PendingRequestsSection';
import { InviteUserDialog } from '../components/project/InviteUserDialog';
import { communityUtils } from '../utils/communityApi';
import { formatDate, getPriorityColor } from '../utils/dateUtils';

export const Project = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [goals, setGoals] = useState<Goal[] | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectData, setProjectData] = useState<ProjectType | null>(null);
  const [permissions, setPermissions] = useState<ProjectPermissions | null>(
    null
  );
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  // Notes modal state
  const [notesModal, setNotesModal] = useState<{
    open: boolean;
    projectId?: number;
    goalId?: number;
    taskId?: number;
    title: string;
  }>({
    open: false,
    title: '',
  });

  const openNotesModal = (
    entityType: 'goal' | 'task',
    entityId: number,
    entityName: string,
    goalId?: number
  ) => {
    const modalData: any = {
      open: true,
      title: `Notes for ${entityName}`,
      projectId: parseInt(id!),
    };

    if (entityType === 'goal') {
      modalData.goalId = entityId;
    } else {
      modalData.taskId = entityId;
      if (goalId) modalData.goalId = goalId;
    }

    setNotesModal(modalData);
  };

  const closeNotesModal = () => {
    setNotesModal((prev) => ({ ...prev, open: false }));
  };

  // Add a function to open project notes modal
  const openProjectNotesModal = () => {
    setNotesModal({
      open: true,
      projectId: parseInt(id!),
      title: 'Project Notes',
    });
  };

  const handleInviteClick = () => {
    setInviteDialogOpen(true);
  };

  const handleInvitationSent = () => {
    // Refresh the page to show updated participant list
    window.location.reload();
  };

  useEffect(() => {
    if (!id) {
      setError('Project ID is not defined');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user data
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
        } else {
          setUser(null);
          navigate('/login');
          return;
        }

        // Check project permissions
        try {
          const projectPermissions = await communityUtils.getProjectPermissions(
            parseInt(id)
          );
          setPermissions(projectPermissions);

          // Fetch project data first to check if it's public
          const projectResponse = await fetch(
            import.meta.env.VITE_SERVER_URL + '/project/' + id,
            {
              method: 'GET',
              credentials: 'include',
            }
          );

          if (projectResponse.ok) {
            const projectInfo = await projectResponse.json();
            console.log('Project data:', projectInfo);
            setProjectData(projectInfo);

            // Allow access if user has permissions OR if project is public
            if (!projectPermissions.hasAccess && projectInfo.privacy) {
              setError("You don't have access to this private project");
              setLoading(false);
              setPermissionsLoading(false);
              return;
            }

            // For public projects without access, create view-only permissions
            if (!projectPermissions.hasAccess && !projectInfo.privacy) {
              setPermissions({
                ...projectPermissions,
                hasAccess: true,
                role: 'viewer' as any,
              });
            }
          } else {
            setError('Failed to load project data');
            setLoading(false);
            setPermissionsLoading(false);
            return;
          }
        } catch (error) {
          console.error('Failed to check permissions:', error);
          setError('Failed to verify project access');
          setLoading(false);
          setPermissionsLoading(false);
          return;
        } finally {
          setPermissionsLoading(false);
        }

        // Fetch goals and tasks
        const goalsResponse = await fetch(
          import.meta.env.VITE_SERVER_URL + '/project/' + id + '/goals',
          {
            method: 'GET',
            credentials: 'include',
          }
        );

        if (goalsResponse.ok) {
          const goalsData = await goalsResponse.json();
          console.log('Goals data:', goalsData);
          const goalsWithTasks = await Promise.all(
            goalsData.map(async (goal: Goal) => {
              const tasksResponse = await fetch(
                import.meta.env.VITE_SERVER_URL +
                  '/project/' +
                  id +
                  '/goal/' +
                  goal.id +
                  '/tasks',
                {
                  method: 'GET',
                  credentials: 'include',
                }
              );

              if (tasksResponse.ok) {
                const tasks = await tasksResponse.json();
                console.log(`Tasks for goal ${goal.id}:`, tasks);
                return { ...goal, tasks };
              }

              return { ...goal, tasks: [] };
            })
          );
          console.log('Final goals with tasks:', goalsWithTasks);
          setGoals(goalsWithTasks);
        } else {
          setGoals([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load project data');
        setUser(null);
        setGoals(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

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
        <Container
          sx={{ pt: 3, pb: '80px', overflow: 'hidden', overflowX: 'hidden' }}
        >
          <Alert severity="error">{error}</Alert>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar user={user} />
      {console.log('Rendering with projectData:', projectData)}
      {console.log('Rendering with goals:', goals)}
      <Box
        sx={{
          minHeight: 'calc(100vh - 70px)',
          display: 'flex',
          flexDirection: 'column',
          pt: 3,
          px: '15px',
          width: '100%',
          gap: '20px',
          overflow: 'hidden',
          overflowX: 'hidden',
        }}
      >
        {projectData && permissions && (
          <ProjectHeader
            projectId={id!}
            projectData={projectData}
            permissions={permissions}
            formatDate={formatDate}
            onOpenProjectNotes={openProjectNotesModal}
          />
        )}

        {goals && (
          <GoalsSection
            goals={goals}
            projectId={id!}
            permissions={permissions!}
            formatDate={formatDate}
            getPriorityColor={getPriorityColor}
            onOpenNotes={openNotesModal}
          />
        )}

        {projectData && permissions && (
          <ProjectStockSection projectId={id!} permissions={permissions} />
        )}

        <ProjectFilesSection projectId={id!} permissions={permissions!} />

        {/* Participant Management - Show based on permissions */}
        {projectData &&
          user &&
          permissions &&
          permissions.role !== 'viewer' && (
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
                maxWidth: '1200px',
                mx: 'auto',
                width: '100%',
              }}
            >
              {/* Team Members - Show to all project members */}
              <Box sx={{ flex: 1, minWidth: '300px', maxWidth: '600px' }}>
                <TeamMembersSection
                  project={projectData}
                  currentUser={user}
                  permissions={permissions}
                  onParticipantRemoved={() => {
                    // Refresh project data to update participant count
                    window.location.reload();
                  }}
                  onInvite={handleInviteClick}
                />
              </Box>

              {/* Pending Requests - Only show to owners */}
              {permissions.role === 'owner' && (
                <Box sx={{ flex: 1, minWidth: '300px', maxWidth: '600px' }}>
                  <PendingRequestsSection
                    project={projectData}
                    currentUser={user}
                    permissions={permissions}
                    onRequestProcessed={() => {
                      // Refresh project data to update participant count
                      window.location.reload();
                    }}
                  />
                </Box>
              )}
            </Box>
          )}
      </Box>

      <NotesModal
        open={notesModal.open}
        onClose={closeNotesModal}
        projectId={notesModal.projectId}
        goalId={notesModal.goalId}
        taskId={notesModal.taskId}
        title={notesModal.title}
        userName={user?.username || ''}
      />

      <InviteUserDialog
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
        projectId={parseInt(id!)}
        projectName={projectData?.name || ''}
        onInvitationSent={handleInvitationSent}
      />
    </>
  );
};
